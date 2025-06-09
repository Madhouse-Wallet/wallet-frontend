import moment from "moment";

// BitQuery v2 GraphQL endpoint
const BITQUERY_API_URL = "https://graphql.bitquery.io/";

/**
 * Fetches Bitcoin transactions for a given wallet address
 * @param {string} walletAddress - Bitcoin wallet address to fetch transactions for
 * @param {string} accessToken - Authorization token for BitQuery API
 * @param {string|null} startDate - Optional start date (YYYY-MM-DD)
 * @param {string|null} endDate - Optional end date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of transaction data
 */
export const fetchBitcoinTransactionsByAddress = async (
  walletAddress,
  accessToken,
  startDate = null,
  endDate = null
) => {
  // Build date filter if dates are provided
  let dateFilter = "";
  if (startDate || endDate) {
    const dateConditions = [];
    if (startDate) dateConditions.push(`after: "${startDate}"`);
    if (endDate) dateConditions.push(`before: "${endDate}"`);
    dateFilter = `date: {${dateConditions.join(", ")}}`;
  }

  // GraphQL query using the Bitcoin API description
  const query = `
    query($network: BitcoinNetwork!, $address: String!, $limit: Int!) {
      bitcoin(network: $network) {
        transactions(
          options: {limit: $limit, desc: "block.timestamp.iso8601"}
          ${dateFilter}
          any: {inputAddress: {is: $address}, outputAddress: {is: $address}}
        ) {
          hash
          block {
            height
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
              iso8601
            }
          }
          feeValue
          feeValueDecimal
          inputCount
          inputValue
          inputValueDecimal
          outputCount
          outputValue
          outputValueDecimal
          txSize
        }
        
        # Also get transactions where this address is receiving
        outputs: transactions(
          options: {limit: $limit, desc: "block.timestamp.iso8601"}
          ${dateFilter}
          outputAddress: {is: $address}
        ) {
          hash
          block {
            height
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
              iso8601
            }
          }
          feeValue
          feeValueDecimal
          inputCount
          inputValue
          inputValueDecimal
          outputCount
          outputValue
          outputValueDecimal
          txSize
        }
      }
    }
  `;

  const variables = {
    network: "bitcoin",
    address: walletAddress,
    limit: 50, // Limit per query direction (sent/received)
  };

  // Set authorization header with token
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const response = await fetch(BITQUERY_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`BitQuery API failed with status ${response.status}`);
    }

    const responseData = await response.json();

    // Check for errors in the response
    if (responseData.errors) {
      console.error("BitQuery API returned errors:", responseData.errors);
      throw new Error(`BitQuery API error: ${responseData.errors[0].message}`);
    }

    // Combine sent and received transactions (inputs and outputs)
    const sentTransactions = responseData?.data?.bitcoin?.transactions || [];
    const receivedTransactions = responseData?.data?.bitcoin?.outputs || [];

    // Tag transactions with direction
    sentTransactions.forEach((tx) => (tx._direction = "send"));
    receivedTransactions.forEach((tx) => (tx._direction = "receive"));

    // Combine and remove duplicates by hash
    const allTransactions = [...sentTransactions, ...receivedTransactions];
    const uniqueTransactions = [];
    const seenTxHashes = new Set();

    for (const tx of allTransactions) {
      if (!seenTxHashes.has(tx.hash)) {
        seenTxHashes.add(tx.hash);
        uniqueTransactions.push(tx);
      }
    }

    return uniqueTransactions;
  } catch (error) {
    console.error("Error fetching Bitcoin transactions:", error);
    throw error;
  }
};

/**
 * Formats raw Bitcoin transactions into a standardized format
 * @param {Array} transactions - Raw transaction data from API
 * @param {string} walletAddress - Bitcoin wallet address
 * @returns {Array} - Formatted transaction data
 */
export const formatBitcoinTransactions = (transactions, walletAddress) => {
  if (!transactions || !Array.isArray(transactions)) return [];

  return transactions.map((tx) => {
    // Determine transaction type based on tagged direction or values
    const isSend =
      tx._direction === "send" ||
      (tx.inputValue > tx.outputValue && !tx._direction);

    // Calculate actual transferred amount, accounting for fees
    const outputValue = parseFloat(tx.outputValue) || 0;
    const inputValue = parseFloat(tx.inputValue) || 0;
    const fee = parseFloat(tx.feeValue) || 0;

    // For send transactions, amount is what was sent minus fees
    // For receive transactions, amount is what was received
    const amount = Math.abs(outputValue - inputValue - fee).toFixed(8);

    // Format date from block timestamp
    const dateString =
      tx.block?.timestamp?.time || tx.block?.timestamp?.iso8601;
    const date = dateString
      ? moment(dateString).format("MMMM D, YYYY h:mm A")
      : "Unknown Date";

    return {
      id: tx.hash,
      transactionHash: tx.hash,
      from: isSend ? walletAddress : "External Address",
      to: isSend ? "External Address" : walletAddress,
      date: date,
      status: "confirmed", // BitQuery only returns confirmed transactions
      amount: `${amount} BTC`,
      type: isSend ? "token send" : "token receive",
      summary: `${isSend ? "Sent" : "Received"} ${amount} BTC`,
      category: "bitcoin",
      rawData: tx,
      day: date,
    };
  });
};
