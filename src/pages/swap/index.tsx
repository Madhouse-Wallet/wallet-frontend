"use client";

// import ethers from '@/ethers';
// import Web3Interaction from '@/utils/web3Interaction';
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

  //  useEffect(() => {
  //     const openTrove = async () => {
  //       // setLoading(true);
  //       // setError(null);
  
  //       const provider = (window as any).ethereum; // Ensure user has a wallet extension
  //       if (!provider) {
  //         console.log("No wallet detected. Please install Metamask.")
  //         // setError("No wallet detected. Please install Metamask.");
  //         // setLoading(false);
  //         return;
  //       }
  
  //       const web3 = new Web3Interaction("sepolia", provider);
  //       console.log("line-57",provider)
  //       const contractAddress = "0xe2eA5880effFdd234A065dBBC174D6cb8a867167"; // Replace with actual contract address
  
  //       try {
  //         const receipt = await web3.openTrove(
  //           contractAddress,
  //           "1000000000000000000000", 
  //           "0",
  //           "10000016139672853",
  //           "0x4Cf100cce352029e726185980E4611de835D6C7B", // Replace with actual upper hint
  //           "0xd0236C05d6FcA23fbA40AFeC83DF7cE4188D48E3"  // Replace with actual lower hint
  //         );
  //         console.log("Transaction Receipt:", receipt);
  //       } catch (error) {
  //         console.error("Error calling openTrove:", error);
  //       }
  //     };
  
  //     openTrove();
  //   }, []);

  // useEffect(() => {
  //   const openTrove = async () => {
  //     const privateKey = "e466f7a034b5046b3d9f3d3b094c9e318e6fb7b97bf8ac69cf1dcb915f6a02f1"; // Replace with your private key
  //     const rpcUrl = "https://rpc.ankr.com/eth_sepolia"; // Replace with your RPC URL
  //     const web3 = new Web3Interaction(rpcUrl, privateKey);
  //     const contractAddress = "0xe2eA5880effFdd234A065dBBC174D6cb8a867167";
  //     try {
  //       const receipt = await web3.openTrove(
  //         contractAddress,
  //         "10000016139672853", // Example max fee percentage
  //         "1000000000000000000000",  // Example THUSD amount
  //         "0",    // Example asset amount
  //         "0x4Cf100cce352029e726185980E4611de835D6C7B", // Replace with actual upper hint
  //         "0xd0236C05d6FcA23fbA40AFeC83DF7cE4188D48E3"  // Replace with actual lower hint
  //       );
  //       console.log("Transaction Receipt:", receipt);
  //     } catch (error) {
  //       console.error("Error calling openTrove:", error);
  //     }
  //   };

  //   openTrove();
  // }, []);
  
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
