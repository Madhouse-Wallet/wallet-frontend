// src/pages/api/swap-quote.js
import getSwapQuote from "../../utils/swapkit";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      sellAsset,
      buyAsset,
      sellAmount,
      sourceAddress,
      destinationAddress,
    } = req.body;

    // Validate required parameters
    if (
      !sellAsset ||
      !buyAsset ||
      !sellAmount ||
      !sourceAddress ||
      !destinationAddress
    ) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Get the swap quote
    const quoteResult = await getSwapQuote({
      sellAsset,
      buyAsset,
      sellAmount,
      sourceAddress,
      destinationAddress,
    });

    // Return the quote result
    res.status(200).json(quoteResult);
  } catch (error) {
    console.error("Error in swap-quote API:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to get swap quote" });
  }
}
