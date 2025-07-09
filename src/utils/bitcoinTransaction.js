// import moment from "moment";

// // Fetch Bitcoin transactions using the new API endpoint
// export const fetchBitcoinTransactions = async (address, limit = 10) => {
//   try {
//     const response = await fetch(
//       `https://api.blockcypher.com/v1/btc/main/addrs/${address}?limit=${limit}`
//     );

//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching Bitcoin transactions:", error);
//     throw error;
//   }
// };

// // Format Bitcoin transaction data from the new API structure
// export const formatBitcoinTransactions = (data, walletAddress) => {
//   if (!data?.txrefs || !Array.isArray(data.txrefs)) {
//     return [];
//   }

//   // Group transactions by hash and merge values
//   const groupedTransactions = {};

//   data.txrefs.forEach((txref) => {
//     const hash = txref.tx_hash;

//     if (!groupedTransactions[hash]) {
//       groupedTransactions[hash] = {
//         ...txref,
//         totalValue: txref.value,
//       };
//     } else {
//       // Merge transactions with same hash by adding values
//       groupedTransactions[hash].totalValue += txref.value;
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

//     return {
//       id: tx.tx_hash,
//       transactionHash: tx.tx_hash,
//       from: transactionType === "token send" ? walletAddress : "Unknown",
//       to: transactionType === "token send" ? "Unknown" : walletAddress,
//       date: moment(tx.confirmed).format("MMMM D, YYYY h:mm A"),
//       status: tx.confirmations > 0 ? "confirmed" : "pending",
//       amount: `${amount} BTC`,
//       type: transactionType,
//       summary: `${transactionType === "token send" ? "Sent" : "Received"} ${amount} BTC`,
//       category: "bitcoin",
//       rawData: tx,
//       day: moment(tx.confirmed).format("MMMM D, YYYY h:mm A"),
//       blockHeight: tx.block_height,
//       confirmations: tx.confirmations,
//       doubleSpend: tx.double_spend,
//       spent: tx.spent || false,
//       spentBy: tx.spent_by || null,
//     };
//   });
// };

import moment from "moment";

// Fetch Bitcoin transactions using the new API endpoint
export const fetchBitcoinTransactions = async (address, limit = 10) => {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}?limit=${limit}`
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

// Format Bitcoin transaction data from the new API structure
export const formatBitcoinTransactions = (data, walletAddress) => {
  if (!data) {
    return [];
  }

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

  // Group transactions by hash and merge values
  const groupedTransactions = {};

  allTxs.forEach((txref) => {
    const hash = txref.tx_hash;

    if (!groupedTransactions[hash]) {
      groupedTransactions[hash] = {
        ...txref,
        totalValue: txref.value,
      };
    } else {
      // Merge transactions with same hash by adding values
      groupedTransactions[hash].totalValue += txref.value;

      // If any part of the transaction is confirmed, mark the whole as confirmed
      if (txref.isConfirmed) {
        groupedTransactions[hash].isConfirmed = true;
        groupedTransactions[hash].confirmed = txref.confirmed;
        groupedTransactions[hash].confirmations = txref.confirmations;
        groupedTransactions[hash].block_height = txref.block_height;
      }
    }
  });

  // Convert grouped transactions to array and format
  return Object.values(groupedTransactions).map((tx) => {
    // Determine if this is a send or receive transaction
    // tx_input_n >= 0 means it's a send (outgoing)
    // tx_output_n >= 0 means it's a receive (incoming)
    const isSend = tx.tx_input_n >= 0;
    const isReceive = tx.tx_output_n >= 0;

    // Calculate the amount in BTC
    const amount = (tx.totalValue / 100000000).toFixed(8);

    // Determine transaction type
    let transactionType;
    if (isSend && !isReceive) {
      transactionType = "token send";
    } else if (isReceive && !isSend) {
      transactionType = "token receive";
    } else {
      // If both are present, it might be a complex transaction
      // Default to send if tx_input_n is not -1
      transactionType = tx.tx_input_n !== -1 ? "token send" : "token receive";
    }

    // Handle date formatting for confirmed vs unconfirmed transactions
    const transactionDate = tx.isConfirmed
      ? moment(tx.confirmed).format("MMMM D, YYYY h:mm A")
      : moment(tx.received).format("MMMM D, YYYY h:mm A");

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
    };
  });
};
