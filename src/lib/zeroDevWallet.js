"use client";
import { send } from "process";
import { zeroAddress } from "viem"
import {
  createWeightedECDSAValidator,
  getUpdateConfigCall,
  getCurrentSigners,
  getValidatorAddress,
} from "@zerodev/weighted-ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  getUserOperationGasPrice
} from "@zerodev/sdk"
import {
  PasskeyValidatorContractVersion,
  WebAuthnMode,
  toPasskeyValidator,
  toWebAuthnKey
} from "@zerodev/passkey-validator"
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants"
// import ethers from "../manualPackage/ethers";
import {ethers} from "ethers";
import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem"
import { sepolia } from "viem/chains"
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
const BUNDLER_URL = "https://rpc.zerodev.app/api/v2/bundler/bfac7d2b-bb09-4aa5-be54-8c56270fff2e"
const PAYMASTER_RPC = "https://rpc.zerodev.app/api/v2/paymaster/bfac7d2b-bb09-4aa5-be54-8c56270fff2e"
const PASSKEY_SERVER_URL = "https://passkeys.zerodev.app/api/v3/bfac7d2b-bb09-4aa5-be54-8c56270fff2e"
const CHAIN = sepolia
const entryPoint = getEntryPoint("0.7")

const paymasterClient = createZeroDevPaymasterClient({
  chain: sepolia,
  transport: http(PAYMASTER_RPC),
})

const publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
  chain: CHAIN
})

const accountClient = async (signer1) => {
  try {
    const account = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: signer1
      },
      kernelVersion: KERNEL_V3_1

    });
    console.log("account-->", account)


    const kernelClient = createKernelAccountClient({
      account,

      // Replace with your chain
      chain: sepolia,

      // Replace with your bundler RPC.
      // For ZeroDev, you can find the RPC on your dashboard.
      bundlerTransport: http(BUNDLER_URL),

      // Required - the public client
      client: publicClient,

      // Optional -- only if you want to use a paymaster
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation })
        }
      },

      // Required - the default gas prices might be too high
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient)
        }
      }
    })
    return {
      account,
      kernelClient
    }
  } catch (error) {
    console.log("account client error--->", error)
    return false
  }
}

export const getProvider = async(kernelClient)=>{
  try {
    const kernelProvider = new KernelEIP1193Provider(kernelClient);
    const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);

    return {kernelProvider, ethersProvider};
  } catch (error) {
    console.log("get provider error-->",error)
    return false;
  }
}

const zeroTrxn = async (kernelClient) => {
  try {
    const op1Hash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([{
        to: zeroAddress,
        value: BigInt(0),
        data: "0x",
      }]),
    });
    console.log("op1Hash-->", op1Hash)
    await kernelClient.waitForUserOperationReceipt({
      hash: op1Hash,
    });

    console.log("userOp sent");
    return op1Hash;
  } catch (error) {
    console.log("zeroTrxn error-->", zeroTrxn)
    return false
  }
}
export const createAccount = async (signer1) => {
  try {
    const getAccount = await accountClient(signer1)
    if (!getAccount) {
      return {
        status: false, msg: "Error In creating Account!"
      }
    }
    console.log("create Account-->", getAccount)
    const accountDeploymentTrxn = await zeroTrxn(getAccount?.kernelClient)
    if (!accountDeploymentTrxn) {
      return {
        status: false, msg: "Error In Zero Trxn!"
      }
    }
    return {
      status: true, account: getAccount, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address
    }
  } catch (error) {
    console.log("create account error-->", error)
    return { status: false, msg: "Please Try again ALter!" }
  }
}


export const getAccount = async (signer1) => {
  try {
    const getAccount = await accountClient(signer1)
    if (!getAccount) {
      return {
        status: false, msg: "No Account Found!"
      }
    }
    console.log("create Account-->", getAccount)
    return {
      status: true, account: getAccount, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address
    }
  } catch (error) {
    console.log("create account error-->", error)
    return { status: false, msg: "Please Try again ALter!" }
  }
}