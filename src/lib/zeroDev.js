"use client";
import { zeroAddress } from "viem";
import {
  createWeightedKernelAccountClient,
  createWeightedValidator,
  toWebAuthnSigner,
  getRecoveryFallbackActionInstallModuleData,
} from "@zerodev/weighted-validator";
import {
  createWeightedECDSAValidator,
  getRecoveryAction
} from "@zerodev/weighted-ecdsa-validator";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"

import { toFunctionSelector } from "viem";

import { delay } from "../utils/globals";

import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  getUserOperationGasPrice,
} from "@zerodev/sdk";
import { getValidatorPluginInstallModuleData } from "@zerodev/sdk";
import {
  PasskeyValidatorContractVersion,
  WebAuthnMode,
  toPasskeyValidator,
  toWebAuthnKey,
} from "@zerodev/passkey-validator";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ethers } from "ethers";
import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem";
import { sepolia, mainnet, arbitrum, base } from "viem/chains";
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
import { mnemonicToAccount } from "viem/accounts";
import { english, generateMnemonic } from "viem/accounts";
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { sign } from "crypto";


const PASSKEY_SERVER_URL = `https://passkeys.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;

export const BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;

const CHAIN =
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "arbitrum" && arbitrum) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "sepolia" && sepolia) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "mainnet" && mainnet) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "base" && base);
const entryPoint = getEntryPoint("0.7");
const recoveryExecutorFunction =
  "function doRecovery(address _validator, bytes calldata _data)";
const recoveryExecutorSelector = toFunctionSelector(recoveryExecutorFunction);

const paymasterClient = createZeroDevPaymasterClient({
  chain: CHAIN,
  transport: http(PAYMASTER_RPC),
});

const publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
  chain: CHAIN,
});


export const zeroTrxn = async (kernelClient) => {
  try {
    const txnHash = await kernelClient.sendTransaction({
      to: zeroAddress, // use any address
      value: BigInt(0), // default to 0
      data: "0x", // default to 0x
    });
    console.log("Txn hash:", txnHash);
    return {
      status: true,
      data: txnHash
    }
  } catch (error) {
    console.log(" zeroTrxn error-->", error)
    return {
      status: false,
      msg: error?.message
    }
  }
};
export const getPrivateKey = async () => {
  try {
    const PRIVATE_KEY = generatePrivateKey();
    console.log("PRIVATE_KEY-->", PRIVATE_KEY)
    return PRIVATE_KEY;
  } catch (error) {
    return false
  }
}

export const checkPrivateKey = async (PRIVATE_KEY) => {
  try {
    const signer = privateKeyToAccount(PRIVATE_KEY);
    return {
      status: true,
      signer
    }
  } catch (error) {
    return {
      status: false,
      msg: "Invalid Private Key!"
    }
  }
}

export const setupNewAccount = async (PRIVATE_KEY) => {
  try {

    const signer = privateKeyToAccount(PRIVATE_KEY)
    console.log("EOA Account Signer-->", signer)
    // Create ECDSA validator
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
    })

    // Create Kernel Smart Account
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion: KERNEL_V3_1,
    })

    console.log("Smart Account Address:", account.address)

    const kernelClient = createKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      client: publicClient,
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation });
        },
      },
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient);
        },
      },
    });

    let trxnZero = await zeroTrxn(kernelClient)
    if (trxnZero?.status) {
      return {
        status: true,
        data: {
          privatekey: PRIVATE_KEY,
          address: account.address,
          account: account,
          trxn: trxnZero.data
        }
      }
    } else {
      return {
        status: false,
        msg: "Error In Zero Trxn!"
      }
    }
  } catch (error) {
    console.log("setupnewaccount error -->", error)
    return {
      status: false,
      msg: error?.message
    }
  }
}



export const doAccountRecovery = async (PRIVATE_KEY, address) => {
  try {
    let getAccount = await checkPrivateKey(PRIVATE_KEY)
    if (!getAccount.status) {
      return {
        status: false,
        msg: "Invalid Private Key!"
      }
    }
    let signer = getAccount?.signer
    console.log("EOA Account Signer-->", signer)
    // Create ECDSA validator
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
    })

    // Create Kernel Smart Account
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion: KERNEL_V3_1,
    })

    console.log("Smart Account Address:", account.address)
    if (address != account.address) {
      return {
        status: false,
        msg: "Invalid Private Key!"
      }
    }

    const kernelClient = createKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      client: publicClient,
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation });
        },
      },
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient);
        },
      },
    });

    let trxnZero = await zeroTrxn(kernelClient)
    if (trxnZero?.status) {
      return {
        status: true,
        data: {
          privatekey: PRIVATE_KEY,
          address: account.address,
          account: account,
          trxn: trxnZero.data
        }
      }
    } else {
      return {
        status: false,
        msg: "Error In Zero Trxn!"
      }
    }
  } catch (error) {
    console.log("setupnewaccount error -->", error)
    return {
      status: false,
      msg: error?.message
    }
  }
}


