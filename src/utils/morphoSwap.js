import { Contract, ethers } from "ethers";
import axios from "axios";
import { EnsoClient } from "@ensofinance/sdk";

const API_URL = process.env.NEXT_PUBLIC_LIFI_API_URL;
const LIFI_API_KEY = process.env.NEXT_PUBLIC_LIFI_API_KEY;
const ENSO_API_KEY = process.env.NEXT_PUBLIC_ENSO_API_KEY;
const FEE_RECEIVER = process.env.NEXT_PUBLIC_ENSO_API_FEE_RECEIVER;

const ERC20_ABI = [
  {
    name: "approve",
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "allowance",
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const TOKENS = {
  USDC: {
    8453: {
      address: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
      name: "USDC",
      chainId: 8453,
    },
    1: {
      address: process.env.NEXT_PUBLIC_USDC_ETHEREUM_CONTRACT_ADDRESS,
      name: "USDC",
      chainId: 1,
    },
  },
  MORPHO: {
    address: process.env.NEXT_PUBLIC_MORPHO_CONTRACT_ADDRESS,
    name: "MORPHO",
  },
  PAXG: {
    address: process.env.NEXT_PUBLIC_ENV_ETHERCHAIN_PAXG_Address,
    name: "PAXG",
  },
};

const enso = new EnsoClient({
  apiKey: ENSO_API_KEY,
});

/**
 * Get a quote and execute a token swap using Enso
 * @param {Object} tokenIn - Input token details
 * @param {Object} tokenOut - Output token details
 * @param {string} amountIn - Input amount in smallest unit (e.g., wei)
 * @param {number} chainId - Chain ID for the transaction
 * @param {string} fromAddress - Address executing the swap
 * @returns {Promise<Object>} Quote data including approval and route data
 */
export async function swap(tokenIn, tokenOut, amountIn, chainId, fromAddress) {
  try {
    // Get approval data from Enso
    const approvalData = await enso.getApprovalData({
      fromAddress: fromAddress,
      tokenAddress: tokenIn.address,
      chainId: chainId,
      amount: amountIn,
      routingStrategy: "router",
    });

    // Get the transaction data for the swap
    const routeData = await enso.getRouterData({
      fromAddress: fromAddress,
      receiver: fromAddress,
      chainId: chainId,
      amountIn: amountIn,
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      slippage: 10, // 10% slippage
      routingStrategy: "router",
      fee: 50, // 0.5% fee
      feeReceiver: FEE_RECEIVER,
    });

    console.log(`Expected ${tokenOut.name} amount:`, routeData.amountOut);
    console.log("Approval data available:", !!approvalData);

    // Construct our response in the expected format
    return {
      routeData: {
        tx: routeData.tx,
        amountOut: routeData.amountOut,
      },
      approvalData: approvalData
        ? {
            token: tokenIn.address,
            spender: approvalData.spender,
            amount: amountIn,
            tx: approvalData.tx,
          }
        : null,
      action: {
        fromToken: {
          address: tokenIn.address,
          name: tokenIn.name,
          priceUSD: "1", // We'll use a default here as Enso might not provide prices
        },
        toToken: {
          address: tokenOut.address,
          name: tokenOut.name,
          priceUSD: "1", // Default price
        },
      },
      estimate: {
        fromAmount: amountIn,
        toAmount: routeData.amountOut || "0",
      },
    };
  } catch (error) {
    console.error("Error in swap function:", error);
    throw new Error(`Swap failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Gets a quote for swapping tokens
 * @param {Object} tokenIn - Input token details
 * @param {Object} tokenOut - Output token details
 * @param {string} amountIn - Input amount in smallest unit (e.g., wei)
 * @param {number} chainId - Chain ID for the transaction
 * @param {string} fromAddress - Address executing the swap
 * @returns {Promise<Object>} Quote data
 */
export async function getQuote(
  tokenIn,
  tokenOut,
  amountIn,
  chainId,
  fromAddress
) {
  try {
    return await swap(tokenIn, tokenOut, amountIn, chainId, fromAddress);
  } catch (error) {
    console.error("Error getting quote:", error);
    throw error;
  }
}

/**
 * Check if a token needs approval and get approval transaction
 * @param {string} tokenAddress - Address of the token to approve
 * @param {string} spender - Address of the spender to approve
 * @param {string} amount - Amount to approve
 * @param {string} owner - Address of the token owner
 * @param {Object} provider - Ethers provider
 * @returns {Promise<Object|null>} Approval transaction or null if not needed
 */
export async function checkAndGetApproval(
  tokenAddress,
  spender,
  amount,
  owner,
  provider
) {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const currentAllowance = await tokenContract.allowance(owner, spender);

    if (
      ethers.BigNumber.from(currentAllowance).lt(ethers.BigNumber.from(amount))
    ) {
      return {
        from: owner,
        to: tokenAddress,
        data: tokenContract.interface.encodeFunctionData("approve", [
          spender,
          amount,
        ]),
        value: "0",
      };
    }

    return null; // No approval needed
  } catch (error) {
    console.error("Error checking approval:", error);
    throw error;
  }
}

