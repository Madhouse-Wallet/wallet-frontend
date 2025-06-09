// File: utils/bitcoinService.js
import * as bitcoin from "bitcoinjs-lib";
import * as bigi from "bigi";
import axios from "axios";

/**
 * Send Bitcoin from one address to another
 *
 * @param {Object} options - Bitcoin transaction options
 * @param {string} options.sourceAddress - The Bitcoin address sending the funds
 * @param {string} options.sourcePrivateKey - The private key of the sending address
 * @param {string} options.sourcePublicKey - The public key of the sending address
 * @param {string} options.destinationAddress - The Bitcoin address receiving the funds
 * @param {number} options.amountSatoshi - Amount to send in satoshis
 * @param {string} [options.network='mainnet'] - 'mainnet' or 'testnet'
 * @param {boolean} [options.waitForConfirmation=false] - Whether to wait for transaction confirmation
 * @param {number} [options.confirmationTimeout=30000] - Timeout for waiting for confirmation (ms)
 * @returns {Promise<Object>} - Transaction result object
 */
export async function sendBitcoinAPI({
  sourceAddress,
  sourcePrivateKey,
  sourcePublicKey,
  destinationAddress,
  amountSatoshi,
  network = "mainnet",
  waitForConfirmation = false,
  confirmationTimeout = 30000,
}) {
  try {
    // Validate required parameters
    if (!sourceAddress) throw new Error("Source address is required");
    if (!sourcePrivateKey) throw new Error("Source private key is required");
    if (!sourcePublicKey) throw new Error("Source public key is required");
    if (!destinationAddress) throw new Error("Destination address is required");
    if (!amountSatoshi || amountSatoshi <= 0)
      throw new Error("Valid amount is required");

    // Set the appropriate API URL based on the network
    const rootUrl =
      network === "testnet"
        ? "https://api.blockcypher.com/v1/btc/test3"
        : "https://api.blockcypher.com/v1/btc/main";

    // Create a key from the private key

    const key = new bitcoin.ECKey(bigi.fromHex(sourcePrivateKey), true);

    // Step 1: Create the transaction
    const newtx = {
      inputs: [{ addresses: [sourceAddress] }],
      outputs: [{ addresses: [destinationAddress], value: amountSatoshi }],
    };

    // Get the transaction details
    const transactionResponse = await axios.post(
      `${rootUrl}/txs/new`,
      JSON.stringify(newtx),
      { headers: { "Content-Type": "application/json" } }
    );

    // Check for errors in the transaction creation
    if (
      transactionResponse.data.errors &&
      transactionResponse.data.errors.length
    ) {
      throw new Error(
        `Transaction creation failed: ${transactionResponse.data.errors.join(", ")}`
      );
    }

    const transactionData = transactionResponse.data;

    // Step 2: Sign the transaction
    transactionData.pubkeys = [];
    transactionData.signatures = transactionData.tosign.map(function (tosign) {
      transactionData.pubkeys.push(sourcePublicKey);
      return key.sign(Buffer.from(tosign, "hex")).toDER().toString("hex");
    });

    // Step 3: Send the signed transaction
    const sendResponse = await axios.post(
      `${rootUrl}/txs/send`,
      JSON.stringify(transactionData),
      { headers: { "Content-Type": "application/json" } }
    );

    // Check for errors in sending
    if (sendResponse.data.errors && sendResponse.data.errors.length) {
      throw new Error(
        `Transaction sending failed: ${sendResponse.data.errors.join(", ")}`
      );
    }

    const transactionResult = {
      success: true,
      transactionHash: sendResponse.data.tx.hash,
      amount: amountSatoshi / 100000000, // Convert satoshis to BTC
      from: sourceAddress,
      to: destinationAddress,
      network: network,
      confirmed: false,
      rawTransaction: sendResponse.data,
    };

    // Return immediately if not waiting for confirmation
    if (!waitForConfirmation) {
      return transactionResult;
    }

    // If we are waiting for confirmation, setup a WebSocket
    try {
      // We'll wait for a set timeout for a confirmation
      const confirmationResult = await waitForTransactionConfirmation(
        network,
        sendResponse.data.tx.hash,
        confirmationTimeout
      );

      return {
        ...transactionResult,
        confirmed: confirmationResult.confirmed,
        confirmations: confirmationResult.confirmations,
        blockHeight: confirmationResult.blockHeight,
      };
    } catch (wsError) {
      // If websocket times out, we still return the transaction, just not confirmed
      console.error("WebSocket confirmation error:", wsError);
      return {
        ...transactionResult,
        confirmationStatus: "timed_out",
        confirmationError: wsError.message,
      };
    }
  } catch (error) {
    console.error("Bitcoin send error:", error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation using WebSocket
 * @param {string} network - 'mainnet' or 'testnet'
 * @param {string} transactionHash - The hash of the transaction to monitor
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} - Resolves when transaction is confirmed or times out
 */
export function waitForTransactionConfirmation(
  network,
  transactionHash,
  timeoutMs = 30000
) {
  return new Promise((resolve, reject) => {
    // Only run this in a browser environment with WebSocket support
    if (typeof WebSocket === "undefined") {
      reject(new Error("WebSocket not supported in this environment"));
      return;
    }

    const wsUrl =
      network === "testnet"
        ? "wss://socket.blockcypher.com/v1/btc/test3"
        : "wss://socket.blockcypher.com/v1/btc/main";

    const ws = new WebSocket(wsUrl);
    let pingInterval;
    let timeoutId;

    // Function to keep the websocket alive with pings
    const startPinging = () => {
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event: "ping" }));
        }
      }, 5000);
    };

    // Handle timeout
    timeoutId = setTimeout(() => {
      clearInterval(pingInterval);
      ws.close();
      reject(new Error("Transaction confirmation timed out"));
    }, timeoutMs);

    ws.onopen = () => {
      // Subscribe to transaction confirmation events
      ws.send(
        JSON.stringify({
          filter: `event=new-block-tx&hash=${transactionHash}`,
        })
      );
      startPinging();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // If we get confirmation data
        if (data.confirmations && data.confirmations > 0) {
          clearTimeout(timeoutId);
          clearInterval(pingInterval);
          ws.close();

          resolve({
            confirmed: true,
            confirmations: data.confirmations,
            blockHeight: data.block_height,
          });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      clearTimeout(timeoutId);
      clearInterval(pingInterval);
      reject(error);
    };

    ws.onclose = () => {
      clearTimeout(timeoutId);
      clearInterval(pingInterval);
    };
  });
}

