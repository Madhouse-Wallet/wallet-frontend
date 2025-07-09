// pages/api/send-bitcoin.js

import axios from "axios";

// Import bitcoin signing dependencies
const bitcoin = require("bitcoinjs-lib");
const secp = require("@bitcoinerlab/secp256k1");
const ecfactory = require("ecpair");
const ECPair = ecfactory.ECPairFactory(secp);

// Helper function to detect address type
function getAddressType(address) {
  if (address.startsWith("bc1q") || address.startsWith("tb1q")) {
    return "p2wpkh"; // SegWit v0 (bech32)
  } else if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
    return "p2tr"; // Taproot (bech32m)
  } else if (address.startsWith("3") || address.startsWith("2")) {
    return "p2sh"; // Pay-to-Script-Hash
  } else if (
    address.startsWith("1") ||
    address.startsWith("m") ||
    address.startsWith("n")
  ) {
    return "p2pkh"; // Legacy Pay-to-Public-Key-Hash
  }
  throw new Error(`Unknown address type: ${address}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      fromAddress,
      toAddress,
      amountSatoshi,
      privateKeyHex,
      network = "main", // "main", "test3", or "bcy/test"
    } = req.body;

    if (!fromAddress || !toAddress || !amountSatoshi || !privateKeyHex) {
      return res.status(400).json({
        error:
          "Missing required fields: fromAddress, toAddress, amountSatoshi, privateKeyHex",
      });
    }

    // Handle private key input (WIF or hex)
    let keys;
    let cleanPrivateKey;

    try {
      // Try to parse as WIF first
      keys = ECPair.fromWIF(privateKeyHex, bitcoin.networks.bitcoin);
      cleanPrivateKey = keys.privateKey.toString("hex");
    } catch (error) {
      // If WIF parsing fails, treat as hex
      cleanPrivateKey = privateKeyHex.startsWith("0x")
        ? privateKeyHex.slice(2)
        : privateKeyHex;

      if (cleanPrivateKey.length !== 64) {
        return res.status(400).json({
          error: `Invalid private key length: Expected 64 hex characters but received ${cleanPrivateKey.length}`,
        });
      }

      const keyBuffer = Buffer.from(cleanPrivateKey, "hex");
      keys = ECPair.fromPrivateKey(keyBuffer);
    }

    const baseUrl = `https://api.blockcypher.com/v1/btc/${network}`;
    const fromAddressType = getAddressType(fromAddress);

    // Create transaction template with appropriate parameters
    const newTx = {
      inputs: [{ addresses: [fromAddress] }],
      outputs: [{ addresses: [toAddress], value: amountSatoshi }],
      preference: "high",
      confirmations: 1, 
    };

    // Add SegWit-specific parameters if sending from SegWit address
    if (fromAddressType === "p2wpkh") {
      newTx.prefer_bech32 = true;
    }

    // Request transaction skeleton
    const txCreateResponse = await axios.post(`${baseUrl}/txs/new`, newTx);
    const tmpTx = txCreateResponse.data;

    if (!tmpTx.tosign || tmpTx.tosign.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data to sign received from BlockCypher",
      });
    }

    // Sign transaction based on address type
    tmpTx.pubkeys = [];
    tmpTx.signatures = [];

    for (let i = 0; i < tmpTx.tosign.length; i++) {
      const tosignHex = tmpTx.tosign[i];

      if (!tosignHex) {
        return res.status(400).json({
          success: false,
          error: `Empty tosign data at index ${i}`,
        });
      }

      // Add public key
      tmpTx.pubkeys.push(keys.publicKey.toString("hex"));

      const hashBuffer = Buffer.from(tosignHex, "hex");

      if (fromAddressType === "p2wpkh") {
        // SegWit signing - BlockCypher expects signature WITH SIGHASH_ALL byte
        const signature = keys.sign(hashBuffer);

        // For SegWit, we need the signature WITH the SIGHASH_ALL byte
        const derSig = bitcoin.script.signature.encode(
          signature,
          bitcoin.Transaction.SIGHASH_ALL
        );

        // For SegWit, keep the SIGHASH_ALL byte (don't remove it)
        tmpTx.signatures.push(derSig.toString("hex"));
      } else {
        // Legacy signing (P2PKH, P2SH)
        const signature = keys.sign(hashBuffer);

        const derSig = bitcoin.script.signature.encode(
          signature,
          bitcoin.Transaction.SIGHASH_ALL
        );

        // Remove trailing "01" (SIGHASH_ALL) byte per BlockCypher spec for legacy
        tmpTx.signatures.push(derSig.toString("hex").slice(0, -2));
      }
    }

    // Broadcast the signed transaction
    const txSendResponse = await axios.post(`${baseUrl}/txs/send`, tmpTx);
    const finalTx = txSendResponse.data;

    return res.status(200).json({
      success: true,
      transactionHash: finalTx.tx.hash,
      details: finalTx,
    });
  } catch (error) {
    console.error("Full error object:", error);

    if (error.response) {
      console.error("BlockCypher API Error:");
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }

    return res.status(500).json({
      success: false,
      error: error.response ? error.response.data : error.message,
      errorDetails: {
        message: error.message,
        stack: error.stack,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : null,
      },
    });
  }
}
