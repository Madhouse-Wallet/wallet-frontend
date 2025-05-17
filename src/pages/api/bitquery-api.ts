export const fetchBitcoinTransactionsByAddress = async (
  address: string,
  startDate?: string, // format: YYYY-MM-DD
  endDate?: string // format: YYYY-MM-DD
) => {
  if (!address) {
    throw new Error("Bitcoin address is required.");
  }

  // Dynamically build the date filter
  let dateFilter = "";
  if (startDate && endDate) {
    dateFilter = `date: {after: "${startDate}", till: "${endDate}"},`;
  } else if (startDate) {
    dateFilter = `date: {after: "${startDate}"},`;
  } else if (endDate) {
    dateFilter = `date: {till: "${endDate}"},`;
  }

  const query = {
    query: `
        {
          bitcoin {
            transactions(
              inputAddress: {is: "${address}"},
              ${dateFilter}
              options: {desc: "block.timestamp.iso8601", limit: 100}
            ) {
              block {
                height
                timestamp {
                  iso8601
                }
              }
              feeValue(in: USD)
              feeValueDecimal
              hash
              index
              inputCount
              inputCountBigInt
              inputValue
              inputValueDecimal
              minedValue
              minedValueDecimal
              outputCount
              outputCountBigInt
              outputValue
              outputValueDecimal
              txCoinbase
              txLocktime
              txSize
              txVersion
              txVsize
              txWeight
            }
          }
        }
      `,
  };

  try {
    const response = await fetch("https://graphql.bitquery.io", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "EU56PGHmQib3QLYMaRXqTxTxyA", // 🔐 Replace with your actual Bitquery API key
        Authorization: "Bearer EU56PGHmQib3QLYMaRXqTxTxyA",
      },
      body: JSON.stringify(query),
    });

    const json = await response.json();

    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
      return null;
    }

    return json.data.bitcoin.transactions;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};
