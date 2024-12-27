"use client";

import { CowSwapWidget, CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-react';
import { useEffect, useState } from 'react';

const Swap = () => {
  const [provider, setProvider] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      setProvider(ethereum);

      // Request accounts and set the first account
      ethereum.request({ method: "eth_requestAccounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);

            // Fetch balance
            return ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            });
          } else {
            console.error("No accounts found.");
          }
        })
        .then((balance: string) => {
          if (balance) {
            setBalance((parseInt(balance, 16) / 1e18).toFixed(4)); // Convert balance to ETH
          }
        })
        .catch((err: any) => console.error("Error fetching accounts or balance:", err));
    } else {
      console.error("Ethereum provider not found.");
    }
  }, []);

  const params: CowSwapWidgetParams = {
    appCode: "My Cool App",
    width: "100%",
    height: "640px",
    chainId: 11155111,
    tokenLists: [
      "https://files.cow.fi/tokens/CoinGecko.json",
      "https://files.cow.fi/tokens/CowSwap.json",
    ],
    tradeType: TradeType.SWAP,
    sell: {
      asset: "WBTC",
      amount: "100000",
    },
    buy: {
      asset: "USDC",
      amount: "0",
    },
    enabledTradeTypes: [
      TradeType.SWAP,
      TradeType.LIMIT,
      TradeType.ADVANCED,
      TradeType.YIELD,
    ],
    theme: "dark",
    standaloneMode: false,
    disableToastMessages: false,
    disableProgressBar: false,
    hideBridgeInfo: false,
    hideOrdersTable: false,
    images: {},
    sounds: {},
    customTokens: [],
  };

  if (!provider) {
    return <div>Loading Ethereum provider...</div>;
  }

  return (
    <div>
      <div>
        {/* <h2>Wallet Info</h2>
        <p><strong>Address:</strong> {account || "Not connected"}</p>
        <p><strong>Balance:</strong> {balance ? `${balance} ETH` : "Loading..."}</p> */}
      </div>
      <CowSwapWidget params={params} provider={provider} />
    </div>
  );
};

export default Swap;
