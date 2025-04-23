"use client";
import { send } from "process";
import { zeroAddress } from "viem"
// import { getWalletNetWorth } from "./balance";
import {
  createWeightedKernelAccountClient,
  createWeightedValidator,
  toWebAuthnSigner,
  getRecoveryFallbackActionInstallModuleData
} from "@zerodev/weighted-validator";
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

import { delay } from "../utils/globals"

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  getUserOperationGasPrice,
} from "@zerodev/sdk"
import {
  getValidatorPluginInstallModuleData,
} from "@zerodev/sdk";
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
import { sepolia, mainnet, arbitrum, base } from "viem/chains"
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
import { mnemonicToAccount } from 'viem/accounts'
import { english, generateMnemonic } from 'viem/accounts'



// const PASSKEY_SERVER_URL = `https://passkeys.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`

const PASSKEY_SERVER_URL = `https://passkeys.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`


// export const PASSKEY_SERVER_URL =
// "https://passkeys.zerodev.app/api/v3/efbc1add-1c14-476e-b3f1-206db80e673c";
// export const BUNDLER_URL =
//   `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
// export const PAYMASTER_RPC =
//   `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;


export const BUNDLER_URL = `https://rpc.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}/chain/8453`

export const PAYMASTER_RPC =
  `https://rpc.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}/chain/8453`;


// const CHAIN = ((process.env.NEXT_PUBLIC_NODE_ENV == "development") ? sepolia : mainnet)
const CHAIN = (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "arbitrum" && arbitrum) || (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "sepolia" && sepolia) || (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "mainnet" && mainnet) || (process.env.NEXT_PUBLIC_ENV_CHAIN_NAME == "base" && base)
// const CHAIN = arbitrum;
// console.log("CHAIN-->", CHAIN)
const entryPoint = getEntryPoint("0.7")
const recoveryExecutorAddress = '0x2f65dB8039fe5CAEE0a8680D2879deB800F31Ae1'
const recoveryExecutorFunction = 'function doRecovery(address _validator, bytes calldata _data)'
const recoveryExecutorSelector = toFunctionSelector(recoveryExecutorFunction)


const paymasterClient = createZeroDevPaymasterClient({
  chain: CHAIN,
  transport: http(PAYMASTER_RPC),
})

const publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
  chain: CHAIN
})

const accountClient = async (signer1, accountAddress) => {
  try {
    const account = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: signer1
      },
      kernelVersion: KERNEL_V3_1,
      address: accountAddress,
    });
    console.log("account accountClient-->", account)


    const kernelClient = createKernelAccountClient({
      account,

      // Replace with your chain
      chain: CHAIN,

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
    const recoverySigner = await mnemonicToAccount(phrase)
    console.log("account-->", recoverySigner)


    const recoveryValidator = await createWeightedECDSAValidator(publicClient, {
      signers: [recoverySigner],
      kernelVersion: KERNEL_V3_1,
      entryPoint,
      config: {
        threshold: 100,
        signers: [
          {
            address: recoverySigner.address,
            weight: 100,
          },
        ],
      },
    });
    const recoveryAction = getRecoveryAction(entryPoint.version);

    const recoveryPluginInstallModuleData =
      await getValidatorPluginInstallModuleData({
        entryPoint,
        kernelVersion: KERNEL_V3_1,
        plugin: recoveryValidator,
        action: recoveryAction,
      });
    const account = await createKernelAccount(publicClient, {
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      plugins: {
        sudo: signer1,
      },
      pluginMigrations: [
        recoveryPluginInstallModuleData,
        getRecoveryFallbackActionInstallModuleData(entryPoint.version),
      ],
      // Only needed to set after changing the sudo validator config i.e.
      // changing the threshold or adding/removing/updating signers
      // After doing recovery
      // address: accountAddress,
    });

    const kernelClient = createWeightedKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      // Optional -- only if you want to use a paymaster
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation })
        }
      },

    });
    console.log("account accountCreateClient-->", account)
    return {
      account,
      kernelClient
    }
  } catch (error) {
    console.log("account client error--->", error)
    return false
  }
}


