// pages/api/send-bitcoin.js

import axios from "axios";

// Import bitcoin signing dependencies
const bitcoin = require("bitcoinjs-lib");
// const secp = require("tiny-secp256k1");
const secp = require("@bitcoinerlab/secp256k1");
const ecfactory = require("ecpair");
const ECPair = ecfactory.ECPairFactory(secp);

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
    const keyPair = ECPair.fromWIF(privateKeyHex, bitcoin.networks.bitcoin);
    const privateKeyWallet = keyPair.privateKey.toString("hex");

    const cleanPrivateKey = privateKeyWallet;

    if (cleanPrivateKey.length !== 64) {
      return res.status(400).json({
        error: `Invalid private key length: Expected 64 hex characters but received ${cleanPrivateKey.length}`,
      });
    }

    const baseUrl = `https://api.blockcypher.com/v1/btc/${network}`;

    const newTx = {
      inputs: [{ addresses: [fromAddress] }],
      outputs: [{ addresses: [toAddress], value: amountSatoshi }],
    };

    // 3. Request transaction skeleton
    const txCreateResponse = await axios.post(`${baseUrl}/txs/new`, newTx);
    console.log("line-53", txCreateResponse.data);
    return res.status(200).json({
      success: true,
      details: txCreateResponse.data,
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
