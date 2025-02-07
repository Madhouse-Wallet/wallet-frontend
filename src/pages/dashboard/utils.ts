export const fetchTokenBalances = async (tokenAddress:string[],walletAddress:string) => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getTokenBalances",
        tokenAddresses: tokenAddress,
        address: walletAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch token balances");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching token balances:", error);
    throw error;
  }
};

export const fetchWalletHistory = async () => {
  try {
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getWalletHistory",
        address: "0xcB1C1FdE09f811B294172696404e88E658659905",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch wallet history");
    }

    const data = await response.json();
    console.log("Wallet history:", data);
    return data;
  } catch (error) {
    console.error("Error fetching wallet history:", error);
    throw error;
  }
};

export const fetchTokenTransfers = async (contractAddress:string[], walletAddress:string) => {
  try {
    console.log("Fetching token transfers...");
    const response = await fetch("/api/moralis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getWalletTokenTransfers",
        contractAddress:contractAddress,
        walletAddress: walletAddress
      }),
    });

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error || "Failed to fetch token transfers");
      } catch (e) {
        throw new Error(`Server error: ${responseText}`);
      }
    }

    const data = JSON.parse(responseText);
    console.log("Token transfers:", data);
    return data.data;
  } catch (error) {
    console.error("Error fetching token transfers:", error);
    throw error;
  }
};
