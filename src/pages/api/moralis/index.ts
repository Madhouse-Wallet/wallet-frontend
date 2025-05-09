import type { NextApiRequest, NextApiResponse } from "next";
import Moralis from "moralis";

const API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

let isInitialized = false;

async function initializeMoralis() {
  if (!isInitialized) {
    try {
      await Moralis.start({ apiKey: API_KEY });
      isInitialized = true;
    } catch (error) {
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
    const response = await Moralis.EvmApi.wallets.getWalletHistory({
      chain: process.env.NEXT_PUBLIC_ENV_CHAIN,
      order: "DESC",
      address: address,
    });

    return response;
  } catch (error) {
    throw error;
  }
}

async function getWalletTokenTransfers(
  contractAddresses: string[],
  walletAddress: string
) {
  try {
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
    throw error;
  }
}

async function getWalletBalance(address: string) {
  try {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: process.env.NEXT_PUBLIC_ENV_CHAIN,
      address,
    });

    return response;
  } catch (error) {
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
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Operation failed",
    });
  }
}
