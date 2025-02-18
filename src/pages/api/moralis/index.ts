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
    chain: process.env.NEXT_PUBLIC_ENV_CHAIN,
    tokenAddresses,
    address,
  });
  return response.raw;
}

async function getWalletHistory(address: string) {
  try {
    console.log("Fetching wallet history for address:", address);
    const response = await Moralis.EvmApi.wallets.getWalletHistory({
      chain: process.env.NEXT_PUBLIC_ENV_CHAIN,
      order: "DESC",
      address: address,
    });
    console.log("response", response);
    // if (!response || !response.raw) {
    //   throw new Error("No data received from Moralis");
    // }

    return response;
  } catch (error) {
    console.error("Error in getWalletHistory:", error);
    throw error;
  }
}

async function getWalletTokenTransfers(
  contractAddresses: string[],
  walletAddress: string
) {
  try {
    console.log("Fetching token transfers for address:", walletAddress);
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      chain: process.env.NEXT_PUBLIC_ENV_CHAIN,
      order: "DESC",
      address: walletAddress,
      contractAddresses: contractAddresses,
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

async function getWalletBalance(address: string) {
  try {
    console.log("Fetching wallet balance for address:", address);
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: process.env.NEXT_PUBLIC_ENV_CHAIN,
      address,
    });

    // if (!response || !response.raw) {
    //   throw new Error("No balance data received from Moralis");
    // }

    return response;
  } catch (error) {
    console.error("Error in getWalletBalance:", error);
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
        const { contractAddresses, walletAddress } = params;
        const transfers = await getWalletTokenTransfers(
          contractAddresses,
          walletAddress
        );
        return res.status(200).json({ data: transfers });

      case "getWalletBalance":
        const balance = await getWalletBalance(params.address);
        return res.status(200).json(balance);

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
