import type { NextApiRequest, NextApiResponse } from "next";
import { userLogIn, createInvoice } from "./lnbit";
import client from "../../lib/mongodb"; // Import the MongoDB client

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { amount, email } = req.body;
    // const getToken = await logIn(2) as any;
    // let token = getToken?.data?.token;
    const satoshiAmount = amount;
    const db = (await client.connect()).db(); // Defaults to the database in the connection string
    const usersCollection = db.collection("users"); // Use 'users' collection
    const existingUser = await usersCollection.findOne({
      email: email,
    });
    let getUserToken = (await userLogIn(2, existingUser?.lnbitId_3)) as any;
    let token = getUserToken?.data?.token;
    let createInvoice1 = (await createInvoice(
      {
        out: false,
        unit: "sat",
        amount: satoshiAmount,
        memo: "invoice",
        webhook: `https://app.madhousewallet.com/api/webhookinvoice?email=${email}`,
      },
      token,
      2,
      existingUser?.lnbitAdminKey_3
    )) as any;
    if (createInvoice1?.status) {
      return res.status(200).json({
        status: "success",
        message: "Invoice Created!",
        data: { invoice: createInvoice1?.data?.bolt11 },
      });
    } else {
      return res
        .status(400)
        .json({ status: "failure", message: createInvoice1.msg });
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
