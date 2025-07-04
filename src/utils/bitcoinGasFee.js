/**
 * Send Bitcoin transaction via API route
 * @param {Object} config - Configuration object
 * @param {string} config.fromAddress - Source Bitcoin address
 * @param {string} config.toAddress - Destination Bitcoin address
 * @param {number} config.amountSatoshi - Amount to send in satoshis
 * @param {string} config.privateKeyHex - Private key in hex format
 * @param {string} config.network - Network to use ('main', 'test3', 'btc-testnet')
 * @returns {Promise<Object>} - Transaction details
 */
export async function bitcoinGasFeeFunction({
  fromAddress,
  toAddress,
  amountSatoshi,
  privateKeyHex,
  network = "main",
}) {
  try {
    if (!fromAddress || !toAddress || !amountSatoshi || !privateKeyHex) {
      throw new Error("Missing required parameters");
    }

    const response = await fetch("/api/gas-fee-bitcoin-blockcypher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fromAddress,
        toAddress,
        amountSatoshi,
        privateKeyHex,
        network,
      }),
    });
    const result = await response.json();
    // if (result.success !== true) {
    //   throw new Error(result.error || "Failed to send transaction");
    // }

    return result;
  } catch (error) {
    console.error("Error calling Bitcoin API:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
