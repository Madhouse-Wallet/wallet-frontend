// Global function for getting quotes based on receiving amount (toAmount)

import axios from "axios";
export async function getQuoteByReceivingAmount(
  fromChain,
  fromToken,
  toChain,
  toToken,
  toAmount,
  fromAddress
) {
  try {
    // Since we're swapping on the same chain (Base), fromChain and toChain are the same
    // const fromChain = "BASE";
    // const toChain = "BASE";
    console.log(
      "line-16",
      fromChain,
      fromToken,
      toChain,
      toToken,
      toAmount,
      fromAddress
    );
    const result = await axios.get("https://li.quest/v1/quote/toAmount", {
      params: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        toAmount,
        fromAddress,
      },
    });

    console.log(`Quote received: ${JSON.stringify(result.data, null, 2)}`);
    return result.data;
  } catch (error) {
    console.error("Error getting quote:", error);
    throw error;
  }
}
