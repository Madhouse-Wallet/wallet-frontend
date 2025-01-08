"use client";

// import ethers from '@/ethers';
// import Web3Interaction from '@/utils/web3Interaction';
import { CowSwapWidget } from "@cowprotocol/widget-react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
const Swap = () => {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [prov, setProv] = useState<string | null>(null);
  const { walletAddress, provider, signer, login } = useSelector(
    (state: any) => state.Auth
  );
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      setProv(ethereum);
      // Request accounts and set the first account
      ethereum
        .request({ method: "eth_requestAccounts" })
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
        .catch((err: any) =>
          console.error("Error fetching accounts or balance:", err)
        );
    } else {
       toast.error("Please Coonect to wallet");
    }
  }, []);
  console.log("prov-->", prov);
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
    enabledTradeTypes: ["swap", "limit", "advanced", "yield"],
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
  console.log("provider-->", provider);
  console.log("provider provider-->", provider?.provider);
  if (!prov) {
    return <div>Loading Ethereum provider...</div>;
  }
  return (
    <>
      <section className="coswap py-3 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
                <div className="d-flex align-items-center gap-3">
                  <button
                    onClick={handleGoBack}
                    className="border-0 themeClr p-0"
                  >
                    {backIcn}
                  </button>
                  <h4 className="m-0 text-2xl font-bold">Cowswap</h4>
                </div>
              </div>
            </div>
            <div className="col-span-12">
              {/* <h2>Wallet Info</h2>
        <p><strong>Address:</strong> {account || "Not connected"}</p>
        <p><strong>Balance:</strong> {balance ? `${balance} ETH` : "Loading..."}</p> */}
              {prov && <CowSwapWidget params={params} provider={prov} />}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Swap;

const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
);
