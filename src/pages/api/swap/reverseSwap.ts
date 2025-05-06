// pages/api/reverseSwap.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import zkpInit from '@vulpemventures/secp256k1-zkp';
import axios from 'axios';
import { crypto } from 'bitcoinjs-lib';
import bolt11 from 'bolt11';
import { Musig, SwapTreeSerializer, TaprootUtils } from 'boltz-core';
import { randomBytes } from 'crypto';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { WebSocket } from 'ws';
import cors from 'cors';

// Types
interface SwapRequest extends NextApiRequest {
  body: {
    invoice: string;  // The lightning invoice to be paid
  };
}

// Constants
const ENDPOINT =  process.env.NEXT_PUBLIC_BOLTZ_MAINNET_URL_ADDRESS;
const WEBSOCKET_ENDPOINT = process.env.NEXT_PUBLIC_BOLTZ_MAINNET_WEBSOCKET_ADDRESS;

// Setup CORS middleware
const corsMiddleware = cors({
  origin: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
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

    const { invoice } = req.body;
    if (!invoice) {
      return res.status(400).json({ error: 'Invoice is required' });
    }

    const keys = ECPairFactory(ecc).makeRandom();
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.makeRandom(); // compressed by default

    const refundPublicKeyHex = Buffer.from(keyPair.publicKey).toString('hex');
    
    console.log('refundPublicKey:', refundPublicKeyHex); // should start with 02 or 03
    
    // Create a Submarine Swap
    const response = await axios.post(`${ENDPOINT}/v2/swap/submarine`, {
      invoice,
      to: 'BTC',
      from: 'BTC',
      refundPublicKey:refundPublicKeyHex
    });

    const createdResponse = response.data;
    console.log('Created swap:', createdResponse);

    // Create WebSocket connection
    const webSocket = new WebSocket(WEBSOCKET_ENDPOINT!);
    
    webSocket.on('open', () => {
      webSocket.send(
        JSON.stringify({
          op: 'subscribe',
          channel: 'swap.update',
          args: [createdResponse.id],
        })
      );
    });

    webSocket.on('message', async (rawMsg) => {
      const msg = JSON.parse(rawMsg.toString('utf-8'));
      if (msg.event !== 'update') {
        return;
      }

      console.log('WebSocket update:', msg);

      switch (msg.args[0].status) {
        case 'invoice.set': {
          console.log('Waiting for onchain transaction');
          break;
        }

        case 'transaction.claim.pending': {
          console.log('Creating cooperative claim transaction');

          // Get claim transaction details
          const claimTxDetails = (
            await axios.get(
              `${ENDPOINT}/v2/swap/submarine/${createdResponse.id}/claim`
            )
          ).data;

          // Verify invoice payment with preimage
          const invoicePreimageHash = Buffer.from(
            bolt11
              .decode(invoice)
              .tags.find((tag) => tag.tagName === 'payment_hash')!.data as string,
            'hex'
          );

          if (
            !crypto
              .sha256(Buffer.from(claimTxDetails.preimage, 'hex'))
              .equals(invoicePreimageHash)
          ) {
            console.error('Invalid preimage provided');
            return;
          }

          const boltzPublicKey = Buffer.from(
            createdResponse.claimPublicKey,
            'hex'
          );

          // Create and configure Musig instance
          const musig = new Musig(await zkpInit(), keys as any, randomBytes(32), [
            boltzPublicKey,
            Buffer.from(keys.publicKey)
          ]);

          // Apply Taproot tweaks
          TaprootUtils.tweakMusig(
            musig,
            SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree).tree
          );

          // Handle nonce aggregation
          musig.aggregateNonces([
            [boltzPublicKey, Buffer.from(claimTxDetails.pubNonce, 'hex')],
          ]);

          // Initialize signing session
          musig.initializeSession(
            Buffer.from(claimTxDetails.transactionHash, 'hex')
          );

          // Submit signature to Boltz
          await axios.post(
            `${ENDPOINT}/v2/swap/submarine/${createdResponse.id}/claim`,
            {
              pubNonce: Buffer.from(musig.getPublicNonce()).toString('hex'),
              partialSignature: Buffer.from(musig.signPartial()).toString('hex'),
            }
          );

          break;
        }

        case 'transaction.claimed': {
          console.log('Swap completed successfully');
          webSocket.close();
          break;
        }
      }
    });

    // Handle WebSocket errors
    webSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Return initial swap details
    return res.status(200).json({
      status: 'success',
      data: {
        id: createdResponse.id,
        address: createdResponse.address,
        expectedAmount: createdResponse.expectedAmount,
        timeoutBlockHeight: createdResponse.timeoutBlockHeight,
        swapTree: createdResponse.swapTree,
      }
    });

  } catch (error: any) {
    console.error('Swap creation error:', error);
    
    // Handle Axios errors
    if (error.response?.data) {
      return res.status(error.response.status).json({
        status: 'error',
        error: error.response.data.error || 'Swap creation failed'
      });
    }
    
    // Generic error response
    return res.status(500).json({
      status: 'error',
      error: error.message || 'Internal server error'
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