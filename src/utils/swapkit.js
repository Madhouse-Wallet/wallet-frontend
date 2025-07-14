// src/utils/swapkit.js

/**
 * Get a quote from SwapKit API
 * @param {Object} params - The essential parameters for the quote
 * @param {string} params.sellAsset - The asset to sell (e.g. "BASE.USDC-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913")
 * @param {string} params.buyAsset - The asset to buy (e.g. "BTC.BTC")
 * @param {string} params.sellAmount - The amount to sell in smallest unit (e.g. "100000")
 * @param {string} params.sourceAddress - The source wallet address
 * @param {string} params.destinationAddress - The destination wallet address
 * @param {string} [apiKey] - The SwapKit API key
 * @returns {Promise<Object>} - The quote response
 */
async function getSwapQuote(
  { sellAsset, buyAsset, sellAmount, sourceAddress, destinationAddress },
  apiKey = process.env.NEXT_PUBLIC_THORSTREAM_API_KEY_ADDRESS
) {
  try {
    // Validate required parameters
    if (
      !sellAsset ||
      !buyAsset ||
      !sellAmount ||
      !sourceAddress ||
      !destinationAddress
    ) {
      throw new Error("Missing required parameters");
    }

    const response = await fetch("https://api.swapkit.dev/quote", {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sellAsset,
        buyAsset,
        sellAmount,
        sourceAddress,
        destinationAddress,
        providers: ["THORCHAIN_STREAMING"],
        slippage: 1,
        affiliate: "mhw",
        affiliateFee: 50,
        allowSmartContractSender: true,
        allowSmartContractReceiver: true,
        disableSecurityChecks: true,
        // includeTx: true,
        cfBoost: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get quote: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting swap quote:", error);
    throw error;
  }
}

export default getSwapQuote;
