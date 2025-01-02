"use client";

// import ethers from '@/ethers';
// import Web3Interaction from '@/utils/web3Interaction';
import { CowSwapWidget } from '@cowprotocol/widget-react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
const Swap = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [prov, setProv] = useState<string | null>(null);
  const { walletAddress, provider, signer, login } = useSelector(
    (state: any) => state.Auth
  );
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      console.log("ethereum-->", ethereum)
      setProv(ethereum)
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
  console.log("prov-->",prov)
  const params = {
    appCode: "My Cool App",
    width: "100%",
    height: "640px",
    chainId: 11155111,
    tokenLists: [
      "https://files.cow.fi/tokens/CoinGecko.json",
      "https://files.cow.fi/tokens/CowSwap.json",
    ],
    tradeType: "swap",
    sell: {
      asset: "WBTC",
      amount: "100000",
    },
    buy: {
      asset: "USDC",
      amount: "0",
    },
    enabledTradeTypes: [
      "swap",
        "limit",
        "advanced",
        "yield"
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
  console.log("provider-->", provider)
  console.log("provider provider-->", provider?.provider)
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
      {
        (provider && <CowSwapWidget params={params} provider={prov} />)
      }

    </div>
  );
};

export default Swap;
