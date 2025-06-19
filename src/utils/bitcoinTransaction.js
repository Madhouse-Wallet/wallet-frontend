// import moment from "moment";

// export const fetchBitcoinTransactions = async (address, limit = 10) => {
//   try {
//     const response = await fetch(
//       `https://api.blockcypher.com/v1/btc/main/addrs/${address}/full?limit=${limit}`
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

// // Format Bitcoin transaction data
// export const formatBitcoinTransactions = (data, walletAddress) => {
//   if (!data?.txs || !Array.isArray(data.txs)) {
//     return [];
//   }

//   return data.txs.map((tx) => {
//     // Determine if this is a send or receive transaction
//     const isSend = tx.inputs.some(
//       (input) => input.addresses && input.addresses.includes(walletAddress)
//     );

//     // Find the relevant output for this transaction
//     const relevantOutput = isSend
//       ? tx.outputs.find(
//           (output) =>
//             output.addresses && !output.addresses.includes(walletAddress)
//         )
//       : tx.outputs.find(
//           (output) =>
//             output.addresses && output.addresses.includes(walletAddress)
//         );

//     // Calculate the amount
//     const amount = relevantOutput
//       ? (relevantOutput.value / 100000000).toFixed(8)
//       : "0.00000000";

//     // Get the other address (counterparty)
//     const counterparty = isSend
//       ? relevantOutput?.addresses?.[0] || "Unknown"
//       : tx.inputs?.[0]?.addresses?.[0] || "Unknown";

//     return {
//       id: tx.hash,
//       transactionHash: tx.hash,
//       from: isSend ? walletAddress : counterparty,
//       to: isSend ? counterparty : walletAddress,
//       date: moment(tx.confirmed || tx.received).format("MMMM D, YYYY h:mm A"),
//       status: tx.confirmations > 0 ? "confirmed" : "pending",
//       amount: `${amount} BTC`,
//       type: isSend ? "token send" : "token receive",
//       summary: `${isSend ? "Sent" : "Received"} ${amount} BTC`,
//       category: "bitcoin",
//       rawData: tx,
//       day: moment(tx.confirmed || tx.received).format("MMMM D, YYYY h:mm A"),
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
  if (!data?.txrefs || !Array.isArray(data.txrefs)) {
    return [];
  }

  // Group transactions by hash and merge values
  const groupedTransactions = {};

  data.txrefs.forEach((txref) => {
    const hash = txref.tx_hash;

    if (!groupedTransactions[hash]) {
      groupedTransactions[hash] = {
        ...txref,
        totalValue: txref.value,
      };
    } else {
      // Merge transactions with same hash by adding values
      groupedTransactions[hash].totalValue += txref.value;
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

    return {
      id: tx.tx_hash,
      transactionHash: tx.tx_hash,
      from: transactionType === "token send" ? walletAddress : "Unknown",
      to: transactionType === "token send" ? "Unknown" : walletAddress,
      date: moment(tx.confirmed).format("MMMM D, YYYY h:mm A"),
      status: tx.confirmations > 0 ? "confirmed" : "pending",
      amount: `${amount} BTC`,
      type: transactionType,
      summary: `${transactionType === "token send" ? "Sent" : "Received"} ${amount} BTC`,
      category: "bitcoin",
      rawData: tx,
      day: moment(tx.confirmed).format("MMMM D, YYYY h:mm A"),
      blockHeight: tx.block_height,
      confirmations: tx.confirmations,
      doubleSpend: tx.double_spend,
      spent: tx.spent || false,
      spentBy: tx.spent_by || null,
    };
  });
};
