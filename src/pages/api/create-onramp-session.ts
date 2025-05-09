import type { NextApiRequest, NextApiResponse } from "next";
import cors from "cors";

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
      destinationExchangeAmount,
    } = req.body;

    if (!wallet_address) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const requestBody = new URLSearchParams();

    requestBody.append("source_currency", sourceCurrency);
    requestBody.append("destination_currency", destinationCurrency);
    requestBody.append("destination_network", destinationNetwork);
    requestBody.append("destination_amount", destinationExchangeAmount);
    requestBody.append(
      `wallet_addresses[${destinationNetwork}]`,
      wallet_address
    );
    requestBody.append("lock_wallet_address", "true");
    requestBody.append(
      "customer_ip_address",
      req.socket.remoteAddress || "127.0.0.1"
    );

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
      throw new Error(
        session.error?.message || "Failed to create onramp session"
      );
    }

    return res.status(200).json({
      clientSecret: session.client_secret,
    });
  } catch (error: any) {
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
