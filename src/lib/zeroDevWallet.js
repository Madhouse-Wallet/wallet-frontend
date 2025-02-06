"use client";
import { send } from "process";
import { zeroAddress } from "viem"
import {
  createWeightedECDSAValidator,
  getRecoveryAction,
  getUpdateConfigCall,
  getCurrentSigners,
  getValidatorAddress,
  signerToEcdsaValidator
} from "@zerodev/weighted-ecdsa-validator";
import { ECDSA_VALIDATOR_ADDRESS } from "@zerodev/ecdsa-validator"
import { toFunctionSelector } from "viem"


import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
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
import { ethers } from "ethers";
import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem"
import { sepolia } from "viem/chains"
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
import { mnemonicToAccount } from 'viem/accounts'
import { english, generateMnemonic } from 'viem/accounts'



const BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`
const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`
const PASSKEY_SERVER_URL = `https://passkeys.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`

const CHAIN = sepolia
const entryPoint = getEntryPoint("0.7")
const recoveryExecutorAddress = '0x2f65dB8039fe5CAEE0a8680D2879deB800F31Ae1'
const recoveryExecutorFunction = 'function doRecovery(address _validator, bytes calldata _data)'
const recoveryExecutorSelector = toFunctionSelector(recoveryExecutorFunction)


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
    console.log("account accountClient-->", account)


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

const accountCreateClient = async (signer1, phrase) => {
  try {
    const guardian = await mnemonicToAccount(phrase)
    console.log("account-->", guardian)
    const guardianValidator = await createWeightedECDSAValidator(publicClient, {
      entryPoint,
      config: {
        threshold: 100,
        signers: [{ address: guardian.address, weight: 100 }],
      },
      signers: [guardian],
      kernelVersion: KERNEL_V3_1,
    });

    const account = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: signer1,
        regular: guardianValidator,
        // action: getRecoveryAction(entryPoint.version),
      },
      kernelVersion: KERNEL_V3_1,
    });

    console.log("account accountCreateClient-->", account)

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


const accountRecoveryCreateClient = async (signer1, phrase) => {
  try {
    const guardian = await mnemonicToAccount(phrase)
    console.log("account-->", guardian)
    const guardianValidator = await createWeightedECDSAValidator(publicClient, {
      entryPoint,
      config: {
        threshold: 100,
        signers: [{ address: guardian.address, weight: 100 }],
      },
      signers: [guardian],
      kernelVersion: KERNEL_V3_1,
    });
    //  tried this way too
    // const account = await createKernelAccount(publicClient, {
    //   entryPoint,
    //   plugins: {
    // sudo: signer1,
    // regular: guardianValidator,
    //     action: getRecoveryAction(entryPoint.version),
    //   },
    //   kernelVersion: KERNEL_V3_1,
    // });
    const account = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: signer1,
        regular: guardianValidator,
        action: {
          address: recoveryExecutorAddress,
          selector: recoveryExecutorSelector,
        },
      },
      kernelVersion: KERNEL_V3_1,
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

export const getProvider = async (kernelClient) => {
  try {
    const kernelProvider = new KernelEIP1193Provider(kernelClient);
    const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);
    const signer = await ethersProvider.getSigner();
    return { kernelProvider, ethersProvider, signer };
  } catch (error) {
    console.log("get provider error-->", error)
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
    console.log("zeroTrxn error-->", error)
    return false
  }
}

