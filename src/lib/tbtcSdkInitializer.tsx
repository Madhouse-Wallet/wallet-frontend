import { TBTC } from "@keep-network/tbtc-v2.ts";
import { ethers } from "ethers";
import { EthereumSigner } from "@keep-network/tbtc-v2.ts"; // Import EthereumSigner if available

// tBTC SDK Initialization Function
export async function initializeTBTC(signer: EthereumSigner) {
  try {
    // Initialize the SDK for Mainnet
    console.log("Initialize the SDK for Mainnet");
    let sdk;
    // const CHAIN =  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "arbitrum" && arbitrum) || (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "sepolia" && sepolia)  || (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "mainnet" && mainnet) 
    if (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "sepolia") {
      console.log("dev tbtc")
      sdk = await TBTC.initializeSepolia(signer as EthereumSigner);
    } else if (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "mainnet") {
      console.log("pro tbtc")
      sdk = await TBTC.initializeMainnet(signer as EthereumSigner);
    } else {
      // For L2 chains like Arbitrum, Base, etc.
      const ethRpcUrl = process.env.NEXT_PUBLIC_ETH_MAINNET_RPC || "https://eth.merkle.io";
      const ethProvider = new ethers.providers.JsonRpcProvider(ethRpcUrl);

      console.log(`Initializing TBTC for L2 chain: ${process.env.NEXT_PUBLIC_ENV_CHAIN_NAME }`);
      sdk = await TBTC.initializeMainnet(ethProvider);
      console.log("sd 1 furst->",sdk)
      // await sdk.initializeCrossChain("Base", signer);
      console.log("sd->",sdk)
    }
    // const sdk = await TBTC.initializeMainnet(signer);

    return {
    deposits: sdk.deposits,         // Access deposit functionalities
    redemptions: sdk.redemptions,   // Access redemption functionalities
    tbtcContracts: sdk.tbtcContracts, // Direct access to tBTC smart contracts
    bitcoinClient: sdk.bitcoinClient, // Access Bitcoin client
  };
} catch (error) {
  console.error("Failed to initialize TBTC SDK:", error);
  throw error; // Ensure errors are caught
}
}
