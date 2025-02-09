// // pages/api/create-onramp-session.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import Stripe from 'stripe';
// import cors from 'cors';

// // Initialize Stripe
// const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);

// // Define interfaces for type safety
// interface TransactionDetails {
//   destination_currency: string;
//   destination_exchange_amount: number;
//   destination_network: string;
// }

// interface CreateSessionRequest extends NextApiRequest {
//   body: {
//     transaction_details: TransactionDetails;
//   };
// }

// // Define the expected response type from Stripe
// interface OnrampSessionResponse {
//   client_secret: string;
//   [key: string]: any; // for other potential properties
// }

// // Define custom type for the OnrampSessionResource
// interface CustomOnrampSessionResource extends Stripe.StripeResource {
//   create(params: {
//     transaction_details: TransactionDetails;
//     customer_ip_address: string;
//   }): Promise<OnrampSessionResponse>;
// }

// const corsMiddleware = cors({
//   origin: true,
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// });

// function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result: any) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// }

// // Define OnrampSessionResource with proper typing
// const OnrampSessionResource = Stripe.StripeResource.extend({
//   create: Stripe.StripeResource.method({
//     method: 'POST',
//     path: 'crypto/onramp_sessions',
//   }),
// }) as unknown as new (stripe: Stripe) => CustomOnrampSessionResource;

// export default async function handler(
//   req: CreateSessionRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     await runMiddleware(req, res, corsMiddleware);

//     const { transaction_details } = req.body;

//     // Create an OnrampSession with proper typing
//     const onrampSession: OnrampSessionResponse = await new OnrampSessionResource(stripe).create({
//       transaction_details: {
//         destination_currency: transaction_details.destination_currency,
//         destination_exchange_amount: transaction_details.destination_exchange_amount,
//         destination_network: transaction_details.destination_network,
//       },
//       customer_ip_address: req.socket.remoteAddress || '',
//     });

//     return res.status(200).json({
//       clientSecret: onrampSession.client_secret,
//     });
//   } catch (error) {
//     console.error('Error creating onramp session:', error);
//     return res.status(500).json({
//       error: 'Error creating onramp session'
//     });
//   }
// }

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '1mb',
//     },
//   },
// };

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import cors from "cors";

// Initialize Stripe
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

interface CreateSessionRequest {
  wallet_address?: string;
  amount?: number;
  currency?: string;
}

const corsMiddleware = cors({
  origin: true,
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
});

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
  req: NextApiRequest & { body: CreateSessionRequest },
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, corsMiddleware);

    const {
      wallet_address,
      sourceCurrency,
      destinationCurrency,
      destinationNetwork,
    } = req.body;

    if (!wallet_address) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // const requestBody = new URLSearchParams({
    //   'source_currency': 'usd',
    //   'destination_currency': 'btc',
    //   'destination_network': 'bitcoin',
    //   'destination_currencies': ['btc'].join(','),
    //   'destination_networks':['bitcoin'].join(','),
    //   'wallet_addresses[bitcoin]': wallet_address,
    //   'customer_ip_address': req.socket.remoteAddress || '127.0.0.1'
    // });

    // const response = await fetch('https://api.stripe.com/v1/crypto/onramp_sessions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}`,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Stripe-Version': '2024-12-18.acacia'
    //   },
    //   body: requestBody.toString()
    // });

    const requestBody = new URLSearchParams();

    // requestBody.append("source_currency", "usd");
    // requestBody.append("destination_currency", "btc");
    // requestBody.append("destination_network", "bitcoin");
    // requestBody.append("wallet_addresses[bitcoin]", wallet_address);
    // requestBody.append("lock_wallet_address", "true");
    // requestBody.append(
    //   "customer_ip_address",
    //   req.socket.remoteAddress || "127.0.0.1"
    // );

    // // Correctly structure arrays
    // ["btc"].forEach((currency) =>
    //   requestBody.append("destination_currencies[]", currency)
    // );
    // ["bitcoin"].forEach((network) =>
    //   requestBody.append("destination_networks[]", network)
    // );


    requestBody.append("source_currency", sourceCurrency);
    requestBody.append("destination_currency", destinationCurrency);
    requestBody.append("destination_network", destinationNetwork);
    requestBody.append(`wallet_addresses[${destinationNetwork}]`, wallet_address);
    requestBody.append("lock_wallet_address", "true");
    requestBody.append(
      "customer_ip_address",
      req.socket.remoteAddress || "127.0.0.1"
    );

    // Correctly structure arrays
    [destinationCurrency].forEach((currency) =>
      requestBody.append("destination_currencies[]", currency)
    );
    [destinationNetwork].forEach((network) =>
      requestBody.append("destination_networks[]", network)
    );

    const response = await fetch(
      "https://api.stripe.com/v1/crypto/onramp_sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": "2024-12-18.acacia",
        },
        body: requestBody.toString(),
      }
    );

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe Error:", session);
      throw new Error(
        session.error?.message || "Failed to create onramp session"
      );
    }

    return res.status(200).json({
      clientSecret: session.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating onramp session:", error);
    return res.status(500).json({
      error: error.message || "Error creating onramp session",
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
