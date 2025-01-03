// pages/api/config.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cors from 'cors';

// Define types
interface ConfigResponse {
  publishableKey: string;
}

// Configure CORS middleware
const corsMiddleware = cors({
  origin: true,
  methods: ['GET'],
  credentials: true,
});

// Helper function to run middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
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
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ publishableKey: '' });
  }

  try {
    await runMiddleware(req, res, corsMiddleware);
    
    res.json({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    });
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ publishableKey: '' });
  }
}