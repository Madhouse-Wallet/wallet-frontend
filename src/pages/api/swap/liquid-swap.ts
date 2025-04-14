// pages/api/liquid-swap.ts
process.env.SECP256K1_JS_ONLY = "true";
import type { NextApiRequest, NextApiResponse } from "next";
import zkpInit from "@vulpemventures/secp256k1-zkp";
import axios from "axios";
import { randomBytes } from "crypto";
import { ECPairFactory } from "ecpair";
import * as ecc from "tiny-secp256k1";
import { WebSocket } from "ws";
import cors from "cors";
import { Transaction, address, crypto, networks } from "liquidjs-lib";
import {
  Musig,
  OutputType,
  SwapTreeSerializer,
  detectSwap,
  targetFee,
} from "boltz-core";
import {
  TaprootUtils,
  constructClaimTransaction,
  init,
} from "boltz-core/dist/lib/liquid";

// Types
interface SwapResponse {
  id: string;
  invoice: string;
  swapTree: {
    claimLeaf: {
      version: number;
      output: string;
    };
    refundLeaf: {
      version: number;
      output: string;
    };
  };
  lockupAddress: string;
  refundPublicKey: string;
  timeoutBlockHeight: number;
  onchainAmount: number;
  blindingKey: string;
}

interface SwapRequest extends NextApiRequest {
  body: {
    invoiceAmount: number;
    destinationAddress: string;
  };
}

// Constants
const ENDPOINT = process.env.NEXT_PUBLIC_BOLTZ_MAINNET_URL_ADDRESS;
const WEBSOCKET_ENDPOINT =
  process.env.NEXT_PUBLIC_BOLTZ_MAINNET_WEBSOCKET_ADDRESS;

const NETWORK = networks.regtest; // Using Liquid network

// Setup CORS middleware
const corsMiddleware = cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
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

    const { invoiceAmount, destinationAddress } = req.body;

    const zkp = await zkpInit();
    init(zkp);

    // Create a random preimage for the swap
    const preimage = randomBytes(32);
    const keys = ECPairFactory(ecc).makeRandom();

    // Create a Reverse Swap
    const response = await axios.post<SwapResponse>(
      `${ENDPOINT}/v2/swap/reverse`,
      {
        invoiceAmount,
        to: "L-BTC",
        from: "BTC",
        claimPublicKey: keys.publicKey.toString("hex"),
        preimageHash: crypto.sha256(preimage).toString("hex"),
      }
    );

    const createdResponse = response.data;
    console.log("Created swap");
    console.log(createdResponse);

    // Create a WebSocket connection
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

      console.log("Got WebSocket update");
      console.log(msg);

      switch (msg.args[0].status) {
        case "swap.created": {
          console.log("Waiting for invoice to be paid");
          break;
        }

        case "transaction.mempool": {
          console.log("Creating claim transaction");

          const boltzPublicKey = Buffer.from(
            createdResponse.refundPublicKey,
            "hex"
          );

          // Create a musig signing session and tweak it with the Taptree of the swap scripts
          const musig = new Musig(zkp, keys, randomBytes(32), [
            boltzPublicKey,
            keys.publicKey,
          ]);

          const tweakedKey = TaprootUtils.tweakMusig(
            musig,
            SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree)
              .tree
          );

          // Parse the lockup transaction and find the output relevant for the swap
          const lockupTx = Transaction.fromHex(msg.args[0].transaction.hex);
          const swapOutput = detectSwap(tweakedKey, lockupTx);

          if (swapOutput === undefined) {
            console.error("No swap output found in lockup transaction");
            return;
          }

          // Create a claim transaction with confidential assets
          const claimTx = targetFee(0.1, (fee: any) =>
            constructClaimTransaction(
              [
                {
                  ...swapOutput,
                  keys,
                  preimage,
                  cooperative: true,
                  type: OutputType.Taproot,
                  txHash: lockupTx.getHash(),
                  blindingPrivateKey: Buffer.from(
                    createdResponse.blindingKey,
                    "hex"
                  ),
                },
              ],
              address.toOutputScript(destinationAddress, NETWORK),
              fee,
              false,
              NETWORK,
              address.fromConfidential(destinationAddress).blindingKey
            )
          );

          // Get the partial signature from Boltz
          const boltzSig = await axios.post(
            `${ENDPOINT}/v2/swap/reverse/${createdResponse.id}/claim`,
            {
              index: 0,
              transaction: claimTx.toHex(),
              preimage: preimage.toString("hex"),
              pubNonce: Buffer.from(musig.getPublicNonce()).toString("hex"),
            }
          );

          // Aggregate the nonces
          musig.aggregateNonces([
            [boltzPublicKey, Buffer.from(boltzSig.data.pubNonce, "hex")],
          ]);

          // Initialize the session to sign the claim transaction
          musig.initializeSession(
            claimTx.hashForWitnessV1(
              0,
              [swapOutput.script],
              [{ value: swapOutput.value, asset: swapOutput.asset }],
              Transaction.SIGHASH_DEFAULT,
              NETWORK.genesisBlockHash
            )
          );

          // Add the partial signature from Boltz
          musig.addPartial(
            boltzPublicKey,
            Buffer.from(boltzSig.data.partialSignature, "hex")
          );

          // Create our partial signature
          musig.signPartial();

          // Witness of the input to the aggregated signature
          claimTx.ins[0].witness = [musig.aggregatePartials()];

          // Broadcast the finalized transaction
          await axios.post(`${ENDPOINT}/v2/chain/L-BTC/transaction`, {
            hex: claimTx.toHex(),
          });

          break;
        }

        case "invoice.settled":
          console.log("Swap successful");
          webSocket.close();
          break;
      }
    });

    // Return the initial response including the invoice
    return res.status(200).json({
      status: "success",
      data: {
        id: createdResponse.id,
        invoice: createdResponse.invoice,
        swapTree: createdResponse.swapTree,
        lockupAddress: createdResponse.lockupAddress,
        refundPublicKey: createdResponse.refundPublicKey,
        timeoutBlockHeight: createdResponse.timeoutBlockHeight,
        onchainAmount: createdResponse.onchainAmount,
        blindingKey: createdResponse.blindingKey, // Include blindingKey for Liquid
      },
    });
  } catch (error: any) {
    console.error("Error creating swap:", error);

    // Check if it's an Axios error with response data
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({
        status: "error",
        error: error.response.data.error || "Error creating swap",
      });
    }

    // Fallback error response
    return res.status(500).json({
      status: "error",
      error: error.message || "Error creating swap",
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