const recoveryTrxn = async (kernelClient, newSigner) => {
  try {
    console.log("performing recovery...", newSigner);
    // const op1Hash = await kernelClient.sendUserOperation({
    //   callData: await kernelClient.account.encodeCalls([{
    //     to: recoveryExecutorAddress,
    //     value: BigInt(0),
    //     data: encodeFunctionData({
    //       abi: parseAbi([recoveryExecutorFunction]),
    //       functionName: "doRecovery",
    //       args: [getValidatorAddress(entryPoint, KERNEL_V3_1), newSigner.address],
    //     }),
    //   }])
    // });
    const op1Hash = await kernelClient.sendUserOperation({
      callData: encodeFunctionData({
        abi: parseAbi([recoveryExecutorFunction]),
        functionName: "doRecovery",
        args: [getValidatorAddress(entryPoint, KERNEL_V3_1), newSigner.address],
      }),
    });
    console.log("op1Hash-->", op1Hash)
    await kernelClient.waitForUserOperationReceipt({
      hash: op1Hash,
    });

    console.log("userOp sent");
    return op1Hash;

  } catch (error) {
    console.log("recoveryrxn error -->", error)
    return false
  }
}
export const createAccount = async (signer1, phrase) => {
  try {
    const getAccount = await accountCreateClient(signer1, phrase)
    // const getAccount = await accountClient(signer1)
    if (!getAccount) {
      return {
        status: false, msg: "Error In creating Account!"
      }
    }
    // account,
    // kernelClient
    console.log("create Account-->", getAccount)
    const accountDeploymentTrxn = await zeroTrxn(getAccount?.kernelClient)
    if (!accountDeploymentTrxn) {
      return {
        status: false, msg: "Error In Zero Trxn!"
      }
    }
    return {
      status: true, account: getAccount.account, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address
    }
  } catch (error) {
    console.log("create account error-->", error)
    return { status: false, msg: "Problem creating kernel account. Please Try again ALter!" }
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


export const getRecoverAccount = async (signer1, phrase) => {
  try {
    const getAccount = await accountRecoveryCreateClient(signer1, phrase)
    if (!getAccount) {
      return {
        status: false, msg: "No Account Found!"
      }
    }
    console.log("create getRecoverAccount-->", getAccount)
    return {
      status: true, account: getAccount, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address
    }
  } catch (error) {
    console.log("create account error-->", error)
    return { status: false, msg: "Please Try again ALter!" }
  }
}

const getAccountPrivateKey = async () => {
  try {
    const guardian = mnemonicToAccount('legal winner thank year wave sausage worth useful legal winner thank yellow')
    console.log("accountExample-->", guardian)

    const oldSigner = privateKeyToAccount("0xeac1a6c7e2c3b01bef94127ca558d8f8b8f5e453da4bcd2950c017fb8150de05");


    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: oldSigner,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
    });

    const guardianValidator = await createWeightedECDSAValidator(publicClient, {
      entryPoint,
      config: {
        threshold: 100,
        signers: [{ address: guardian.address, weight: 100 }],
      },
      signers: [guardian],
      kernelVersion: KERNEL_V3_1,
    });


    const accountExample = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: ecdsaValidator,
        regular: guardianValidator,
        action: getRecoveryAction(entryPoint.version),
      },
      kernelVersion: KERNEL_V3_1,
    });
    console.log("newAccount-->", account.address)


    const paymasterClient = createZeroDevPaymasterClient({
      chain: sepolia,
      transport: http(PAYMASTER_RPC),
    });

    const kernelClient = createKernelAccountClient({
      account: accountExample,
      chain: sepolia,
      bundlerTransport: http(BUNDLER_URL),
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation });
        },
      },
    });
    return kernelClient
  } catch (error) {

  }
}


export const doRecoveryNewSigner = async (signer1, phrase, newSigner) => {
  try {
    const getAccount = await accountRecoveryCreateClient(signer1, phrase)
    if (!getAccount) {
      return {
        status: false, msg: "No Account Found!"
      }
    }


    //method for zerodev example private account client
    // const clientKernel = await getAccountPrivateKey()
    // const newSigner1 = privateKeyToAccount(generatePrivateKey());
    // const accountDeploymentTrxn = await recoveryTrxn(clientKernel, newSigner1)

    const accountDeploymentTrxn = await recoveryTrxn(getAccount?.kernelClient, newSigner)
    if (!accountDeploymentTrxn) {
      return {
        status: false, msg: "Error In Deployment Trxn!"
      }
    }
    return {
      status: true, account: getAccount, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address
    }
    // console.log("create getRecoverAccount-->", getAccount)
    // return {
    //   status: true, account: getAccount, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address
    // }
  } catch (error) {
    console.log("create account error-->", error)
    return { status: false, msg: "Please Try again ALter!" }
  }
}


//this function works
export const getTrxn = async (signer1) => {
  try {
    const getAccount = await accountClient(signer1)
    if (!getAccount) {
      return {
        status: false, msg: "No Account Found!"
      }
    }
    console.log("create Account-->", getAccount)
    let kernelClient = getAccount.kernelClient;
    const op1Hash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([{
        to: "0x9A872029Ee44858EA17B79E30198947907a3a67A",
        value: BigInt(100000000000000000),
        data: "0x",
      }]),
    });
    console.log("op1Hash-->", op1Hash)
    await kernelClient.waitForUserOperationReceipt({
      hash: op1Hash,
    });

    console.log("userOp sent");
    return {
      status: true, op1Hash, account: getAccount, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address
    }
  } catch (error) {
    console.log("create account error-->", error)
    return { status: false, msg: "Please Try again ALter!" }
  }
}

export const getMnemonic = async () => {
  try {
    const mnemonic = await generateMnemonic(english);
    return mnemonic;
  } catch (error) {
    console.log("getMnemonic error-->", error)
    return false
  }
}



export const registerPasskey = async (passkeyName) => {
  try {
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: passkeyName,
      passkeyServerUrl: PASSKEY_SERVER_URL,
      mode: WebAuthnMode.Register,
      passkeyServerHeaders: {},
    });
    return {
      status: true, webAuthnKey
    }
  } catch (error) {
    return {
      status: false, msg: error.message
    }
  }
}



export const passkeyValidator = async (webAuthnKey) => {
  try {
    const newPasskeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
    });
    return {
      status: true, newPasskeyValidator
    }
  } catch (error) {
    return {
      status: false, msg: error.message
    }
  }
}




export const loginPasskey = async (passkeyName) => {
  try {
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: passkeyName,
      passkeyServerUrl: PASSKEY_SERVER_URL,
      mode: WebAuthnMode.Login,
      passkeyServerHeaders: {},
    });
    return {
      status: true, webAuthnKey
    }
  } catch (error) {
    return {
      status: false, msg: error.message
    }
  }
}


