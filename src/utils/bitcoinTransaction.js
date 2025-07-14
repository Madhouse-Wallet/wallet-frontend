import moment from "moment-timezone";

// Get the current user's timezone
export const getCurrentUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error("Error getting user timezone:", error);
    // Fallback to UTC if timezone detection fails
    return "UTC";
  }
};

// Fetch Bitcoin transactions using the new API endpoint
export const fetchBitcoinTransactions = async (address, limit = 100) => {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Bitcoin transactions:", error);
    throw error;
  }
};

// Format Bitcoin transaction data from the new API structure with timezone support
// export const formatBitcoinTransactions = (
//   data,
//   walletAddress,
//   timezone = null
// ) => {
//   if (!data) {
//     return [];
//   }

//   // Use provided timezone or get current user's timezone
//   const userTimezone = timezone || getCurrentUserTimezone();

//   // Check if confirmed transactions exist and have length
//   const confirmedTxs =
//     data.txrefs && Array.isArray(data.txrefs) && data.txrefs.length > 0
//       ? data.txrefs
//       : [];

//   // Check if unconfirmed transactions exist and have length
//   const unconfirmedTxs =
//     data.unconfirmed_txrefs &&
//     Array.isArray(data.unconfirmed_txrefs) &&
//     data.unconfirmed_txrefs.length > 0
//       ? data.unconfirmed_txrefs
//       : [];

//   // Combine confirmed and unconfirmed transactions only if they exist
//   const allTxs = [
//     ...confirmedTxs.map((tx) => ({ ...tx, isConfirmed: true })),
//     ...unconfirmedTxs.map((tx) => ({ ...tx, isConfirmed: false })),
//   ];

//   if (allTxs.length === 0) {
//     return [];
//   }

//   // Group transactions by hash and merge values
//   const groupedTransactions = {};

//   allTxs.forEach((txref) => {
//     const hash = txref.tx_hash;

//     if (!groupedTransactions[hash]) {
//       groupedTransactions[hash] = {
//         ...txref,
//         totalValue: txref.value,
//       };
//     } else {
//       // Merge transactions with same hash by adding values
//       groupedTransactions[hash].totalValue += txref.value;

//       // If any part of the transaction is confirmed, mark the whole as confirmed
//       if (txref.isConfirmed) {
//         groupedTransactions[hash].isConfirmed = true;
//         groupedTransactions[hash].confirmed = txref.confirmed;
//         groupedTransactions[hash].confirmations = txref.confirmations;
//         groupedTransactions[hash].block_height = txref.block_height;
//       }
//     }
//   });

//   // Convert grouped transactions to array and format
//   return Object.values(groupedTransactions).map((tx) => {
//     // Determine if this is a send or receive transaction
//     // tx_input_n >= 0 means it's a send (outgoing)
//     // tx_output_n >= 0 means it's a receive (incoming)
//     const isSend = tx.tx_input_n >= 0;
//     const isReceive = tx.tx_output_n >= 0;

//     // Calculate the amount in BTC
//     const amount = (tx.totalValue / 100000000).toFixed(8);

//     // Determine transaction type
//     let transactionType;
//     if (isSend && !isReceive) {
//       transactionType = "token send";
//     } else if (isReceive && !isSend) {
//       transactionType = "token receive";
//     } else {
//       // If both are present, it might be a complex transaction
//       // Default to send if tx_input_n is not -1
//       transactionType = tx.tx_input_n !== -1 ? "token send" : "token receive";
//     }

//     // Handle date formatting for confirmed vs unconfirmed transactions with timezone
//     const transactionDate = tx.isConfirmed
//       ? moment(tx.confirmed).tz(userTimezone).format("MMMM D, YYYY h:mm A z")
//       : moment(tx.received).tz(userTimezone).format("MMMM D, YYYY h:mm A z");

//     // Determine status based on confirmations
//     let status;
//     if (!tx.isConfirmed) {
//       status = "unconfirmed";
//     } else if (tx.confirmations > 0) {
//       status = "confirmed";
//     } else {
//       status = "pending";
//     }

//     return {
//       id: tx.tx_hash,
//       transactionHash: tx.tx_hash,
//       from: transactionType === "token send" ? walletAddress : "Unknown",
//       to: transactionType === "token send" ? "Unknown" : walletAddress,
//       date: transactionDate,
//       status: status,
//       amount: `${amount} BTC`,
//       type: transactionType,
//       summary: `${transactionType === "token send" ? "Sent" : "Received"} ${amount} BTC`,
//       category: "bitcoin",
//       rawData: tx,
//       day: transactionDate,
//       blockHeight: tx.block_height || null,
//       confirmations: tx.confirmations || 0,
//       doubleSpend: tx.double_spend || false,
//       spent: tx.spent || false,
//       spentBy: tx.spent_by || null,
//       isConfirmed: tx.isConfirmed,
//       // Additional fields for unconfirmed transactions
//       preference: tx.preference || null,
//       received: tx.received || null,
//       // Add timezone info
//       timezone: userTimezone,
//     };
//   });
// };

