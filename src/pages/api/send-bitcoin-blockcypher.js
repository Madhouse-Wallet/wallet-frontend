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

    // 1. Generate keypair from private key
    const keyBuffer = Buffer.from(cleanPrivateKey, "hex");
    const keys = ECPair.fromPrivateKey(keyBuffer);

    // 2. Create a new transaction template
    const newTx = {
      inputs: [{ addresses: [fromAddress] }],
      outputs: [{ addresses: [toAddress], value: amountSatoshi }],
    };

    // 3. Request transaction skeleton
    const txCreateResponse = await axios.post(`${baseUrl}/txs/new`, newTx);
    const tmpTx = txCreateResponse.data;

    if (!tmpTx.tosign || tmpTx.tosign.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data to sign received from BlockCypher",
      });
    }

    // 4. Sign each tosign hash per BlockCypher's spec
    tmpTx.pubkeys = [];
    tmpTx.signatures = tmpTx.tosign.map((tosignHex) => {
      tmpTx.pubkeys.push(keys.publicKey.toString("hex"));

      const hashBuffer = Buffer.from(tosignHex, "hex");
      const signature = keys.sign(hashBuffer);

      const derSig = bitcoin.script.signature.encode(
        signature,
        bitcoin.Transaction.SIGHASH_ALL
      );

      // Remove trailing "01" (SIGHASH_ALL) byte per BlockCypher spec
      return derSig.toString("hex").slice(0, -2);
    });

    // 5. Broadcast the signed transaction
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

