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
  getRecoveryAction,
  getValidatorAddress,
  signerToEcdsaValidator,
} from "@zerodev/weighted-ecdsa-validator";
import { toFunctionSelector } from "viem";

import { delay } from "../utils/globals";

import { privateKeyToAccount } from "viem/accounts";
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

const accountClient = async (signer1, accountAddress) => {
  try {
    const account = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: signer1,
      },
      kernelVersion: KERNEL_V3_1,
      address: accountAddress,
    });

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
    return {
      account,
      kernelClient,
    };
  } catch (error) {
    return false;
  }
};

const accountCreateClient = async (signer1, phrase) => {
  try {
    const recoverySigner = await mnemonicToAccount(phrase);

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
    });

    const kernelClient = createWeightedKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation });
        },
      },
    });
    return {
      account,
      kernelClient,
    };
  } catch (error) {
    return false;
  }
};

const accountRecoveryCreateClient = async (accountAddress, signer1, phrase) => {
  try {
    const signer = await mnemonicToAccount(phrase);

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

    const kernelClient = createWeightedKernelAccountClient({
      account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      paymaster: {
        getPaymasterData(userOperation) {
          return paymasterClient.sponsorUserOperation({ userOperation });
        },
      },
    });

    return {
      account,
      kernelClient,
    };
  } catch (error) {
    return false;
  }
};

export const getProvider = async (kernelClient) => {
  try {
    const kernelProvider = new KernelEIP1193Provider(kernelClient);
    const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);
    const signer = await ethersProvider.getSigner();
    return { kernelProvider, ethersProvider, signer };
  } catch (error) {
    return false;
  }
};

const checkDeployment = async (kernelClient) => {
  try {
    let testDeployment = await kernelClient.account.isDeployed();
    if (testDeployment) {
      return true;
    } else {
      await delay(60000);
      let t = await checkDeployment(kernelClient);
      return t;
    }
  } catch (error) {
    await delay(60000);
    let t = await checkDeployment(kernelClient);
    return t;
  }
};

export const zeroTrxn = async (kernelClient) => {
  try {
    const op1Hash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([
        {
          to: zeroAddress,
          value: BigInt(0),
          data: "0x",
        },
      ]),
    });
    let checkRecit = await kernelClient.waitForUserOperationReceipt({
      hash: op1Hash,
    });
    let tr = await checkDeployment(kernelClient);
    return tr;
  } catch (error) {
    let tr = await checkDeployment(kernelClient);
    return tr;
  }
};

const recoveryTrxn = async (kernelClient, newSigner) => {
  try {
    const op1Hash = await kernelClient.sendUserOperation({
      callData: encodeFunctionData({
        abi: parseAbi([recoveryExecutorFunction]),
        functionName: "doRecovery",
        args: [getValidatorAddress(entryPoint, KERNEL_V3_1), newSigner.address],
      }),
    });
    await kernelClient.waitForUserOperationReceipt({
      hash: op1Hash,
    });

    return op1Hash;
  } catch (error) {
    return false;
  }
};
export const createAccount = async (signer1, phrase) => {
  try {
    const getAccount = await accountCreateClient(signer1, phrase);
    if (!getAccount) {
      return {
        status: false,
        msg: "Error In creating Account!",
      };
    }

    const accountDeploymentTrxn = await zeroTrxn(getAccount?.kernelClient);
    if (!accountDeploymentTrxn) {
      return {
        status: false,
        msg: "Error In Zero Trxn!",
      };
    }
    return {
      status: true,
      account: getAccount.account,
      kernelClient: getAccount.kernelClient,
      address: getAccount.kernelClient.account.address,
    };
  } catch (error) {
    return {
      status: false,
      msg: "Problem creating kernel account. Please Try again ALter!",
    };
  }
};

export const getAccount = async (signer1, address = "") => {
  try {
    const getAccount = await accountClient(signer1, address);
    if (!getAccount) {
      return {
        status: false,
        msg: "No Account Found!",
      };
    }
    return {
      status: true,
      account: getAccount,
      kernelClient: getAccount.kernelClient,
      address: getAccount.kernelClient.account.address,
    };
  } catch (error) {
    return { status: false, msg: "Please Try again ALter!" };
  }
};

export const getRecoverAccount = async (address, signer1, phrase) => {
  try {
    const getAccount = await accountRecoveryCreateClient(
      address,
      signer1,
      phrase
    );
    if (!getAccount) {
      return {
        status: false,
        msg: "No Account Found!",
      };
    }
    return {
      status: true,
      account: getAccount,
      kernelClient: getAccount.kernelClient,
      address: getAccount.kernelClient.account.address,
    };
  } catch (error) {
    return { status: false, msg: "Please Try again ALter!" };
  }
};

