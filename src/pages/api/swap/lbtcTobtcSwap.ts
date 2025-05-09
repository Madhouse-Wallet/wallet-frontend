import type { NextApiRequest, NextApiResponse } from "next";
import zkpInit from "@vulpemventures/secp256k1-zkp";
import axios from "axios";
import { crypto } from "bitcoinjs-lib";
import bolt11 from "bolt11";
import { Musig, SwapTreeSerializer } from "boltz-core";
import { TaprootUtils } from "boltz-core/dist/lib/liquid";
import { randomBytes } from "crypto";
import { ECPairFactory } from "ecpair";
import * as ecc from "tiny-secp256k1";
import { WebSocket } from "ws";
import cors from "cors";

// Types
interface SwapRequest extends NextApiRequest {
  body: {
    invoice: string; // The lightning invoice to be paid
  };
}

// Constants
const ENDPOINT = process.env.NEXT_PUBLIC_BOLTZ_MAINNET_URL_ADDRESS;
const WEBSOCKET_ENDPOINT =
  process.env.NEXT_PUBLIC_BOLTZ_MAINNET_WEBSOCKET_ADDRESS;

// Setup CORS middleware
const corsMiddleware = cors({
  origin: true,
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: SwapRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, corsMiddleware);

    const { invoice } = req.body;
    if (!invoice) {
      return res.status(400).json({ error: "Invoice is required" });
    }

    const keys = ECPairFactory(ecc).makeRandom();

    // Create a Submarine Swap from L-BTC to BTC
    const response = await axios.post(`${ENDPOINT}/v2/swap/submarine`, {
      invoice,
      to: "BTC",
      from: "L-BTC",
      refundPublicKey: Buffer.from(keys.publicKey).toString("hex"),
    });

    const createdResponse = response.data;

    // Create WebSocket connection
    const webSocket = new WebSocket(WEBSOCKET_ENDPOINT!);

    webSocket.on("open", () => {
      webSocket.send(
        JSON.stringify({
          op: "subscribe",
          channel: "swap.update",
          args: [createdResponse.id],
        })
      );
    });

    webSocket.on("message", async (rawMsg) => {
      const msg = JSON.parse(rawMsg.toString("utf-8"));
      if (msg.event !== "update") {
        return;
      }


      switch (msg.args[0].status) {
        case "invoice.set": {
          console.log("Waiting for onchain transaction");
          break;
        }

        case "transaction.claim.pending": {
          console.log("Creating cooperative claim transaction");

          // Get claim transaction details
          const claimTxDetails = (
            await axios.get(
              `${ENDPOINT}/v2/swap/submarine/${createdResponse.id}/claim`
            )
          ).data;

          // Verify invoice payment with preimage
          const invoicePreimageHash = Buffer.from(
            bolt11
              .decode(invoice)
              .tags.find((tag) => tag.tagName === "payment_hash")!
              .data as string,
            "hex"
          );

          if (
            !crypto
              .sha256(Buffer.from(claimTxDetails.preimage, "hex"))
              .equals(invoicePreimageHash)
          ) {
            console.error("Invalid preimage provided");
            return;
          }

          const boltzPublicKey = Buffer.from(
            createdResponse.claimPublicKey,
            "hex"
          );

          // Create a musig signing instance - specific for L-BTC handling
          const musig = new Musig(
            await zkpInit(),
            keys as any,
            randomBytes(32),
            [boltzPublicKey, Buffer.from(keys.publicKey)]
          );

          // Tweak the musig with the Taptree of the swap scripts - L-BTC specific
          TaprootUtils.tweakMusig(
            musig,
            SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree)
              .tree
          );

          // Aggregate the nonces
          musig.aggregateNonces([
            [boltzPublicKey, Buffer.from(claimTxDetails.pubNonce, "hex")],
          ]);

          // Initialize the session to sign the transaction hash from the response
          musig.initializeSession(
            Buffer.from(claimTxDetails.transactionHash, "hex")
          );

          // Submit signature to Boltz
          await axios.post(
            `${ENDPOINT}/v2/swap/submarine/${createdResponse.id}/claim`,
            {
              pubNonce: Buffer.from(musig.getPublicNonce()).toString("hex"),
              partialSignature: Buffer.from(musig.signPartial()).toString(
                "hex"
              ),
            }
          );

          break;
        }

        case "transaction.claimed": {
          console.log("Swap completed successfully");
          webSocket.close();
          break;
        }
      }
    });

    // Handle WebSocket errors
    webSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Return initial swap details
    return res.status(200).json({
      status: "success",
      data: {
        id: createdResponse.id,
        address: createdResponse.address,
        expectedAmount: createdResponse.expectedAmount,
        timeoutBlockHeight: createdResponse.timeoutBlockHeight,
        swapTree: createdResponse.swapTree,
      },
    });
  } catch (error: any) {
    console.error("L-BTC to BTC swap creation error:", error);

    // Handle Axios errors
    if (error.response?.data) {
      return res.status(error.response.status).json({
        status: "error",
        error: error.response.data.error || "Swap creation failed",
      });
    }

    // Generic error response
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