const accountRecoveryCreateClient = async (accountAddress, signer1, phrase) => {
  try {
    const signer = await mnemonicToAccount(phrase)
    console.log("account-->", signer)

    const recoveryValidator = await createWeightedECDSAValidator(publicClient, {
      signers: [signer],
      kernelVersion: KERNEL_V3_1,
      entryPoint,
      config: {
        threshold: 100,
        signers: [
          {
            address: signer.address,
            weight: 100,
          },
        ],
      },
    });

    const account = await createKernelAccount(publicClient, {
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      plugins: {
        regular: recoveryValidator,
      },
      address: accountAddress,
    });
    console.log("account, t", account)

    const kernelClient = createWeightedKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      // Optional -- only if you want to use a paymaster
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation })
        }
      },

    });

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
    console.log(kernelClient)
    const kernelProvider = new KernelEIP1193Provider(kernelClient);
    const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);
    const signer = await ethersProvider.getSigner();
    return { kernelProvider, ethersProvider, signer };
  } catch (error) {
    console.log("get provider error-->", error)
    return false;
  }
}

const checkDeployment = async (kernelClient) => {
  try {
    let testDeployment = await kernelClient.account.isDeployed();
    console.log("testDeployment-->", testDeployment)
    if (testDeployment) {
      return true
    } else {
      await delay(60000)
      let t = await checkDeployment(kernelClient)
      return t
    }
  } catch (error) {
    await delay(60000)
    let t = await checkDeployment(kernelClient)
    return t
  }
}

