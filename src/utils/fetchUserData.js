// export async function fetchUserData(walletAddress) {
//     // Validate wallet address
//     if (!walletAddress) {
//       throw new Error("Wallet address is required");
//     }

//     const query = `
//     query GetUserData($address: String!) {
//       users(where: {id: $address}) {
//         mintingDebt
//         tokenBalance
//         totalTokensHeld
//         deposits(first: 1000, orderBy: updateTimestamp, orderDirection: desc) {
//           status
//           user {
//             id
//           }
//           amount
//           newDebt
//           actualAmountReceived
//           treasuryFee
//           walletPubKeyHash
//           fundingTxHash
//           fundingOutputIndex
//           blindingFactor
//           refundPubKeyHash
//           refundLocktime
//           vault
//           depositTimestamp
//           updateTimestamp
//           transactions(orderBy: timestamp, orderDirection: desc) {
//             timestamp
//             txHash
//             from
//             to
//             description
//           }
//           id
//         }
//         redemptions(first: 1000, orderBy: updateTimestamp, orderDirection: desc) {
//           id
//           status
//           user {
//             id
//           }
//           amount
//           walletPubKeyHash
//           redeemerOutputScript
//           redemptionTxHash
//           treasuryFee
//           txMaxFee
//           completedTxHash
//           redemptionTimestamp
//           updateTimestamp
//           transactions(orderBy: timestamp, orderDirection: desc) {
//             timestamp
//             txHash
//             from
//             to
//             description
//           }
//         }
//       }
//     }
//   `;

//     const variables = {
//       address: walletAddress,
//     };

//     try {
//       const response = await fetch(
//         "https://gateway.thegraph.com/api/69cae31b1858ecee5072171ae8877fc9/subgraphs/id/EAabZitXhygFzb9gXNCvwRvfeNJf2qkffv3Kykhdqbj5",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query,
//             variables,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       return data.data.users[0];
//     } catch (error) {
//       throw error;
//     }
//   }

export async function fetchUserData(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const query = `
    query GetUserData($address: String!) {
      users(where: {id: $address}) {
        mintingDebt
        tokenBalance
        totalTokensHeld
        deposits(first: 1000, orderBy: updateTimestamp, orderDirection: desc) {
          status
          user {
            id
          }
          amount
          newDebt
          actualAmountReceived
          treasuryFee
          walletPubKeyHash
          fundingTxHash
          fundingOutputIndex
          blindingFactor
          refundPubKeyHash
          refundLocktime
          vault
          depositTimestamp
          updateTimestamp
          transactions(orderBy: timestamp, orderDirection: desc) {
            timestamp
            txHash
            from
            to
            description
          }
          id
        }
        redemptions(first: 1000, orderBy: updateTimestamp, orderDirection: desc) {
          id
          status
          user {
            id
          }
          amount
          walletPubKeyHash
          redeemerOutputScript
          redemptionTxHash
          treasuryFee
          txMaxFee
          completedTxHash
          redemptionTimestamp
          updateTimestamp
          transactions(orderBy: timestamp, orderDirection: desc) {
            timestamp
            txHash
            from
            to
            description
          }
        }
      }
    }
  `;

  const variables = {
    address: walletAddress,
  };

  // Helper function to reverse bytes in hex string
  function reverseBytes(hexStr) {
    // Remove '0x' prefix if present
    hexStr = hexStr.replace("0x", "");

    // Split into pairs of characters (bytes)
    const bytes = hexStr.match(/.{2}/g) || [];

    // Reverse the array of bytes and join back together
    return bytes.reverse().join("");
  }

  try {
    const response = await fetch(
      "https://gateway.thegraph.com/api/69cae31b1858ecee5072171ae8877fc9/subgraphs/id/DETCX5Xm6tJfctRcZAxhQB9q3aK8P4BXLbujHmzEBXYV",
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

    // Transform the data to match explorer format
    const transformedData = data.data.users.map((user) => ({
      ...user,
      deposits: user.deposits.map((deposit) => ({
        ...deposit,
        // Convert blindingFactor from hex to decimal
        blindingFactor: deposit.blindingFactor
          ? BigInt(deposit.blindingFactor).toString()
          : null,
        // Reverse bytes in fundingTxHash
        fundingTxHash: deposit.fundingTxHash
          ? reverseBytes(deposit.fundingTxHash)
          : null,
      })),
      redemptions: user.redemptions.map((redemption) => ({
        ...redemption,
        // Convert blindingFactor from hex to decimal
        // blindingFactor: redemption.blindingFactor ?
        //   BigInt(redemption.blindingFactor).toString() : null,
        // Reverse bytes in fundingTxHash
        redemptionTxHash: redemption.redemptionTxHash
          ? reverseBytes(redemption.redemptionTxHash)
          : null,
        completedTxHash: redemption.completedTxHash
          ? reverseBytes(redemption.completedTxHash)
          : null,
      })),
    }));
    return transformedData[0];
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
