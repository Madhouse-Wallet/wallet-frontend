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
export async function sendBitcoinFunction({
  fromAddress,
  toAddress,
  amountSatoshi,
  privateKeyHex,
  network = "main",
}) {
  try {
    // Clean private key (remove 0x prefix if present)
    // const cleanPrivateKey = privateKeyHex.startsWith("0x")
    //   ? privateKeyHex.slice(2)
    //   : privateKeyHex;

    // Validate inputs
    if (!fromAddress || !toAddress || !amountSatoshi || !privateKeyHex) {
      throw new Error("Missing required parameters");
    }

    // if (privateKeyHex.length !== 64) {
    //   throw new Error(
    //     `Invalid private key length: Expected 64 hex characters but received ${cleanPrivateKey.length}`
    //   );
    // }

    const response = await fetch("/api/send-bitcoin-blockcypher", {
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

    if (!response.ok) {
      throw new Error(result.error || "Failed to send transaction");
    }

    return result;
  } catch (error) {
    console.error("Error calling Bitcoin API:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
