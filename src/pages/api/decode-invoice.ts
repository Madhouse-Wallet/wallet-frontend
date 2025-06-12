import type { NextApiRequest, NextApiResponse } from "next";
import { userLogIn } from "./lnbit"; // Import the decodeInvoice function
import client from "../../lib/mongodb"; // Import the MongoDB client
import { decodeInvoice } from "./lnbit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { invoice, email } = req.body;

    // Validate required fields
    if (!invoice || !email) {
      return res.status(400).json({
        status: "failure",
        message: "Invoice and email are required",
      });
    }

    const db = (await client.connect()).db(); // Defaults to the database in the connection string
    const usersCollection = db.collection("users"); // Use 'users' collection
    const existingUser = await usersCollection.findOne({
      email: email,
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "failure",
        message: "User not found",
      });
    }

    // Get user token
    let getToken = (await userLogIn(2, existingUser?.lnbitId_3)) as any;

    if (getToken?.status) {
      let token = getToken?.data?.token;

      // Decode the invoice
      const decodedInvoice = (await decodeInvoice(
        invoice,
        token,
        2,
        existingUser?.lnbitAdminKey_3
      )) as any;
      if (decodedInvoice?.status) {
        return res.status(200).json({
          status: "success",
          message: "Invoice decoded successfully!",
          invoiceData: decodedInvoice.data,
        });
      } else {
        return res.status(400).json({
          status: "failure",
          message: decodedInvoice.msg,
        });
      }
    } else {
      return res.status(400).json({
        status: "failure",
        message: getToken.msg,
      });
    }
  } catch (error) {
    console.error("Error decoding invoice:", error);
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
