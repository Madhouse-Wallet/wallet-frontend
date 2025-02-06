// pages/api/moralis/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Moralis from "moralis";

const API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

// Track initialization state
let isInitialized = false;

async function initializeMoralis() {
  if (!isInitialized) {
    try {
      await Moralis.start({ apiKey: API_KEY });
      isInitialized = true;
    } catch (error) {
      // If the error is about modules already started, we can safely ignore it
      if (
        !(error instanceof Error) ||
        !error.message.includes("Modules are started already")
      ) {
        throw error;
      }
      isInitialized = true;
    }
  }
}

async function getTokenBalances(tokenAddresses: string[], address: string) {
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: "0x1",
    tokenAddresses,
    address,
  });
  return response.raw;
}

async function getWalletHistory(address: string) {
  try {
    console.log("Fetching wallet history for address:", address);
    const response = await Moralis.EvmApi.wallets.getWalletHistory({
      chain: "0x1",
      order: "DESC",
      address: address,
    });

    if (!response || !response.raw) {
      throw new Error("No data received from Moralis");
    }

    return response.raw;
  } catch (error) {
    console.error("Error in getWalletHistory:", error);
    throw error;
  }
}

async function getWalletTokenTransfers(address: string) {
  try {
    console.log("Fetching token transfers for address:", address);
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      chain: "0x1",
      order: "DESC",
      address: address,
    });

    if (!response || !response.raw) {
      throw new Error("No transfer data received from Moralis");
    }

    return response.raw;
  } catch (error) {
    console.error("Error in getWalletTokenTransfers:", error);
    throw error;
  }
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await initializeMoralis();

    const { action, ...params } = req.body;

    switch (action) {
      case "getTokenBalances":
        const { tokenAddresses, address } = params;
        const balances = await getTokenBalances(tokenAddresses, address);
        return res.status(200).json(balances);

      case "getWalletHistory":
        const history = await getWalletHistory(params.address);
        return res.status(200).json(history);

      case "getWalletTokenTransfers":
        if (!params.address) {
          return res.status(400).json({ error: "Address is required" });
        }
        const transfers = await getWalletTokenTransfers(params.address);
        return res.status(200).json({ data: transfers });

      default:
        return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Operation failed",
    });
  }
}
