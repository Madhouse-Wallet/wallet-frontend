// pages/api/create-verification-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import cors from 'cors';

// Initialize Stripe with non-null assertion since we'll check it in the handler
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? '', {
//   apiVersion: '2023-10-16',
  appInfo: {
    name: "stripe-samples/identity/modal",
    version: "0.0.1",
    url: "https://github.com/stripe-samples"
  }
});

interface VerificationSessionResponse {
  client_secret: string;
}

interface ErrorResponse {
  error: {
    message: string;
  };
}

// Configure CORS middleware with safe origins
const corsMiddleware = cors({
  origin: true,
  methods: ['POST'],
  credentials: true,
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
): Promise<void> {
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
  res: NextApiResponse<VerificationSessionResponse | ErrorResponse>
) {
  // Check if Stripe key is configured
  if (!process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY) {
    return res.status(500).json({
      error: {
        message: 'Stripe secret key is not configured'
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Method not allowed'
      }
    });
  }

  try {
    await runMiddleware(req, res, corsMiddleware);

    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_id: '{{USER_ID}}',
      }
    });

    if (!verificationSession.client_secret) {
      throw new Error('No client secret returned from Stripe');
    }

    res.status(200).json({
      client_secret: verificationSession.client_secret
    });

  } catch (error) {
    console.error('Error creating verification session:', error);
    res.status(400).json({
      error: {
        message: error instanceof Error ? error.message : 'An error occurred'
      }
    });
  }
}

// Shared helper function for getting allowed origins
function getAllowedOrigins() {
  if (process.env.NODE_ENV === 'production') {
    return ['your-frontend-domain.com']; // Replace with your production domain
  }
  return ['http://localhost:3000', 'http://localhost:5173'];
}