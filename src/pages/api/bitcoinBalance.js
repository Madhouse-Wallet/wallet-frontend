/**
 * Fetches the balance of a Bitcoin address using the BlockCypher API
 * @param {string} address - The Bitcoin address to check
 * @returns {Promise<{balance: number, address: string, error: string|null}>} The balance in BTC and address info
 */
export async function fetchBitcoinBalance(address) {
  // Input validation
  if (!address || typeof address !== "string") {
    return {
      balance: 0,
      address: "",
      error: "Invalid Bitcoin address format",
    };
  }

  try {
    // Using BlockCypher API which doesn't require API keys for basic usage
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance?token=119e78d53a7047eb8455275fc461bd7d`
    );

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();

    // BlockCypher returns balance in satoshis (1 BTC = 100,000,000 satoshis)
    // Convert to BTC by dividing by 100,000,000
    const balanceInBTC = data.balance / 100000000;

    return {
      balance: balanceInBTC,
      address: address,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching Bitcoin balance:", error);
    return {
      balance: 0,
      address: address,
      error: `Failed to fetch balance: ${error.message}`,
    };
  }
}
