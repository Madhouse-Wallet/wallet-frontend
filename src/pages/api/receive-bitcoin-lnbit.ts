import type { NextApiRequest, NextApiResponse } from "next";
import { userLogIn, createInvoice } from "./lnbit";

import { lambdaInvokeFunction } from "../../lib/apiCall";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { amount, email, memo } = req.body;
    // const getToken = await logIn(2) as any;
    // let token = getToken?.data?.token;
    const satoshiAmount = amount;

    const apiResponse = (await lambdaInvokeFunction(
      { email },
      "madhouse-backend-production-getUser"
    )) as any;
    if (apiResponse?.status == "success") {
      let existingUser = apiResponse?.data;
      let getUserToken = (await userLogIn(2, existingUser?.lnbitId_3)) as any;
      let token = getUserToken?.data?.token;
      let createInvoice1 = (await createInvoice(
        {
          out: false,
          unit: "sat",
          amount: satoshiAmount,
          memo: memo,
          webhook: `https://app.madhousewallet.com/api/webhookInvoice?email=${email}`,
        },
        token,
        2,
        existingUser?.lnbitAdminKey_3
      )) as any;
      if (createInvoice1?.status) {
        // console.log("createInvoice1-->", createInvoice1)
        return res.status(200).json({
          status: "success",
          message: "Invoice Created!",
          data: {
            invoice: createInvoice1?.data?.bolt11,
            checking_id: createInvoice1?.data?.checking_id,
            payment_hash: createInvoice1?.data?.payment_hash,
          },
        });
      } else {
        return res
          .status(400)
          .json({ status: "failure", message: createInvoice1.msg });
      }
    } else {
      return res
        .status(400)
        .json({
          status: "failure",
          message: apiResponse?.message,
          error: apiResponse?.error,
        });
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
