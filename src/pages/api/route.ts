// app/api/boltz/route.ts
import { NextRequest, NextResponse } from 'next/server';
import zkpInit from '@vulpemventures/secp256k1-zkp';
import {
  Transaction,
  address,
  crypto,
  initEccLib,
  networks,
} from 'bitcoinjs-lib';
import {
  Musig,
  OutputType,
  SwapTreeSerializer,
  TaprootUtils,
  constructClaimTransaction,
  detectSwap,
  targetFee,
} from 'boltz-core';
import { randomBytes } from 'crypto';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// Types
interface SwapResponse {
  id: string;
  swapTree: string;
  refundPublicKey: string;
}

interface BoltzSignature {
  pubNonce: string;
  partialSignature: string;
}

// Configuration
const BOLTZ_API_ENDPOINT = 'https://api.testnet.boltz.exchange';
const NETWORK = networks.regtest;

// Initialize the swap
export async function POST(request: NextRequest) {
  try {
    const { type, ...requestData } = await request.json();

    // Initialize if this is the first request
    if (type === 'init') {
      return await initializeSwap(requestData);
    }
    // Claim if this is a claim request
    else if (type === 'claim') {
      return await claimSwap(requestData);
    }
    else {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function initializeSwap({ invoiceAmount, destinationAddress }: { 
  invoiceAmount: number;
  destinationAddress: string;
}) {
  initEccLib(ecc);
    
  // Create random preimage and keys
  const preimage = randomBytes(32);
  const keys = ECPairFactory(ecc).makeRandom();

  // Create Reverse Swap
  const createSwapResponse = await fetch(`${BOLTZ_API_ENDPOINT}/v2/swap/reverse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoiceAmount,
      to: 'BTC',
      from: 'BTC',
      claimPublicKey: keys.publicKey.toString('hex'),
      preimageHash: crypto.sha256(preimage).toString('hex'),
    }),
  });

  const swapData: SwapResponse = await createSwapResponse.json();

  // Return the initial swap data and required parameters
  return NextResponse.json({
    swapId: swapData.id,
    preimageHex: preimage.toString('hex'),
    keysWIF: keys.toWIF(),
    ...swapData,
  });
}

async function claimSwap({ 
  swapId,
  preimageHex,
  keysWIF,
  transactionHex,
  refundPublicKey,
  swapTree,
  destinationAddress
}: {
  swapId: string;
  preimageHex: string;
  keysWIF: string;
  transactionHex: string;
  refundPublicKey: string;
  swapTree: string;
  destinationAddress: string;
}) {
  initEccLib(ecc);
  
  const preimage = Buffer.from(preimageHex, 'hex');
  const keys = ECPairFactory(ecc).fromWIF(keysWIF);
  const boltzPublicKey = Buffer.from(refundPublicKey, 'hex');

  // Initialize Musig and create tweaked key
  const musig = new Musig(await zkpInit(), keys, randomBytes(32), [
    boltzPublicKey,
    keys.publicKey,
  ]);
  
  const tweakedKey = TaprootUtils.tweakMusig(
    musig,
    SwapTreeSerializer.deserializeSwapTree(swapTree).tree,
  );

  // Parse lockup transaction and find swap output
  const lockupTx = Transaction.fromHex(transactionHex);
  const swapOutput = detectSwap(tweakedKey, lockupTx);
  
  if (!swapOutput) {
    return NextResponse.json(
      { error: 'No swap output found in lockup transaction' },
      { status: 400 }
    );
  }

  // Construct claim transaction
  const claimTx = targetFee(2, (fee) =>
    constructClaimTransaction(
      [{
        ...swapOutput,
        keys,
        preimage,
        cooperative: true,
        type: OutputType.Taproot,
        txHash: lockupTx.getHash(),
      }],
      address.toOutputScript(destinationAddress, NETWORK),
      fee,
    ),
  );

  // Get Boltz signature
  const boltzSigResponse = await fetch(
    `${BOLTZ_API_ENDPOINT}/v2/swap/reverse/${swapId}/claim`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        index: 0,
        transaction: claimTx.toHex(),
        preimage: preimageHex,
        pubNonce: Buffer.from(musig.getPublicNonce()).toString('hex'),
      }),
    }
  );

  const boltzSig: BoltzSignature = await boltzSigResponse.json();

  // Aggregate nonces and initialize signing session
  musig.aggregateNonces([[boltzPublicKey, Buffer.from(boltzSig.pubNonce, 'hex')]]);
  
  musig.initializeSession(
    claimTx.hashForWitnessV1(
      0,
      [swapOutput.script],
      [swapOutput.value],
      Transaction.SIGHASH_DEFAULT,
    ),
  );

  // Add Boltz partial signature and create our partial
  musig.addPartial(boltzPublicKey, Buffer.from(boltzSig.partialSignature, 'hex'));
  musig.signPartial();

  // Finalize transaction
  claimTx.ins[0].witness = [musig.aggregatePartials()];

  // Broadcast transaction
  const broadcastResponse = await fetch(`${BOLTZ_API_ENDPOINT}/v2/chain/BTC/transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      hex: claimTx.toHex(),
    }),
  });

  if (!broadcastResponse.ok) {
    throw new Error('Failed to broadcast transaction');
  }

  return NextResponse.json({
    success: true,
    transactionHex: claimTx.toHex(),
  });
}