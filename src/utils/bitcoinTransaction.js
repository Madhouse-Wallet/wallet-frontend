import moment from "moment";

export const fetchBitcoinTransactions = async (address, limit = 20) => {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}/full?limit=${limit}`
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

// Format Bitcoin transaction data
export const formatBitcoinTransactions = (data, walletAddress) => {
  if (!data?.txs || !Array.isArray(data.txs)) {
    return [];
  }

  return data.txs.map((tx) => {
    // Determine if this is a send or receive transaction
    const isSend = tx.inputs.some(
      (input) => input.addresses && input.addresses.includes(walletAddress)
    );

    // Find the relevant output for this transaction
    const relevantOutput = isSend
      ? tx.outputs.find(
          (output) =>
            output.addresses && !output.addresses.includes(walletAddress)
        )
      : tx.outputs.find(
          (output) =>
            output.addresses && output.addresses.includes(walletAddress)
        );

    // Calculate the amount
    const amount = relevantOutput
      ? (relevantOutput.value / 100000000).toFixed(8)
      : "0.00000000";

    // Get the other address (counterparty)
    const counterparty = isSend
      ? relevantOutput?.addresses?.[0] || "Unknown"
      : tx.inputs?.[0]?.addresses?.[0] || "Unknown";

    return {
      id: tx.hash,
      transactionHash: tx.hash,
      from: isSend ? walletAddress : counterparty,
      to: isSend ? counterparty : walletAddress,
      date: moment(tx.confirmed || tx.received).format("MMMM D, YYYY h:mm A"),
      status: tx.confirmations > 0 ? "confirmed" : "pending",
      amount: `${amount} BTC`,
      type: isSend ? "token send" : "token receive",
      summary: `${isSend ? "Sent" : "Received"} ${amount} BTC`,
      category: "bitcoin",
      rawData: tx,
      day: moment(tx.confirmed || tx.received).format("MMMM D, YYYY h:mm A"),
    };
  });
};
