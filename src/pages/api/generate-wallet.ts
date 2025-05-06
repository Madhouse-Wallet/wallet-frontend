import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb'; // Import the MongoDB client
import { ECPairFactory } from 'ecpair';
import * as crypto from 'crypto';
import * as tinysecp from 'tiny-secp256k1';
import { InMemoryKey, Wallet } from '@arklabs/wallet-sdk';
import * as secp256k1 from '@bitcoinerlab/secp256k1'; // <-- here
 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {

        // 1. Generate a random Bitcoin private key
        const ECPair = ECPairFactory(secp256k1);
        const keyPair = ECPair.makeRandom(); // Uses secure RNG

        // // 2. Get the raw private key as hex
        // const privateKeyHex = keyPair.privateKey!.toString('hex');
        // console.log('Generated Private Key (Hex):', privateKeyHex);

        const privateKeyUint8 = keyPair.privateKey;
        if (!privateKeyUint8) throw new Error('Private key generation failed');

        // Convert to Buffer and then to hex
        const privateKeyHex = Buffer.from(privateKeyUint8).toString('hex');
        // console.log('Generated Private Key (Hex):', privateKeyHex);

        // 3. Create Ark-compatible identity
        const identity = InMemoryKey.fromHex(privateKeyHex);

        // 4. Create the wallet using Ark SDK
        const wallet = await Wallet.create({
            network: 'bitcoin',  // or 'bitcoin', 'testnet', etc.
            identity: identity,
            esploraUrl: 'https://mutinynet.com/api',
            arkServerUrl: 'https://master.mutinynet.arklabs.to',
            arkServerPublicKey: 'd45fc69d4ff1f45cbba36ab1037261863c3a49c4910bc183ae975247358920b6'
        });

        // 5. Fetch and print wallet addresses
        const addresses = await wallet.getAddress();
        // console.log('Bitcoin Address:', addresses.onchain);
        // console.log('Ark Address:', addresses.offchain);
        // console.log('Boarding Address:', addresses.boarding);
        // console.log('BIP21 URI:', addresses.bip21);
        return res.status(200).json({ status: "success", message: 'Wallet Created successfully', data: { wallet: addresses.onchain, privateKey: privateKeyHex } });
    } catch (error) {
        console.log("createWallet error=--->", error)
        return res.status(400).json({ status: "failure", message: 'Please Try again later!' });
    }

}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '3mb',
        },
    },
};