/**
 * Get balance for a Bitcoin address
 * @param {string} address - Bitcoin address to check
 * @param {string} [network='mainnet'] - 'mainnet' or 'testnet'
 * @returns {Promise<Object>} - Balance information
 */
export async function getBitcoinBalance(address, network = "mainnet") {
  try {
    const rootUrl =
      network === "testnet"
        ? "https://api.blockcypher.com/v1/btc/test3"
        : "https://api.blockcypher.com/v1/btc/main";

    const response = await axios.get(`${rootUrl}/addrs/${address}/balance`);

    return {
      address,
      balance: response.data.balance / 100000000, // Convert satoshis to BTC
      unconfirmedBalance: response.data.unconfirmed_balance / 100000000,
      totalBalance:
        (response.data.balance + response.data.unconfirmed_balance) / 100000000,
      balanceSatoshi: response.data.balance,
      unconfirmedBalanceSatoshi: response.data.unconfirmed_balance,
      totalBalanceSatoshi:
        response.data.balance + response.data.unconfirmed_balance,
    };
  } catch (error) {
    console.error("Error fetching Bitcoin balance:", error);
    throw error;
  }
}

/**
 * Create a new Bitcoin address
 * @param {string} [network='mainnet'] - 'mainnet' or 'testnet'
 * @returns {Promise<Object>} - Generated address information
 */
export async function createBitcoinAddress(network = "mainnet") {
  try {
    const rootUrl =
      network === "testnet"
        ? "https://api.blockcypher.com/v1/btc/test3"
        : "https://api.blockcypher.com/v1/btc/main";

    const response = await axios.post(`${rootUrl}/addrs`);

    return {
      address: response.data.address,
      privateKey: response.data.private,
      publicKey: response.data.public,
      wif: response.data.wif,
      network,
    };
  } catch (error) {
    console.error("Error creating Bitcoin address:", error);
    throw error;
  }
}

/**
 * Track transaction history for a Bitcoin address
 * @param {string} address - Bitcoin address to check
 * @param {string} [network='mainnet'] - 'mainnet' or 'testnet'
 * @returns {Promise<Array>} - Array of transactions
 */
export async function getBitcoinTransactions(address, network = "mainnet") {
  try {
    const rootUrl =
      network === "testnet"
        ? "https://api.blockcypher.com/v1/btc/test3"
        : "https://api.blockcypher.com/v1/btc/main";

    const response = await axios.get(`${rootUrl}/addrs/${address}/full`);

    return response.data.txs.map((tx) => ({
      hash: tx.hash,
      confirmations: tx.confirmations,
      blockHeight: tx.block_height,
      receivedTime: new Date(tx.received),
      confirmed: tx.confirmed ? new Date(tx.confirmed) : null,
      total: tx.total / 100000000,
      fees: tx.fees / 100000000,
      inputs: tx.inputs,
      outputs: tx.outputs,
    }));
  } catch (error) {
    console.error("Error fetching Bitcoin transactions:", error);
    throw error;
  }
}
