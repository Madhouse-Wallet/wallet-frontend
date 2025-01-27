import { NextApiRequest, NextApiResponse } from 'next';
import { createHash } from 'crypto';

// Enum for Off-ramp Status
enum OfframpStatus {
  INITIATED = 'initiated',
  AWAITING_TRANSACTION_CONFIRMATION = 'awaiting_transaction_confirmation',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  OFFRAMP_SUCCESS = 'offramp_success',
  TRANSACTION_FAILED = 'transaction_failed',
  OFFRAMP_PENDING = 'offramp_pending',
  OFFRAMP_FAILED = 'offramp_failed',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  REFUND_FAILED = 'refund_failed',
  EXPIRED = 'expired'
}

// Webhook request type
type WebhookRequest = {
  data: {
    orderId: string,
    offrampType: "bank",
    status: OfframpStatus,
    date: string,
    cashout: {
      localCurrencyAmount: number,
      usdAmount: number,
      feeAmountUsd: number,
      feeAmountUsdFonbnk: number,
      feeAmountUsdPartner: number,
      feeAmountLocalCurrency: number,
      feeAmountLocalCurrencyFonbnk: number,
      feeAmountLocalCurrencyPartner: number,
    },
    exchangeRate: number,
    network: "AVALANCHE" | "POLYGON" | "CELO",
    asset: "USDC" | "CUSD",
    fromAddress: string,
    toAddress: string,
    userPhoneNumber: string,
    requiredFields: { 
      label: string, 
      type: 'number' | 'string' | 'date' | 'boolean' | 'email' | 'phone', 
      value: string 
    }[],
    orderParams?: string,
    countryIsoCode: string,
    currencyIsoCode: string,
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

  // Your secret from Fonbnk dashboard (store securely in environment variables)
  const FONBNK_OFFRAMP_WEBHOOK_SECRET = '01JJHFM7CNFPHH2S6SFSN1SDP1';

  if (!FONBNK_OFFRAMP_WEBHOOK_SECRET) {
    console.error('Fonbnk off-ramp webhook secret is not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // Webhook V2 Verification (using x-signature header)
    const xSignature = req.headers['x-signature'] as string;
    
    // Generate hash for verification
    const computedHash = createHash('sha256')
      .update(JSON.stringify(req.body))
      .update(createHash('sha256').update(FONBNK_OFFRAMP_WEBHOOK_SECRET, 'utf8').digest('hex'))
      .digest('hex');

    // Verify signature
    if (xSignature !== computedHash) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    // Extract webhook data
    const webhookData: WebhookRequest = req.body;

    // Process the webhook based on different statuses
    switch (webhookData.data.status) {
      case OfframpStatus.INITIATED:
        console.log(`Off-ramp order ${webhookData.data.orderId} initiated`);
        // Handle order initiation
        break;
      
      case OfframpStatus.OFFRAMP_SUCCESS:
        console.log(`Off-ramp order ${webhookData.data.orderId} successful`);
        // Handle successful off-ramp
        break;
      
      case OfframpStatus.OFFRAMP_FAILED:
        console.log(`Off-ramp order ${webhookData.data.orderId} failed`);
        // Handle off-ramp failure
        break;
      
      case OfframpStatus.REFUNDED:
        console.log(`Off-ramp order ${webhookData.data.orderId} refunded`);
        // Handle refund
        break;
      
      default:
        console.log(`Received off-ramp status: ${webhookData.data.status}`);
    }

    // Respond with success
    res.status(200).json({ message: 'Off-ramp webhook processed successfully' });

  } catch (error) {
    console.error('Off-ramp webhook processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}