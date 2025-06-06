export async function fetchTransactions(walletAddress) {

  // Validate wallet address
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  // Use a template literal to inject the wallet address into the query
  // const query = `
  //     query GetTransactions($address: String!) {
  //       transactions(
  //         first: 10
  //         where: {from: $address}
  //       ) {
  //         id
  //         txHash
  //         timestamp
  //         from
  //         amount
  //         to
  //       }
  //     }
  //   `;

  const query = `
  query GetTransactions($address: String!) {
    transactions(
      first: 10
      where: {from: $address}
    ) {
    id
    txHash
    timestamp
    from
    amount
    description
    to
    deposits {
      fundingTxHash
      fundingOutputIndex
      status
      amount
      updateTimestamp
      treasuryFee
    }
    redemptions {
      redemptionTimestamp
      redemptionTxHash
      status
      amount
      txMaxFee
      updateTimestamp
    }
  }
  }
`;

  const variables = {
    address: walletAddress,
  };

  try {
    const response = await fetch(
      "https://gateway.thegraph.com/api/69cae31b1858ecee5072171ae8877fc9/subgraphs/id/EAabZitXhygFzb9gXNCvwRvfeNJf2qkffv3Kykhdqbj5",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}
