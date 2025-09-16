import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if (req.method !== "GET") {
  //   return res.status(405).json({ error: "Method not allowed" });
  // }

  try {
    const {
      phoneNumber,
      accountName,
      networkProvider,
      currency,
      cryptoAmount,
      senderAddress,
      referenceId
    } = req.body;

    const data = JSON.stringify({
      mobileMoneyReceiver: {
        phoneNumber,
        accountName,
        networkProvider,
      },
      currency: currency,
      chain: "BASE",
      token: "USDC",
      cryptoAmount: parseFloat(cryptoAmount),
      senderAddress: senderAddress,
      referenceId: referenceId || uuidv4(),
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.kotanipay.io/api/v3/offramp",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${process.env.NEXT_PUBLIC_KOTANIPAY_API_KEY}`,
      },
      data,
    };

    const response = await axios.request(config);

    return res.status(200).json({
      status: "success",
      data: response.data,
    });
  } catch (error: any) {
    console.error("Kotanipay error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
}