export const doRecovery = async (address, signer1, phrase, name) => {
  try {
    const getAccount = await accountRecoveryCreateClient(
      address,
      signer1,
      phrase
    );
    if (!getAccount) {
      return {
        status: false,
        msg: "No Account Found!",
      };
    }
    const publicKey3 = await registerPasskey(name);
    const passkeyValidator1 = await passkeyValidator(publicKey3.webAuthnKey);

    const userOpHash = await getAccount.kernelClient.sendUserOperation({
      callData: encodeFunctionData({
        abi: parseAbi([recoveryExecutorFunction]),
        functionName: "doRecovery",
        args: [
          passkeyValidator1.newPasskeyValidator.address,
          await passkeyValidator1.newPasskeyValidator.getEnableData(),
        ],
      }),
    });
    const txReceipt = await getAccount.kernelClient.waitForUserOperationReceipt(
      {
        hash: userOpHash,
      }
    );

    return {
      status: true,
      account: getAccount,
      kernelClient: getAccount.kernelClient,
      address: getAccount.kernelClient.account.address,
      passkeyValidatorNew: passkeyValidator1.newPasskeyValidator,
      newwebAuthKey: publicKey3.webAuthnKey,
    };
  } catch (error) {
    return { status: false, msg: "Please Try again ALter!" };
  }
};

export const doRecoveryNewSigner = async (signer1, phrase, newSigner) => {
  try {
    const getAccount = await accountRecoveryCreateClient(signer1, phrase);
    if (!getAccount) {
      return {
        status: false,
        msg: "No Account Found!",
      };
    }

    const accountDeploymentTrxn = await recoveryTrxn(
      getAccount?.kernelClient,
      newSigner
    );
    if (!accountDeploymentTrxn) {
      return {
        status: false,
        msg: "Error In Deployment Trxn!",
      };
    }
    return {
      status: true,
      account: getAccount,
      kernelClient: getAccount.kernelClient,
      address: getAccount.kernelClient.account.address,
    };
  } catch (error) {
    return { status: false, msg: "Please Try again ALter!" };
  }
};

//this function works
export const getTrxn = async (signer1, address = "") => {
  try {
    const getAccount = await accountClient(signer1, address);
    if (!getAccount) {
      return {
        status: false,
        msg: "No Account Found!",
      };
    }
    let kernelClient = getAccount.kernelClient;
    const op1Hash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([
        {
          to: "0x9A872029Ee44858EA17B79E30198947907a3a67A",
          value: BigInt(100000000000000000),
          data: "0x",
        },
      ]),
    });
    await kernelClient.waitForUserOperationReceipt({
      hash: op1Hash,
    });

    return {
      status: true,
      op1Hash,
      account: getAccount,
      kernelClient: getAccount.kernelClient,
      address: getAccount.kernelClient.account.address,
    };
  } catch (error) {
    return { status: false, msg: "Please Try again ALter!" };
  }
};

export const getMnemonic = async () => {
  try {
    const mnemonic = await generateMnemonic(english);
    return mnemonic;
  } catch (error) {
    return false;
  }
};

export const registerPasskey = async (passkeyName) => {
  try {
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: passkeyName,
      passkeyServerUrl: PASSKEY_SERVER_URL,
      mode: WebAuthnMode.Register,
      passkeyServerHeaders: {},
    });
    return {
      status: true,
      webAuthnKey,
    };
  } catch (error) {
    return {
      status: false,
      msg: error.message,
    };
  }
};

export const passkeyValidator = async (webAuthnKey) => {
  try {
    const newPasskeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
    });
    return {
      status: true,
      newPasskeyValidator,
    };
  } catch (error) {
    return {
      status: false,
      msg: error.message,
    };
  }
};

export const loginPasskey = async (passkeyName) => {
  try {
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: passkeyName,
      passkeyServerUrl: PASSKEY_SERVER_URL,
      mode: WebAuthnMode.Login,
      passkeyServerHeaders: {},
    });
    return {
      status: true,
      webAuthnKey,
    };
  } catch (error) {
    return {
      status: false,
      msg: error.message,
    };
  }
};

export const multisigSetup = async (webauthKey, email, passkeyNo) => {
  try {
    const passkeyValidator1 = await passkeyValidator(webauthKey);

    const publicKey2 = await registerPasskey(email + "_passkey_" + passkeyNo);
    if (!publicKey2.status) {
      return {
        status: false,
        msg: "Please Enter Passkey",
      };
    }

    const passkeyValidator2 = await passkeyValidator(publicKey2.webAuthnKey);
    const publicKey3 = await registerPasskey(
      email + "_passkey_" + (passkeyNo + 1)
    );
    if (!publicKey3.status) {
      return {
        status: false,
        msg: "Please Enter Passkey",
      };
    }
    //newPasskeyValidator
    const passkeyValidator3 = await passkeyValidator(publicKey3.webAuthnKey);
    const signer = await toWebAuthnSigner(publicClient, {
      webAuthnKey: webauthKey,
    });
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
    return {
      address: client.account.address,
      publicKey2: publicKey2.webAuthnKey,
      publicKey3: publicKey3.webAuthnKey,
      msg: "Multisig Account Setup",
      status: true,
    };
  } catch (error) {
    return {
      status: false,
      msg: error.message,
    };
  }
};

export const createApproval = async () => {
  try {
  } catch (error) {}
};

export const createPassKeyWeightedClient = async (
  signerPasskey,
  passkey1,
  passkey2,
  passkey3
) => {
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
    return {
      address: client.account.address,
      client: client,
      msg: "Multisig Account Setup",
      status: true,
    };
  } catch (error) {
    return {
      status: false,
      msg: error.message,
    };
  }
};
