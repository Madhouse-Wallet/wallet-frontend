import { NextApiRequest, NextApiResponse } from 'next';
import { createHash } from 'crypto';

// Webhook handler type
type WebhookRequest = {
  data: {
    status: 
      | "swap_initiated"
      | "swap_expired"
      | "swap_buyer_rejected"
      | "swap_buyer_confirmed"
      | "swap_seller_rejected"
      | "swap_seller_confirmed"
      | "pending"
      | "complete"
      | "failed",
    date: string,
    orderId: string,
    phoneNumber: string,
    localCurrencyAmount: number,
    localCurrencyIsoCode: string,
    countryIsoCode: string,
    provider: 
      | "carrier"
      | "mpesa"
      | "mobile_money"
      | "bank_transfer",
    amount: number,
    amountCrypto: number,
    network: 
      | "POLYGON"
      | "ETHEREUM"
      | "STELLAR"
      | "AVALANCHE"
      | "SOLANA"
      | "BASE"
      | "CELO"
      | "LISK",
    asset: "USDC" | "CUSD" | "USDT" | "USDC_E",
    address: string,
    orderParams?: string,
    hash?: string,
    resumeUrl: string
  },
  hash: string
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // Ensure only POST requests are accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Your secret from Fonbnk dashboard (store securely, e.g., in environment variables)
  const FONBNK_WEBHOOK_SECRET = '01JJHFM7CNFPHH2S6SFSN1SDP1';

  if (!FONBNK_WEBHOOK_SECRET) {
    console.error('Fonbnk webhook secret is not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // Webhook V2 Verification (using x-signature header)
    const xSignature = req.headers['x-signature'] as string;
    
    // Generate hash for verification
    const computedHash = createHash('sha256')
      .update(JSON.stringify(req.body))
      .update(createHash('sha256').update(FONBNK_WEBHOOK_SECRET, 'utf8').digest('hex'))
      .digest('hex');

    // Verify signature
    if (xSignature !== computedHash) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    // Extract webhook data
    const webhookData: WebhookRequest = req.body;

    // Process the webhook based on different statuses
    switch (webhookData.data.status) {
      case 'swap_initiated':
        // Handle swap initiation
        console.log(`Order ${webhookData.data.orderId} initiated`);
        break;
      
      case 'complete':
        // Handle successful transaction
        console.log(`Order ${webhookData.data.orderId} completed`);
        break;
      
      case 'failed':
        // Handle failed transaction
        console.log(`Order ${webhookData.data.orderId} failed`);
        break;
      
      default:
        console.log(`Received status: ${webhookData.data.status}`);
    }

    // Respond with success
    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}