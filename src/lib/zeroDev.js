"use client";
import { zeroAddress, parseUnits } from "viem";


import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"



import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  getUserOperationGasPrice,
  gasTokenAddresses,
  getERC20PaymasterApproveCall
} from "@zerodev/sdk";

import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { sepolia, mainnet, arbitrum, base } from "viem/chains";
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'


export let BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;

export const MAINNET_BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID_ETH}`;
export const MAINNET_PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID_ETH}`;


const CHAIN =
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "arbitrum" && arbitrum) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "sepolia" && sepolia) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "mainnet" && mainnet) ||
  (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME === "base" && base);
const entryPoint = getEntryPoint("0.7");


let paymasterClient = createZeroDevPaymasterClient({
  chain: CHAIN,
  transport: http(PAYMASTER_RPC),
});

let publicClient = createPublicClient({
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

export const setupNewAccount = async (PRIVATE_KEY, chain = base) => {
  try {

    if (chain === mainnet) {

      paymasterClient = createZeroDevPaymasterClient({
        chain,
        transport: http(MAINNET_PAYMASTER_RPC),
      });
      BUNDLER_URL = MAINNET_BUNDLER_URL

      publicClient = createPublicClient({
        transport: http(BUNDLER_URL),
        chain,
      });


    } else if (chain === base) {

      paymasterClient = createZeroDevPaymasterClient({
        chain: CHAIN,
        transport: http(PAYMASTER_RPC),
      });
      BUNDLER_URL = "https://rpc.zerodev.app/api/v2/bundler/310cd92b-af6a-470d-9496-754b31de2c48";
      publicClient = createPublicClient({
        transport: http(BUNDLER_URL),
        chain: CHAIN,
      });

    }

    const signer = privateKeyToAccount(PRIVATE_KEY)
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

    const kernelClient = createKernelAccountClient({
      account,
      chain: chain ?? CHAIN,
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

    // const trxnZero = await zeroTrxn(kernelClient)
    let res = {
      status: true,
      data: {
        privatekey: PRIVATE_KEY,
        address: account.address,
        account: account,
        trxn: ""
      }
    }
    // if (trxnZero?.status) {
    //   res = {
    //     status: true,
    //     data: {
    //       privatekey: PRIVATE_KEY,
    //       address: account.address,
    //       account: account,
    //       trxn: trxnZero.data
    //     }
    //   }
    // } else {
    //   res = {
    //     status: false,
    //     msg: "Error In Zero Trxn!"
    //   }
    // }
     return res;
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
    } return res;
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


export const getAccount = async (PRIVATE_KEY, chain = base) => {
  try {

    if (chain === mainnet) {

      paymasterClient = createZeroDevPaymasterClient({
        chain,
        transport: http(MAINNET_PAYMASTER_RPC),
      });
      BUNDLER_URL = MAINNET_BUNDLER_URL

      publicClient = createPublicClient({
        transport: http(BUNDLER_URL),
        chain,
      });


    } else if (chain === base) {

      paymasterClient = createZeroDevPaymasterClient({
        chain: CHAIN,
        transport: http(PAYMASTER_RPC),
      });
      BUNDLER_URL = "https://rpc.zerodev.app/api/v2/bundler/310cd92b-af6a-470d-9496-754b31de2c48";
      publicClient = createPublicClient({
        transport: http(BUNDLER_URL),
        chain: CHAIN,
      });

    }

    const signer = privateKeyToAccount(PRIVATE_KEY)
    // Create ECDSA validator

    // Create Circle Paymaster Client
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
      chain: chain ?? CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      client: publicClient,
      paymaster: paymasterClient,
      paymasterContext: {
        token: gasTokenAddresses[(chain ?? CHAIN).id].USDC,
      },
    });



    // Approve USDC for the paymaster (ensure that the account has enough USDC)
    const userOpHash = await kernelClient.sendUserOperation({
      callData: await account.encodeCalls([
        await getERC20PaymasterApproveCall(paymasterClient, {
          gasToken: gasTokenAddresses[(chain ?? CHAIN).id].USDC,
          approveAmount: parseUnits('1', 6),
          entryPoint,
        }),
        {
          to: zeroAddress,
          value: BigInt(0),
          data: "0x",
        },
      ]),
    });

    console.log("UserOp hash:", userOpHash);

    // Wait for the receipt of the user operation
    const receipt = await kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    console.log("UserOp completed", receipt.receipt.transactionHash);

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
    };
  } catch (error) {
    console.log("error-->", error)
    return { status: false, msg: error?.message || "Please Try again ALter!" };
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