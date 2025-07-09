import { EnsoClient } from "@ensofinance/sdk";

const FEE_RECEIVER = process.env.NEXT_PUBLIC_MADHOUSE_FEE;
const FEE_VALUE = process.env.NEXT_PUBLIC_ENSO_API_FEE_VALUE;

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
  apiKey: process.env.NEXT_PUBLIC_ENSO_API_KEY,
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
      fee: FEE_VALUE,
      feeReceiver: FEE_RECEIVER,
    });

    // Construct our response in the expected format
    return {
      routeData: {
        tx: routeData.tx,
        amountOut: routeData.amountOut,
      },
      // approvalData: approvalData
      //   ? {
      //       token: tokenIn.address,
      //       spender: approvalData.spender,
      //       amount: amountIn,
      //       tx: approvalData.tx,
      //     }
      //   : null,
      approvalData: {
        tx: approvalData.tx,
        // amountOut: routeData.amountOut,
      },
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

export async function swapUSDC(
  tokenIn,
  tokenOut,
  amountIn,
  chainId,
  fromAddress
) {
  try {
    // Get approval data from Enso
    const approvalData = await enso.getApprovalData({
      fromAddress: fromAddress,
      tokenAddress: tokenIn,
      chainId: chainId,
      amount: amountIn,
      routingStrategy: "router",
    });

    // Get the transaction data for the swap
    const routeData = await enso.getRouterData({
      fromAddress: fromAddress,
      receiver: process.env.NEXT_PUBLIC_REAP_RECEIVER_ADDRESS,
      chainId: chainId,
      amountIn: amountIn,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      slippage: 10, // 10% slippage
      routingStrategy: "router",
      fee: FEE_VALUE,
      feeReceiver: FEE_RECEIVER,
      destinationChainId: process.env.NEXT_PUBLIC_POLYGON_CHAIN,
    });

    return {
      routeData: {
        tx: routeData.tx,
        amountOut: routeData.amountOut,
      },

      approvalData: {
        tx: approvalData.tx,
      },
      action: {
        fromToken: {
          address: tokenIn,
          name: tokenIn.name,
          priceUSD: "1",
        },
        toToken: {
          address: tokenOut,
          name: tokenOut,
          priceUSD: "1",
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

export async function bridge(
  tokenIn,
  tokenOut,
  amountIn,
  sourceChainId,
  destinationChainId,
  fromAddress,
  receiver = null
) {
  try {
    // If no receiver is specified, use the fromAddress
    const recipientAddress = receiver || fromAddress;

    // Get approval data from Enso if needed
    const approvalData = await enso.getApprovalData({
      fromAddress: fromAddress,
      tokenAddress: tokenIn.address,
      chainId: sourceChainId,
      amount: amountIn,
      routingStrategy: "router",
    });

    // Create payload for the bridge transaction
    const bundlePayload = [
      {
        protocol: "stargate",
        action: "bridge",
        args: {
          primaryAddress: "0x27a16dc786820b16e5c9028b75b99f6f604b5d26",
          tokenIn: tokenIn.address,
          amountIn: amountIn,
          destinationChainId: destinationChainId,
          receiver: recipientAddress,
          callback: [
            {
              protocol: "enso",
              action: "balance",
              args: {
                token: process.env.NEXT_PUBLIC_USDC_ETHEREUM_CONTRACT_ADDRESS,
              },
            },
            {
              protocol: "enso",
              action: "route",
              args: {
                tokenIn: process.env.NEXT_PUBLIC_USDC_ETHEREUM_CONTRACT_ADDRESS,
                tokenOut: tokenOut.address,
                amountIn: {
                  useOutputOfCallAt: 0,
                },
              },
              slippage: "25",
            },
          ],
        },
      },
    ];

    // Use enso.getBundleData instead of axios call
    const bundleData = await enso.getBundleData(
      {
        fromAddress: fromAddress,
        chainId: sourceChainId,
        routingStrategy: "router",
      },
      bundlePayload
    );

    // Return data in the requested format
    return {
      amountsOut: bundleData.amountsOut || { [tokenOut.address]: "0" },
      bundle: bundleData.bundle,
      createdAt: bundleData.createdAt,
      gas: bundleData.gas,
      route: bundleData.route || [
        {
          action: "swap",
          protocol: "enso",
          chainId: destinationChainId,
          tokenIn: [tokenIn.address],
          tokenOut: [tokenOut.address],
        },
      ],

      chain: sourceChainId,
      to: "0x27a16dc786820b16e5c9028b75b99f6f604b5d26",
      tx: bundleData.tx,
      // Include approval data separately for frontend usage
      approvalData: approvalData
        ? {
            token: approvalData.token,
            spender: approvalData.spender,
            amount: approvalData.amount,
            tx: approvalData.tx,
            gas: approvalData.gas,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error in bridge function:", error);
    throw new Error(`Bridge failed: ${error.message || "Unknown error"}`);
  }
}

export async function reverseBridge(
  tokenIn,
  tokenOut,
  amountIn,
  sourceChainId,
  destinationChainId,
  fromAddress,
  receiver = null
) {
  try {
    // If no receiver is specified, use the fromAddress
    const recipientAddress = receiver || fromAddress;

    // Get approval data from Enso if needed
    const approvalData = await enso.getApprovalData({
      fromAddress: fromAddress,
      tokenAddress: tokenIn.address,
      chainId: sourceChainId,
      amount: amountIn,
      routingStrategy: "router",
    });

    // Create payload for the bridge transaction
    const bundlePayload = [
      {
        protocol: "enso",
        action: "route",
        slippage: 25,
        args: {
          tokenIn: tokenIn.address,
          amountIn: amountIn,
          tokenOut: process.env.NEXT_PUBLIC_USDC_ETHEREUM_CONTRACT_ADDRESS, // USDC on Ethereum
        },
      },
      {
        protocol: "stargate",
        action: "bridge",
        args: {
          primaryAddress: "0xc026395860db2d07ee33e05fe50ed7bd583189c7",
          destinationChainId: destinationChainId, // Base chain ID (8453)
          receiver: recipientAddress,
          tokenIn: process.env.NEXT_PUBLIC_USDC_ETHEREUM_CONTRACT_ADDRESS, // USDC on Ethereum
          amountIn: {
            useOutputOfCallAt: 0, // Use output from the first route call
          },
        },
      },
    ];

    // Use enso.getBundleData with the new payload structure
    const bundleData = await enso.getBundleData(
      {
        chainId: sourceChainId,
        fromAddress: fromAddress,
        spender: fromAddress,
        routingStrategy: "router",
      },
      bundlePayload
    );

    // Return data in the exact format as the JSON response
    return {
      createdAt: bundleData.createdAt || Date.now(),
      tx: bundleData.tx || {
        data: bundleData.data || "0x",
        to: bundleData.to || "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf",
        from: fromAddress,
        value: bundleData.value || "0",
      },
      amountsOut: bundleData.amountsOut || {
        [tokenOut.address]: "0",
      },
      gas: bundleData.gas || "0",
      bundle: bundleData.bundle || bundlePayload,
      route: bundleData.route || [
        {
          action: "swap",
          protocol: "enso",
          tokenIn: [tokenIn.address],
          tokenOut: [tokenOut.address],
          chainId: sourceChainId,
        },
      ],

      // Include approval data separately for frontend usage if needed
      approvalData: approvalData
        ? {
            token: approvalData.token,
            spender: approvalData.spender,
            amount: approvalData.amount,
            tx: approvalData.tx,
            gas: approvalData.gas,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error in bridge function:", error);
    throw new Error(`Bridge failed: ${error.message || "Unknown error"}`);
  }
}
