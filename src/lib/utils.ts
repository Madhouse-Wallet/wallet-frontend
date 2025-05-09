import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const fetchTokenBalances = async (
  tokenAddress: string[],
  walletAddress: string
) => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getTokenBalances",
        tokenAddresses: tokenAddress,
        address: walletAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch token balances");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchWalletHistory = async (walletAddress: string) => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getWalletHistory",
        address: walletAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch wallet history");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchTokenTransfers = async (
  contractAddress: string[],
  walletAddress: string
) => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getWalletTokenTransfers",
        contractAddress: contractAddress,
        walletAddress: walletAddress,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error || "Failed to fetch token transfers");
      } catch (e) {
        throw new Error(`Server error: ${responseText}`);
      }
    }

    const data = JSON.parse(responseText);
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBalance = async (walletAddress: string) => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getWalletBalance",
        address: walletAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch wallet balance");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
