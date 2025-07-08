import type { NextApiRequest, NextApiResponse } from "next";
import { addProvisionLambda, checkLnbitCreds } from "../../lib/apiCall";
import { lambdaInvokeFunction } from "../../lib/apiCall";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      email,
      username,
      passkey,
      totalPasskey = 1,
      wallet,
      bitcoinWallet = "",
      flowTokens,
    } = req.body;
    req.body.commission_fees = process.env.NEXT_PUBLIC_COMMISSION_FEES;

    const apiResponse = (await lambdaInvokeFunction(
      req.body,
      "madhouse-backend-production-createUser"
    )) as any;
    if (apiResponse?.status == "success") {
      // addProvisionLambda({
      //     "madhouseWallet": wallet,
      //     "email": email,
      //     "bitcoinWallet": bitcoinWallet,
      //     "provisionlnbitType": 1,
      //     "refund_address1": ""
      // })
      checkLnbitCreds({
        madhouseWallet: wallet,
        email: email,
      });
      return res
        .status(200)
        .json({
          status: "success",
          message: apiResponse?.message,
          userData: apiResponse?.data,
        });
    } else {
      return res
        .status(400)
        .json({
          status: "failure",
          message: apiResponse?.message,
          error: apiResponse?.error,
        });
    }
  } catch (error: any) {
    console.error("Error adding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb",
    },
  },
};
