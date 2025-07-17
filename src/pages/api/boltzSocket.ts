
// Polyfill for crypto.getRandomValues in Node.js
import { webcrypto } from 'crypto';
// @ts-ignore
if (typeof globalThis.crypto === 'undefined') {
    // @ts-ignore
    globalThis.crypto = webcrypto;
}
import axios from 'axios';
import { randomBytes } from 'crypto';
import { ECPairFactory } from 'ecpair';
import { crypto, Transaction, address, networks } from 'liquidjs-lib';

import * as secp1 from '@bitcoinerlab/secp256k1';

const ECPair = ECPairFactory(secp1);




import {
    Musig,
    OutputType,
    SwapTreeSerializer,
    detectSwap,
    targetFee,
} from 'boltz-core';
import {
    TaprootUtils,
    constructClaimTransaction,
    init,
} from 'boltz-core/dist/lib/liquid';
import ws from 'ws';

// Endpoint of the Boltz instance to be used
const endpoint = 'https://api.boltz.exchange';
const webSocketEndpoint = 'wss://api.boltz.exchange/v2/ws'
// Amount you want to swap
// const invoiceAmount = 170//10_000;
const network = networks.liquid;

let secp: any; // <-- declare `secp` in the outer scope

(async () => {
    const zkp = (await import("@vulpemventures/secp256k1-zkp")).default;
    secp = await zkp();
    init(secp);
})();
export const createReverseSwap = async (invoiceAmount: any) => {
    try {

        // Create a random preimage for the swap; has to have a length of 32 bytes
        const preimage = randomBytes(32);
        const keys = ECPair.makeRandom();
        let claimPublicKey = Buffer.from(keys.publicKey).toString('hex');
        let preimageHash = crypto.sha256(preimage).toString('hex');
        // Create a Reverse Swap
        const createdResponse = (
            await axios.post(`${endpoint}/v2/swap/reverse`, {
                invoiceAmount,
                to: 'L-BTC',
                from: 'BTC',
                claimPublicKey,
                preimageHash
            })
        ).data;

        // console.log('Swap quote');
        // console.log(createdResponse);
        // console.log();
        return {
            status: true,
            data: createdResponse,
            keys,
            preimage,
            storeData: {
                ...createdResponse,
                claimPublicKey,
                preimageHash,
                preimage: preimage.toString('hex')
            }
        };
    } catch (error: any) {
        console.error("Detailed error:", error);

        let message = "An unexpected error occurred.";
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        return {
            status: false,
            message
        };
    }
}



export const createReverseSwapSocket = async (createdResponse: any, preimage: any, keys: any, destinationAddress: any) => {
    try {
        // Create a WebSocket and subscribe to updates for the created swap
        const webSocket = new ws(`${webSocketEndpoint}/v2/ws`);
        webSocket.on('open', () => {
            webSocket.send(
                JSON.stringify({
                    op: 'subscribe',
                    channel: 'swap.update',
                    args: [createdResponse.id],
                }),
            );
        });

        webSocket.on('message', async (rawMsg: any) => {
            const msg = JSON.parse(rawMsg.toString('utf-8'));
            if (msg.event !== 'update') {
                return;
            }

            // console.log('Got WebSocket update');
            // console.log(msg);
            // console.log();

            switch (msg.args[0].status) {
                // "swap.created" means Boltz is waiting for the invoice to be paid
                case 'swap.created': {
                    console.log('Waiting invoice to be paid');
                    break;
                }
                // "transaction.mempool" means that Boltz sent an onchain transaction
                case 'transaction.mempool': {
                    console.log('Creating claim transaction');
                    const boltzPublicKey = Buffer.from(
                        createdResponse.refundPublicKey,
                        'hex',
                    );
                    // Create a musig signing session and tweak it with the Taptree of the swap scripts
                    const musig = new Musig(secp, keys, randomBytes(32), [
                        boltzPublicKey,
                        (keys as any).publicKey,
                    ]);
                    const tweakedKey = TaprootUtils.tweakMusig(
                        musig,
                        SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree).tree,
                    );
                    // Parse the lockup transaction and find the output relevant for the swap
                    console.log("msg.args[0-->", msg.args[0])
                    const lockupTx = Transaction.fromHex(msg.args[0].transaction.hex);
                    const swapOutput = detectSwap(tweakedKey, lockupTx);
                    if (swapOutput === undefined) {
                        console.error('No swap output found in lockup transaction');
                        return;
                    }

                    // Create a claim transaction to be signed cooperatively via a key path spend
                    const claimTx = targetFee(0.1, (fee) =>
                        constructClaimTransaction(
                            [
                                {
                                    ...swapOutput,
                                    keys,
                                    preimage,
                                    cooperative: true,
                                    type: OutputType.Taproot,
                                    txHash: lockupTx.getHash(),
                                    blindingPrivateKey: Buffer.from(
                                        createdResponse.blindingKey,
                                        'hex',
                                    ),
                                },
                            ],
                            address.toOutputScript(destinationAddress, network),
                            fee,
                            false,
                            network,
                            address.fromConfidential(destinationAddress).blindingKey,
                        ),
                    );
                    // Get the partial signature from Boltz
                    const boltzSig = (
                        await axios.post(
                            `${endpoint}/v2/swap/reverse/${createdResponse.id}/claim`,
                            {
                                index: 0,
                                transaction: claimTx.toHex(),
                                preimage: preimage.toString('hex'),
                                pubNonce: Buffer.from(musig.getPublicNonce()).toString('hex'),
                            },
                        )
                    ).data;
                    // Aggregate the nonces
                    musig.aggregateNonces([
                        [boltzPublicKey, Buffer.from(boltzSig.pubNonce, 'hex')],
                    ]);

                    // Initialize the session to sign the claim transaction
                    musig.initializeSession(
                        claimTx.hashForWitnessV1(
                            0,
                            [swapOutput.script],
                            [{ value: swapOutput.value, asset: swapOutput.asset }],
                            Transaction.SIGHASH_DEFAULT,
                            network.genesisBlockHash,
                        ),
                    );

                    // Add the partial signature from Boltz
                    musig.addPartial(
                        boltzPublicKey,
                        Buffer.from(boltzSig.partialSignature, 'hex'),
                    );

                    // Create our partial signature
                    musig.signPartial();

                    // Witness of the input to the aggregated signature
                    claimTx.ins[0].witness = [musig.aggregatePartials()];

                    // Broadcast the finalized transaction
                    let dt = await axios.post(`${endpoint}/v2/chain/L-BTC/transaction`, {
                        hex: claimTx.toHex(),
                    });
                    break;
                }

                case 'invoice.settled':
                    console.log('Swap successful');
                    webSocket.close();
                    break;
            }
        });

        return {
            status: true,
            data: createdResponse
        };
    } catch (error: any) {
        console.error("Detailed error:", error);

        let message = "An unexpected error occurred.";
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        return {
            status: false,
            message
        };
    }
}
