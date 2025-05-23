// pages/api/reverseSwap.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import cors from 'cors';

// Types
interface SwapRequest extends NextApiRequest {
  body: {
    wif: string;
  };
}


// Setup CORS middleware
const corsMiddleware = cors({
  origin: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
});



export default async function handler(
  req: SwapRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wif } = req.body;
    if (!wif) {
      return res.status(400).json({ error: 'Wif is required' });
    }
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.fromWIF(wif);
    const publicKeyBuffer = Buffer.from(keyPair.publicKey); // wrap in Buffer
    const { address } = bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer });
    // Return initial swap details
    return res.status(200).json({
      status: 'success',
      data: {
        address
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