import logo from './logo.svg';
import './App.css';
// Import SDK entrypoint component.
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { initializeTBTC } from "./tbtcSdkInitializer";

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }


const App: React.FC = () => {
  const [tbtcSdk, setTbtcSdk] = useState<any>(null);

  useEffect(() => {
    const setupTBTC = async () => {
      try {
        // Replace with your Ethereum provider
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        try {
          if (typeof (window as any)?.unisat !== 'undefined') {
            console.log('UniSat Wallet is installed!');
          }
          let accounts = await (window as any)?.unisat?.requestAccounts();
          console.log('connect success', accounts, );
        } catch (e) {
          console.log('connect failed');
        }
        // const provider = new  ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/a48f9442af1a4c8da44b4fc26640e23d")
// console.log("https://sepolia.infura.io/v3/a48f9442af1a4c8da44b4fc26640e23d--?",provider)
// Get write access as an account by getting the signer
                await provider.send("eth_requestAccounts", []); // Request wallet access
        const signer = provider.getSigner();
        // Get the current chain ID
        console.log("signer-->",signer)
const network = await provider.getNetwork();
console.log("network--",network)
        // Initialize tBTC SDK
        const sdk = await initializeTBTC(signer);
        console.log("sdk", sdk)
        // Step 3: Define the Bitcoin recovery address
       
        setTbtcSdk(sdk);

        console.log("TBTC SDK initialized:", sdk);
      } catch (error) {
        console.error("Error initializing TBTC SDK:", error);
      }
    };

    setupTBTC();
  }, []);
const depo = async()=>{
  const bitcoinRecoveryAddress = "tb1q29jj6w0ggjr0ukdzjmw54huev9gwrptaj04n8d"; // Replace with a valid BTC address

  try {
    // Step 4: Initiate the deposit
    console.log(tbtcSdk.deposits.initiateDeposit)
    const deposit = await tbtcSdk.deposits.initiateDeposit(bitcoinRecoveryAddress);
    console.log("Deposit initiated:", deposit);

    // Step 5: Get the Bitcoin deposit address
    const bitcoinDepositAddress = await deposit.getBitcoinAddress();
    console.log("Bitcoin deposit address:", bitcoinDepositAddress);

    // Inform the user to send BTC to the deposit address
    alert(`Send BTC to the deposit address: ${bitcoinDepositAddress}`);

    // Step 6: Monitor the Bitcoin funding and initiate minting
    // Wait for the user to complete the deposit (manual step required)
    console.log("Waiting for Bitcoin funding to complete...");

    // Initiate minting using the latest funding UTXO
    const txHash = await deposit.initiateMinting();
    console.log("Minting initiated, transaction hash:", txHash);

    alert(`Minting initiated successfully! Transaction hash: ${txHash}`);
  } catch (error) {
    console.error("Error during deposit process:", error);
  }
}
  return (
    <div>
      <h1>TBTC SDK Integration</h1>
      {tbtcSdk ? (
        <div>
          <p>SDK initialized successfully!</p>
          {/* Example of accessing deposits */}
          <button onClick={() => depo()}>
            Log Deposits
          </button>
        </div>
      ) : (
        <p>Initializing SDK...</p>
      )}
    </div>
  );
};

export default App;
