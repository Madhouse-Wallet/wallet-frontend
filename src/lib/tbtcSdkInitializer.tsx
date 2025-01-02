import { TBTC } from "@keep-network/tbtc-v2.ts";
import { ethers } from "ethers";

// tBTC SDK Initialization Function
export async function initializeTBTC(signer: ethers.Signer) {
  try {
    // Initialize the SDK for Mainnet
    console.log("Initialize the SDK for Mainnet");
    // const sdk = await TBTC.initializeMainnet(signer);
    const sdk = await TBTC.initializeSepolia(signer);

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
