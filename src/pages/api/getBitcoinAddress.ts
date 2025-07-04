// pages/api/reverseSwap.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ECPairFactory } from "ecpair";
import * as bitcoin from "bitcoinjs-lib";
import * as secp from "@bitcoinerlab/secp256k1";
import cors from "cors";

const ECPair = ECPairFactory(secp);

interface SwapRequest extends NextApiRequest {
  body: {
    wif: string;
  };
}

const corsMiddleware = cors({
  origin: true,
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
});

export default async function handler(req: SwapRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { wif } = req.body;
    if (!wif) {
      return res.status(400).json({ error: "Wif is required" });
    }

    const keyPair = ECPair.fromWIF(wif, bitcoin.networks.bitcoin);

    // Use Bech32 address format (bc1...)
    const { address: segwitAddress } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin,
    });

    const { address: legacyAddress } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin,
    });

    return res.status(200).json({
      status: "success",
      data: { address: segwitAddress, address2: legacyAddress },
    });
  } catch (error: any) {
    console.error("Swap creation error:", error);

    if (error.response?.data) {
      return res.status(error.response.status).json({
        status: "error",
        error: error.response.data.error || "Swap creation failed",
      });
    }

    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
