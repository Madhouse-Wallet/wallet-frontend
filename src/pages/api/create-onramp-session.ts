// pages/api/create-onramp-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import cors from 'cors';

// Initialize Stripe
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);

// Define interfaces for type safety
interface TransactionDetails {
  destination_currency: string;
  destination_exchange_amount: number;
  destination_network: string;
}

interface CreateSessionRequest extends NextApiRequest {
  body: {
    transaction_details: TransactionDetails;
  };
}

// Define the expected response type from Stripe
interface OnrampSessionResponse {
  client_secret: string;
  [key: string]: any; // for other potential properties
}

// Define custom type for the OnrampSessionResource
interface CustomOnrampSessionResource extends Stripe.StripeResource {
  create(params: {
    transaction_details: TransactionDetails;
    customer_ip_address: string;
  }): Promise<OnrampSessionResponse>;
}

const corsMiddleware = cors({
  origin: true,
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

// Define OnrampSessionResource with proper typing
const OnrampSessionResource = Stripe.StripeResource.extend({
  create: Stripe.StripeResource.method({
    method: 'POST',
    path: 'crypto/onramp_sessions',
  }),
}) as unknown as new (stripe: Stripe) => CustomOnrampSessionResource;

export default async function handler(
  req: CreateSessionRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, corsMiddleware);

    const { transaction_details } = req.body;

    // Create an OnrampSession with proper typing
    const onrampSession: OnrampSessionResponse = await new OnrampSessionResource(stripe).create({
      transaction_details: {
        destination_currency: transaction_details.destination_currency,
        destination_exchange_amount: transaction_details.destination_exchange_amount,
        destination_network: transaction_details.destination_network,
      },
      customer_ip_address: req.socket.remoteAddress || '',
    });

    return res.status(200).json({
      clientSecret: onrampSession.client_secret,
    });
  } catch (error) {
    console.error('Error creating onramp session:', error);
    return res.status(500).json({ 
      error: 'Error creating onramp session' 
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