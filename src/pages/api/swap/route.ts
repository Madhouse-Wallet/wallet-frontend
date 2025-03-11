// pages/api/swap.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import zkpInit from '@vulpemventures/secp256k1-zkp';
import axios from 'axios';
import {
  Transaction,
  address,
  crypto,
  initEccLib,
  networks,
} from 'bitcoinjs-lib';
import {
  Musig,
  OutputType,
  SwapTreeSerializer,
  TaprootUtils,
  constructClaimTransaction,
  detectSwap,
  targetFee,
} from 'boltz-core';
import { randomBytes } from 'crypto';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
// import * as ecc from 'secp256k1'
import { WebSocket } from 'ws';
import cors from 'cors';

// Types
interface SwapResponse {
  id: string;
  invoice: string;
  swapTree: {
    claimLeaf: {
      version: number;
      output: string;
    };
    refundLeaf: {
      version: number;
      output: string;
    };
  };
  lockupAddress: string;
  refundPublicKey: string;
  timeoutBlockHeight: number;
  onchainAmount: number;
}

interface SwapRequest extends NextApiRequest {
  body: {
    invoiceAmount: number;
    destinationAddress: string;
  };
}

// Constants
const ENDPOINT =  process.env.NEXT_PUBLIC_BOLTZ_MAINNET_URL_ADDRESS;
const WEBSOCKET_ENDPOINT = process.env.NEXT_PUBLIC_BOLTZ_MAINNET_WEBSOCKET_ADDRESS;

const NETWORK = networks.bitcoin;

// Setup CORS middleware
const corsMiddleware = cors({
  origin: "*",
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: SwapRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, corsMiddleware);

    const { invoiceAmount, destinationAddress } = req.body;

    initEccLib(ecc);
    const preimage = randomBytes(32);
    const keys = ECPairFactory(ecc).makeRandom();

    // Create a Reverse Swap
    const response = await axios.post<SwapResponse>(`${ENDPOINT}/v2/swap/reverse`, {
      invoiceAmount,
      to: 'BTC',
      from: 'BTC',
      claimPublicKey: keys.publicKey.toString('hex'),
      preimageHash: crypto.sha256(preimage).toString('hex'),
    });

    const createdResponse = response.data;
    console.log('Created swap');
    console.log(createdResponse);

    // Create a WebSocket connection
    const webSocket = new WebSocket(WEBSOCKET_ENDPOINT!);
    
    webSocket.on('open', () => {
      webSocket.send(
        JSON.stringify({
          op: 'subscribe',
          channel: 'swap.update',
          args: [createdResponse.id],
        }),
      );
    });

    webSocket.on('message', async (rawMsg) => {
      const msg = JSON.parse(rawMsg.toString('utf-8'));
      if (msg.event !== 'update') {
        return;
      }

      console.log('Got WebSocket update');
      console.log(msg);

      switch (msg.args[0].status) {
        case 'swap.created': {
          console.log('Waiting for invoice to be paid');
          break;
        }

        case 'transaction.mempool': {
          console.log('Creating claim transaction');

          const boltzPublicKey = Buffer.from(
            createdResponse.refundPublicKey,
            'hex',
          );

          const musig = new Musig(await zkpInit(), keys, randomBytes(32), [
            boltzPublicKey,
            keys.publicKey,
          ]);
          
          const tweakedKey = TaprootUtils.tweakMusig(
            musig,
            SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree).tree,
          );

          const lockupTx = Transaction.fromHex(msg.args[0].transaction.hex);
          const swapOutput = detectSwap(tweakedKey, lockupTx);
          
          if (swapOutput === undefined) {
            console.error('No swap output found in lockup transaction');
            return;
          }

          const claimTx = targetFee(2, (fee) =>
            constructClaimTransaction(
              [
                {
                  ...swapOutput,
                  keys,
                  preimage,
                  cooperative: true,
                  type: OutputType.Taproot,
                  txHash: lockupTx.getHash(),
                },
              ],
              address.toOutputScript(destinationAddress, NETWORK),
              fee,
            ),
          );

          const boltzSig = await axios.post(
            `${ENDPOINT}/v2/swap/reverse/${createdResponse.id}/claim`,
            {
              index: 0,
              transaction: claimTx.toHex(),
              preimage: preimage.toString('hex'),
              pubNonce: Buffer.from(musig.getPublicNonce()).toString('hex'),
            },
          );

          musig.aggregateNonces([
            [boltzPublicKey, Buffer.from(boltzSig.data.pubNonce, 'hex')],
          ]);

          musig.initializeSession(
            claimTx.hashForWitnessV1(
              0,
              [swapOutput.script],
              [swapOutput.value],
              Transaction.SIGHASH_DEFAULT,
            ),
          );

          musig.addPartial(
            boltzPublicKey,
            Buffer.from(boltzSig.data.partialSignature, 'hex'),
          );

          musig.signPartial();
          claimTx.ins[0].witness = [musig.aggregatePartials()];

          await axios.post(`${ENDPOINT}/v2/chain/BTC/transaction`, {
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

    // Return the initial response including the invoice
    return res.status(200).json({
      status: 'success',
      data: {
        id: createdResponse.id,
        invoice: createdResponse.invoice,
        swapTree: createdResponse.swapTree,
        lockupAddress: createdResponse.lockupAddress,
        refundPublicKey: createdResponse.refundPublicKey,
        timeoutBlockHeight: createdResponse.timeoutBlockHeight,
        onchainAmount: createdResponse.onchainAmount
      }
    });

  } catch (error: any) {
    console.error('Error creating swap:', error);
    // return res.status(500).json({ 
    //   error: error.message || 'Error creating swap' 
    // });

     // Check if it's an Axios error with response data
     if (error.response && error.response.data) {
        return res.status(error.response.status).json({
            status: 'error',
            error: error.response.data.error || 'Error creating swap'
        });
    }
    
    // Fallback error response
    return res.status(500).json({ 
        status: 'error',
        error: error.message || 'Error creating swap' 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};