export const formatBitcoinTransactions = (
  data,
  walletAddress,
  timezone = null
) => {
  if (!data) {
    return [];
  }

  // Use provided timezone or get current user's timezone
  const userTimezone = timezone || getCurrentUserTimezone();

  // Check if confirmed transactions exist and have length
  const confirmedTxs =
    data.txrefs && Array.isArray(data.txrefs) && data.txrefs.length > 0
      ? data.txrefs
      : [];

  // Check if unconfirmed transactions exist and have length
  const unconfirmedTxs =
    data.unconfirmed_txrefs &&
    Array.isArray(data.unconfirmed_txrefs) &&
    data.unconfirmed_txrefs.length > 0
      ? data.unconfirmed_txrefs
      : [];

  // Combine confirmed and unconfirmed transactions only if they exist
  const allTxs = [
    ...confirmedTxs.map((tx) => ({ ...tx, isConfirmed: true })),
    ...unconfirmedTxs.map((tx) => ({ ...tx, isConfirmed: false })),
  ];

  if (allTxs.length === 0) {
    return [];
  }

  // Group transactions by hash and calculate net values
  const groupedTransactions = {};

  allTxs.forEach((txref) => {
    const hash = txref.tx_hash;

    if (!groupedTransactions[hash]) {
      groupedTransactions[hash] = {
        ...txref,
        inputs: [],
        outputs: [],
        totalInputValue: 0,
        totalOutputValue: 0,
      };
    }

    // Separate inputs and outputs
    if (txref.tx_input_n >= 0) {
      // This is an input (money going out)
      groupedTransactions[hash].inputs.push(txref);
      groupedTransactions[hash].totalInputValue += txref.value;
    }

    if (txref.tx_output_n >= 0) {
      // This is an output (money coming in)
      groupedTransactions[hash].outputs.push(txref);
      groupedTransactions[hash].totalOutputValue += txref.value;
    }

    // Update confirmation status - if any part is confirmed, mark whole as confirmed
    if (txref.isConfirmed) {
      groupedTransactions[hash].isConfirmed = true;
      groupedTransactions[hash].confirmed = txref.confirmed;
      groupedTransactions[hash].confirmations = txref.confirmations;
      groupedTransactions[hash].block_height = txref.block_height;
    }
  });

  // Convert grouped transactions to array and format
  return Object.values(groupedTransactions).map((tx) => {
    // Calculate net value: outputs - inputs
    // Positive means received, negative means sent
    const netValue = tx.totalOutputValue - tx.totalInputValue;

    // Determine transaction type and amount
    let transactionType;
    let amount;

    if (netValue > 0) {
      // Net positive = received money
      transactionType = "token receive";
      amount = (netValue / 100000000).toFixed(8);
    } else if (netValue < 0) {
      // Net negative = sent money
      transactionType = "token send";
      amount = (Math.abs(netValue) / 100000000).toFixed(8);
    } else {
      // Net zero = internal transaction (rare case)
      transactionType = "token send";
      amount = (tx.totalInputValue / 100000000).toFixed(8);
    }

    // Handle date formatting for confirmed vs unconfirmed transactions with timezone
    const transactionDate = tx.isConfirmed
      ? moment(tx.confirmed).tz(userTimezone).format("MMMM D, YYYY h:mm A z")
      : moment(tx.received).tz(userTimezone).format("MMMM D, YYYY h:mm A z");

    // Determine status based on confirmations
    let status;
    if (!tx.isConfirmed) {
      status = "unconfirmed";
    } else if (tx.confirmations > 0) {
      status = "confirmed";
    } else {
      status = "pending";
    }

    return {
      id: tx.tx_hash,
      transactionHash: tx.tx_hash,
      from: transactionType === "token send" ? walletAddress : "Unknown",
      to: transactionType === "token send" ? "Unknown" : walletAddress,
      date: transactionDate,
      status: status,
      amount: `${amount} BTC`,
      type: transactionType,
      summary: `${transactionType === "token send" ? "Sent" : "Received"} ${amount} BTC`,
      category: "bitcoin",
      rawData: tx,
      day: transactionDate,
      blockHeight: tx.block_height || null,
      confirmations: tx.confirmations || 0,
      doubleSpend: tx.double_spend || false,
      spent: tx.spent || false,
      spentBy: tx.spent_by || null,
      isConfirmed: tx.isConfirmed,
      // Additional fields for unconfirmed transactions
      preference: tx.preference || null,
      received: tx.received || null,
      // Add timezone info
      timezone: userTimezone,
      // Debug info
      netValue: netValue,
      totalInputValue: tx.totalInputValue,
      totalOutputValue: tx.totalOutputValue,
    };
  });
};
