import type { NextApiRequest, NextApiResponse } from "next";

import {
  logIn,
  createSwapReverse,
  createSwap,
  createInvoice,
  payInvoice,
  createUser,
  createBlotzAutoReverseSwap,
  userLogIn,
} from "./lnbit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, refund_address, lnbitId_3, lnbitWalletId_3 } = req.body;
    // const getToken = await logIn(2) as any;
    // let token = getToken?.data?.token;
    let getUserToken = (await userLogIn(2, lnbitId_3)) as any;
    let token = getUserToken?.data?.token as any;
    const satoshiAmount = amount * 100000000;
    // const satoshiAmount = amount;
    let data = (await createSwap(
      {
        wallet: lnbitWalletId_3,
        asset: "BTC/BTC",
        refund_address: refund_address,
        amount: satoshiAmount,
        direction: "receive",
        feerate: true,
        feerate_value: 0,
      },
      token,
      2
    )) as any;
    if (data?.status) {
      return res.status(200).json({
        status: "success",
        message: "Swap Address Generated!",
        data: data?.data,
      });
    } else {
      return res.status(400).json({ status: "failure", message: data.msg });
    }
  } catch (error) {
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
