import axios from "axios";

/**
 * Send Bitcoin using BlockCypher API without WebAssembly dependencies
 * @param {Object} config - Configuration object
 * @param {string} config.fromAddress - Source Bitcoin address
 * @param {string} config.toAddress - Destination Bitcoin address
 * @param {number} config.amountSatoshi - Amount to send in satoshis
 * @param {string} config.privateKeyHex - Private key in hex format
 * @param {string} config.wif - WIF formatted private key (alternative to privateKeyHex)
 * @param {string} config.network - Network to use (e.g., 'main', 'test', 'btc-testnet')
 * @returns {Promise<Object>} - Transaction details
 */
export async function sendBitcoinFunction({
  fromAddress,
  toAddress,
  amountSatoshi,
  privateKeyHex,
  wif,
  network = "main",
}) {
  try {
    const baseUrl = `https://api.blockcypher.com/v1/btc/${network}`;

    // We'll use BlockCypher for signing instead of local signing to avoid WebAssembly issues

    // 1. Create a new transaction
    const newTx = {
      inputs: [{ addresses: [fromAddress] }],
      outputs: [{ addresses: [toAddress], value: amountSatoshi }],
    };

    console.log(
      `Creating transaction from ${fromAddress} to ${toAddress} for ${amountSatoshi} satoshis`
    );

    // 2. Get the transaction with signing information
    const txCreateResponse = await axios.post(`${baseUrl}/txs/new`, newTx);
    console.log("txCreateResponse----------", txCreateResponse);
    const tmpTx = txCreateResponse.data;

    console.log("Transaction created:", tmpTx.tx.hash);

    // 3. Use BlockCypher to sign the transaction
    let signingPayload;

    if (wif) {
      // If WIF is provided, use it directly
      signingPayload = {
        tx: tmpTx.tx,
        tosign: tmpTx.tosign,
        private: wif,
      };
    } else if (privateKeyHex) {
      // If hex private key is provided, use it
      signingPayload = {
        tx: tmpTx.tx,
        tosign: tmpTx.tosign,
        private: privateKeyHex,
      };
    } else {
      throw new Error("Either privateKeyHex or wif must be provided");
    }

    console.log("Sending transaction for signing and broadcasting");

    // 4. Send to BlockCypher for signing and broadcasting in one step
    const txSignAndSendResponse = await axios.post(
      `${baseUrl}/txs/send`,
      signingPayload
    );
    const finalTx = txSignAndSendResponse.data;

    console.log("Transaction sent:", finalTx.tx.hash);

    return {
      success: true,
      transactionHash: finalTx.tx.hash,
      details: finalTx,
    };
  } catch (error) {
    console.error(
      "Error sending Bitcoin:",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    };
  }
}
