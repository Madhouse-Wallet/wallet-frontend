import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { maxUint256, erc20Abi, parseErc6492Signature, getContract } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const fetchTokenBalances = async (
  chain: string,
  tokenAddress: string[],
  walletAddress: string
) => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getTokenBalances",
        chainn: chain,
        tokenAddresses: tokenAddress,
        address: walletAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch token balances");
    }
    const result = await response.json();
    return result;
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
  chain: string,
  contractAddress: string[],
  walletAddress: string,
  fromDate: string,
  toDate: string
) => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getWalletTokenTransfers",
        chain: chain,
        contractAddresses: contractAddress,
        walletAddress: walletAddress,
        fromDate: fromDate,
        toDate: toDate,
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

// Adapted from https://github.com/vacekj/wagmi-permit/blob/main/src/permit.ts
export const eip2612Permit = async (
  token: any,
  chain: any,
  ownerAddress: any,
  spenderAddress: any,
  value: any
) => {
  return {
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    domain: {
      name: await token.read.name(),
      version: await token.read.version(),
      chainId: chain.id,
      verifyingContract: token.address,
    },
    message: {
      owner: ownerAddress,
      spender: spenderAddress,
      value,
      nonce: await token.read.nonces([ownerAddress]),
      // The paymaster cannot access block.timestamp due to 4337 opcode
      // restrictions, so the deadline must be MAX_UINT256.
      deadline: maxUint256,
    },
  };
};

export const eip2612Abi = [
  ...erc20Abi,
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

export const signPermit = async (
  tokenAddress: any,
  client: any,
  account: any,
  spenderAddress: any,
  permitAmount: any
) => {
  const token = getContract({
    client,
    address: tokenAddress,
    abi: eip2612Abi,
  });
  const permitData = await eip2612Permit(
    token,
    client.chain,
    account.address,
    spenderAddress,
    permitAmount
  );

  const wrappedPermitSignature = await account.signTypedData(permitData);

  const isValid = await client.verifyTypedData({
    ...permitData,
    address: account.address,
    signature: wrappedPermitSignature,
  });

  if (!isValid) {
    throw new Error(
      `Invalid permit signature for ${account.address}: ${wrappedPermitSignature}`
    );
  }

  const { signature } = parseErc6492Signature(wrappedPermitSignature);
  return signature;
};
