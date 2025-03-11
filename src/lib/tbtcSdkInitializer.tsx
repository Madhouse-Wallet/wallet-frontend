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
      // Ethereum Mainnet RPC URL
      const ethRpcUrl = "https://eth.merkle.io"; // Replace with your own RPC provider

      // Create an ethers provider for Ethereum Mainnet
      const ethProvider = new ethers.providers.JsonRpcProvider(ethRpcUrl);
      // Initialize it for any L2 (E.g., Arbitrum)
      sdk = await TBTC.initializeMainnet(ethProvider);
      // Initialize the SDK for Ethereum only.
      // Initialize it for any L2 (E.g., Arbitrum)
      // await sdk.initializeCrossChain("Arbitrum", signer);

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
