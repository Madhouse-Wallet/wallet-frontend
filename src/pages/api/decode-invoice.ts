import type { NextApiRequest, NextApiResponse } from "next";
import { userLogIn } from "./lnbit"; // Import the decodeInvoice function
import { decodeInvoice } from "./lnbit";
import { lambdaInvokeFunction } from "../../lib/apiCall";

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

    const apiResponse = await lambdaInvokeFunction({ email }, "madhouse-backend-production-getUser") as any;
    if (apiResponse?.status == "success") {
      let existingUser = apiResponse?.data;
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
    } else {
      return res.status(400).json({ status: "failure", message: apiResponse?.message, error: apiResponse?.error });
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