export const zeroTrxn = async (kernelClient) => {
  try {
    const op1Hash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([{
        to: zeroAddress,
        value: BigInt(0),
        data: "0x",
      }]),
    });
    console.log("op1Hash-->", op1Hash)
    let checkRecit = await kernelClient.waitForUserOperationReceipt({
      hash: op1Hash,
    });
    console.log("userOp sent", checkRecit);
    let tr = await checkDeployment(kernelClient)
    return tr
    // return op1Hash;
  } catch (error) {
    console.log("zeroTrxn error-->", error)
    // let tr = await zeroTrxn(kernelClient)
    // return tr
    let tr = await checkDeployment(kernelClient)
    return tr
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
    console.log("signer1-->", signer1)
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


export const getAccount = async (signer1, address = "") => {
  try {
    const getAccount = await accountClient(signer1, address)
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


export const getRecoverAccount = async (address, signer1, phrase) => {
  try {
    const getAccount = await accountRecoveryCreateClient(address, signer1, phrase)
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



export const doRecovery = async (address, signer1, phrase, name) => {
  try {
    const getAccount = await accountRecoveryCreateClient(address, signer1, phrase)
    if (!getAccount) {
      return {
        status: false, msg: "No Account Found!"
      }
    }
    console.log("create getRecoverAccount-->", getAccount)
    const publicKey3 = await registerPasskey(name);
    console.log("publicKey3.webAuthnKey-->", publicKey3.webAuthnKey)
    //newPasskeyValidator
    const passkeyValidator1 = await passkeyValidator(publicKey3.webAuthnKey);

    console.log("passkeyValidator.newPasskeyValidator -->", passkeyValidator1.newPasskeyValidator)


    // abi: parseAbi([recoveryExecutorFunction]),
    //   functionName: "doRecovery",
    //   args: [getValidatorAddress(entryPoint, KERNEL_V3_1), newSigner.address],
    console.log("Sending Recovery Operation");


    // const passKeySigner3 = await toWebAuthnSigner(publicClient, {
    //   webAuthnKey: publicKey3.webAuthnKey,
    // });
    // console.log("passKeySigner3-->", publicKey3.webAuthnKey, passKeySigner3)
    // const newValidator = await createWeightedValidator(publicClient, {
    //   kernelVersion: KERNEL_V3_1,
    //   entryPoint,
    //   signer: passKeySigner3,
    //   config: {
    //     threshold: 100,
    //     signers: [
    //       {
    //         publicKey: publicKey3.webAuthnKey,
    //         weight: 100,
    //       }
    //     ],
    //   },
    // });

    // console.log("newValidator", newValidator.address)

    const userOpHash = await getAccount.kernelClient.sendUserOperation({
      callData: encodeFunctionData({
        abi: parseAbi([recoveryExecutorFunction]),
        functionName: "doRecovery",
        args: [passkeyValidator1.newPasskeyValidator.address, await passkeyValidator1.newPasskeyValidator.getEnableData()],
        // args: [newValidator.address, await newValidator.getEnableData()],
      }),
    });
    console.log({ userOpHash });
    console.log("Waiting for Recovery Operation Receipt");
    const txReceipt = await getAccount.kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return {
      status: true, account: getAccount, kernelClient: getAccount.kernelClient, address: getAccount.kernelClient.account.address, passkeyValidatorNew: passkeyValidator1.newPasskeyValidator, newwebAuthKey: publicKey3.webAuthnKey
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
      chain: CHAIN,
      transport: http(PAYMASTER_RPC),
    });

    const kernelClient = createKernelAccountClient({
      account: accountExample,
      chain: CHAIN,
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
export const getTrxn = async (signer1, address = ""
) => {
  try {
    const getAccount = await accountClient(signer1, address)
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



export const multisigSetup = async (webauthKey, email, passkeyNo) => {
  try {
    // state.passkeyCred = action.payload.passkeyCred;
    // state.webauthKey = action.payload.webauthKey;
    console.log("publicKey1.webAuthnKey-->", webauthKey)
    const passkeyValidator1 = await passkeyValidator(webauthKey);


    const publicKey2 = await registerPasskey(email + "_passkey_" + passkeyNo);
    console.log("publicKey2", publicKey2)
    if (!publicKey2.status) {
      return ({
        status: false,
        msg: "Please Enter Passkey"
      })
    }
    console.log("publicKey2.webAuthnKey-->", publicKey2.webAuthnKey)
    //newPasskeyValidator

    const passkeyValidator2 = await passkeyValidator(publicKey2.webAuthnKey);
    const publicKey3 = await registerPasskey(email + "_passkey_" + (passkeyNo + 1));
    if (!publicKey3.status) {
      return ({
        status: false,
        msg: "Please Enter Passkey"
      })
    }
    console.log("publicKey3.webAuthnKey-->", publicKey3.webAuthnKey)
    //newPasskeyValidator
    const passkeyValidator3 = await passkeyValidator(publicKey3.webAuthnKey);
    const signer = await toWebAuthnSigner(publicClient, {
      webAuthnKey: webauthKey,
    });
    console.log("signer -->", signer)
    const multiSigValidator = await createWeightedValidator(publicClient, {
      entryPoint,
      signer,
      kernelVersion: KERNEL_V3_1,
      config: {
        threshold: 100,
        signers: [
          {
            publicKey: webauthKey,
            weight: 50,
          },
          {
            publicKey: publicKey2.webAuthnKey,
            weight: 50,
          },
          {
            publicKey: publicKey3.webAuthnKey,
            weight: 50,
          },
        ],
      },
    });
    console.log("multiSigValidator-->", multiSigValidator)
    const account = await createKernelAccount(publicClient, {
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      plugins: {
        sudo: multiSigValidator,
      },
    });

    const paymasterClient = createZeroDevPaymasterClient({
      chain: CHAIN,
      transport: http(PAYMASTER_RPC),
    });

    const client = createWeightedKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      paymaster: {
        getPaymasterData: async (userOperation) => {
          return await paymasterClient.sponsorUserOperation({
            userOperation,
          });
        },
      },
    });
    console.log(client)
    return ({
      address: client.account.address,
      publicKey2: publicKey2.webAuthnKey,
      publicKey3: publicKey3.webAuthnKey,
      msg: "Multisig Account Setup",
      status: true,
    })
  } catch (error) {
    console.log("error-->")
    return ({
      status: false,
      msg: error.message
    })
  }
}


export const createApproval = async () => {
  try {

  } catch (error) {

  }
}

export const createPassKeyWeightedClient = async (signerPasskey, passkey1, passkey2, passkey3) => {
  try {
    const signer = await toWebAuthnSigner(publicClient, {
      webAuthnKey: signerPasskey,
    });
    const multiSigValidator = await createWeightedValidator(publicClient, {
      entryPoint,
      signer,
      kernelVersion: KERNEL_V3_1,
      config: {
        threshold: 100,
        signers: [
          {
            publicKey: passkey1,
            weight: 50,
          },
          {
            publicKey: passkey2,
            weight: 50,
          },
          {
            publicKey: passkey3,
            weight: 50,
          },
        ],
      },
    });
    console.log("multiSigValidator-->", multiSigValidator)
    const account = await createKernelAccount(publicClient, {
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      plugins: {
        sudo: multiSigValidator,
      },
    });
    const paymasterClient = createZeroDevPaymasterClient({
      chain: CHAIN,
      transport: http(PAYMASTER_RPC),
    });
    const client = createWeightedKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      paymaster: {
        getPaymasterData: async (userOperation) => {
          return await paymasterClient.sponsorUserOperation({
            userOperation,
          });
        },
      },
    });
    console.log(client)
    return ({
      address: client.account.address,
      client: client,
      msg: "Multisig Account Setup",
      status: true,
    })
  } catch (error) {
    return ({
      status: false,
      msg: error.message
    })
  }
}
