import type { NextApiRequest, NextApiResponse } from "next";
import { logIn } from "./lnbit"; // Reuse your existing login function
import { getPayments } from "./lnbit";

// Main handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { walletId, fromDate, toDate, apiKey } = req.body;

    if (!walletId) {
      return res
        .status(400)
        .json({ status: "failure", message: "walletId is required" });
    }

    // Always use type = 2 as requested
    const loginResponse = (await logIn(2)) as any;
    const token = loginResponse?.data?.token;
    if (!token) {
      return res
        .status(401)
        .json({ status: "failure", message: "Token fetch failed" });
    }
    console.log("line-33", walletId, token, 2, fromDate, toDate, apiKey);
    const result = await getPayments(
      walletId,
      token,
      2,
      fromDate,
      toDate,
      null,
      apiKey
    );

    if (result.status) {
      return res.status(200).json({ status: "success", data: result.data });
    } else {
      return res.status(400).json({ status: "failure", message: result.msg });
    }
  } catch (error) {
    console.error("API Error in getPayments handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};
