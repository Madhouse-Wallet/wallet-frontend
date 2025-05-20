"use client";
import { zeroAddress} from "viem";
import { ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { sepolia, mainnet, arbitrum, base } from "viem/chains";
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

import {
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  getUserOperationGasPrice,
  gasTokenAddresses,
    createKernelAccount,

} from "@zerodev/sdk";
const entryPoint = getEntryPoint("0.7")
import {
  getEntryPoint, KERNEL_V3_1
} from "@zerodev/sdk/constants"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"

export const PAYMASTER_V07_ADDRESS = 0x6C973eBe80dCD8660841D4356bf15c32460271C9; // base network circle paymaster
export const BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;

const CHAIN =
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "arbitrum" && arbitrum) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "sepolia" && sepolia) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "mainnet" && mainnet) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "base" && base);


export const zeroTrxn = async (kernelClient) => {
  try {
    const txnHash = await kernelClient.sendTransaction({
      to: zeroAddress, // use any address
      value: BigInt(0), // default to 0
      data: "0x", // default to 0x
    });
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
    console.log("error-->", error)
    return {
      status: false,
      msg: "Invalid Private Key!"
    }
  }
}

export const setupNewAccount = async (PRIVATE_KEY) => {
  try {

    const paymasterClient = createZeroDevPaymasterClient({
      chain: CHAIN,
      transport: http(PAYMASTER_RPC),
    });

    const publicClient = createPublicClient({
      transport: http(BUNDLER_URL),
      chain: CHAIN,
    });

    const signer = privateKeyToAccount(PRIVATE_KEY)

    // Create Kernel Smart Account
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
    let res;
    const trxnZero = await zeroTrxn(kernelClient,publicClient,account,paymasterClient)
    if (trxnZero?.status) {
      res = {
        status: true,
        data: {
          privatekey: PRIVATE_KEY,
          address: account.address,
          account: account,
          trxn: trxnZero.data
        }
      }
    } else {
      res = {
        status: false,
        msg: "Error In Zero Trxn!"
      }
    } return res
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
    const getAccount = await checkPrivateKey(PRIVATE_KEY)
    if (!getAccount.status) {
      return {
        status: false,
        msg: "Invalid Private Key!"
      }
    }
    const signer = getAccount?.signer


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

    let res;
    if (address !== account.address) {
      res = {
        status: false,
        msg: "Invalid Private Key!"
      }
    } else {
      res = {
        status: true,
        data: {
        }
      }
    } return res
  } catch (error) {
    console.log("setupnewaccount error -->", error)
    return {
      status: false,
      msg: error?.message
    }
  }
}



export const getProvider = async (kernelClient) => {
  try {
    const kernelProvider = new KernelEIP1193Provider(kernelClient);
    const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);
    const signer = await ethersProvider.getSigner();
    return { kernelProvider, ethersProvider, signer };
  } catch (error) {
    console.log("provider error-->", error)
    return false;
  }
};

export const getAccount = async (PRIVATE_KEY) => {
  try {
    const publicClient = createPublicClient({ chain: CHAIN, transport: http(BUNDLER_URL) })
    const signer = privateKeyToAccount(PRIVATE_KEY)

    // Create MetaMask Smart Account
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

    const paymasterClient = createZeroDevPaymasterClient({
          chain: CHAIN,
          transport: http(PAYMASTER_RPC),
        });

    const kernelClient = createKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      client: publicClient,
      paymaster: paymasterClient,
      paymasterContext: { token: gasTokenAddresses[CHAIN.id].USDC },
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient);
        },
      },
    });

    if (!getAccount) {
      return {
        status: false,
        msg: "No Account Found!",
      };
    }
    return {
      status: true,
      account: account,
      kernelClient: kernelClient,
      address: account.address,
      paymaster: paymasterClient,
      publicClient: publicClient
    };
  } catch (error) {
    console.log("error-->",error)
    return { status: false, msg: error?.message || "Error getting smart account" };
  }
};


export const getRpcProvider = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
    return provider;
  } catch (error) {
    return false;
  }
};
