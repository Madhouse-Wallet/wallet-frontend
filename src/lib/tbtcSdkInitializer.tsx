import { TBTC } from "@keep-network/tbtc-v2.ts";
import { ethers } from "ethers";
import { EthereumSigner } from "@keep-network/tbtc-v2.ts"; // Import EthereumSigner if available

// tBTC SDK Initialization Function
export async function initializeTBTC(signer: EthereumSigner) {
  try {
    // Initialize the SDK for Mainnet
    console.log("Initialize the SDK for Mainnet");
    let sdk;
    if (process.env.NEXT_PUBLIC_NODE_ENV == "development") {
      console.log("dev tbtc")
      sdk = await TBTC.initializeSepolia(signer as EthereumSigner);
    } else {
      console.log("pro tbtc")
      sdk = await TBTC.initializeMainnet(signer as EthereumSigner);
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
