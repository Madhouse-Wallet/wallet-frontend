import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Define response type for the BlockCypher API
interface BlockCypherResponse {
  private: string;
  public: string;
  address: string;
  wif: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Call the BlockCypher API to generate a new bitcoin address
    const response = await axios.post<BlockCypherResponse>(
      "https://api.blockcypher.com/v1/btc/main/addrs"
    );

    // Extract the data from the response
    const {
      private: privateKey,
      address,
      public: publicKey,
      wif,
    } = response.data;

    // Log the generated address information (optional)
    console.log("Generated Bitcoin Address:", address);
    console.log("Private Key:", privateKey);

    // Return the wallet information
    return res.status(200).json({
      status: "success",
      message: "Wallet Created successfully",
      data: {
        wallet: address,
        privateKey: privateKey,
        publicKey: publicKey,
        wif: wif,
      },
    });
  } catch (error) {
    console.error("createWallet error=--->", error);
    return res.status(400).json({
      status: "failure",
      message: "Please Try again later!",
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb",
    },
  },
};
