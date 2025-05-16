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

async function getTokenBalances(
  chainn: string,
  tokenAddresses: string[],
  address: string
) {
  const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
    chain: chainn,
    tokenAddresses,
    address,
  });
  return response;
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
  chain: string,
  contractAddresses: string[],
  walletAddress: string,
  fromDate?: string,
  toDate?: string
) {
  try {
    const options: any = {
      // chain: process.env.NEXT_PUBLIC_ENV_CHAIN,
      chain: chain,
      order: "DESC",
      address: walletAddress,
      contractAddresses,
    };

    if (fromDate) options.fromDate = fromDate;
    if (toDate) options.toDate = toDate;

    const response = await Moralis.EvmApi.token.getWalletTokenTransfers(
      options
    );

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
        const { chainn, tokenAddresses, address } = params;
        const balances = await getTokenBalances(
          chainn,
          tokenAddresses,
          address
        );
        return res.status(200).json(balances);

      case "getWalletHistory":
        const history = await getWalletHistory(params.address);
        return res.status(200).json(history);

      case "getWalletTokenTransfers":
        const { chain, contractAddresses, walletAddress, fromDate, toDate } =
          params;
        const transfers = await getWalletTokenTransfers(
          chain,
          contractAddresses,
          walletAddress,
          fromDate,
          toDate
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
