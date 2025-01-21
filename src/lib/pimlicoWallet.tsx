import {
  toKernelSmartAccount,
  ToKernelSmartAccountReturnType
} from "permissionless/accounts";
import {
  type SmartAccountClient,
  createSmartAccountClient
} from "permissionless"
import {
  RHINESTONE_ATTESTER_ADDRESS,
  MOCK_ATTESTER_ADDRESS,
  getOwnableValidator,
  encodeValidatorNonce,
  getAccount,
  getWebauthnValidatorMockSignature,
  getWebAuthnValidator,
  WEBAUTHN_VALIDATOR_ADDRESS,
  getWebauthnValidatorSignature,
} from "@rhinestone/module-sdk";
import { createWeightedECDSAValidator } from "@zerodev/weighted-ecdsa-validator"
import { sepolia, baseSepolia, polygonAmoy } from "viem/chains";
import { parsePublicKey, parseSignature, sign } from "webauthn-p256";
import { Hex, createPublicClient, encodePacked, getContract, http, pad } from "viem";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { getNonce } from "@/components/NonceManager";
import {
  toSafeSmartAccount,
  ToSafeSmartAccountReturnType,
} from "permissionless/accounts";
import { KernelEIP1193Provider } from '@zerodev/sdk/providers';
import { erc7579Actions } from "permissionless/actions/erc7579";
import { privateKeyToAccount } from "viem/accounts";
import {
  entryPoint07Address,
  toWebAuthnAccount,
} from "viem/account-abstraction";

import { toPasskeyValidator, toWebAuthnKey, WebAuthnMode, PasskeyValidatorContractVersion } from "@zerodev/passkey-validator"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient, getUserOperationGasPrice } from "@zerodev/sdk"
import { initiateLogin } from "@zerodev/social-validator"
import { getSocialValidator } from "@zerodev/social-validator"
import { isAuthorized } from "@zerodev/social-validator"



// tBTC SDK Initialization Function
const publicClientSepolia = createPublicClient({
  chain: polygonAmoy,
  transport: http('https://rpc-amoy.polygon.technology'),
});


const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.drpc.org'),
});
import {
  getMultiFactorValidator,
} from '@rhinestone/module-sdk'
import { ethers } from "ethers";
import {
  ThresholdMessageKit, encrypt, domains, conditions, decrypt, fromBytes, initialize, toBytes, toHexString,
} from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';

const appId = "webauthn";
const pimlicoUrl = `https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`

const pimlicoAmoyUrl = `https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`;
const pimlicoClient = createPimlicoClient({
  chain: sepolia,
  transport: http(pimlicoUrl)
})



// zero Dev
const passkeyServerUrl = 'https://passkeys.zerodev.app/api/v3/459dfa57-b4fc-46e4-8e57-df544ead38f9';
const entryPoint = getEntryPoint("0.7")
const PROJECT_ID = '98fd43a8-fb2f-4948-a7ae-069f53969f73';
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;
const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`;

const ENCRYPTOR_PRIVATE_KEY = "0x900edb9e8214b2353f82aa195e915128f419a92cfb8bbc0f4784f10ef4112b86"
const CONSUMER_PRIVATE_KEY = "0xf307e165339cb5deb2b8ec59c31a5c0a957b8e8453ce7fe8a19d9a4c8acf36d4"
const rpcProviderUrl = "https://rpc-amoy.polygon.technology";


const paymasterClient = createZeroDevPaymasterClient({
  chain: sepolia,
  transport: http(PAYMASTER_RPC),
})



const createProviderCowSwap = async (account: any, smartAccountClient: any) => {
  return ({
    enable: async () => {
      return [account.address];
    },
    request: async ({ method, params }: any) => {
      console.log('Provider request:', method, params);

      switch (method) {
        case 'eth_accounts':
          return [account.address];

        case 'eth_chainId':
          return `0x${polygonAmoy.id.toString(16)}`;

        case 'eth_getBalance':
          try {
            const balance = await publicClient.getBalance({
              address: account.address
            });
            return balance.toString(16); // Convert to hex string
          } catch (error) {
            console.error('Balance fetch error:', error);
            throw error;
          }

        case 'eth_sendTransaction':
          try {
            const [txParams] = params;
            const { to, value, data } = txParams;

            // Prepare transaction calls based on the type of transaction
            let calls;
            if (data) {
              // For token transfers or contract interactions
              calls = [{
                to,
                data,
                value: value ? BigInt(value) : BigInt(0)
              }];
            } else {
              // For native token transfers
              calls = [{
                to,
                value: value ? BigInt(value) : BigInt(0)
              }];
            }

            const txHash = await smartAccountClient.sendTransaction({
              calls,
              // paymasterContext: {
              //   token: to // Use the target address as token for paymaster context
              // }
            });

            console.log('Transaction hash:', txHash);
            return txHash;
          } catch (error) {
            console.error('Transaction error:', error);
            throw error;
          }

        case 'eth_estimateGas':
          // Add gas estimation logic if needed
          return '0x5208'; // Default to 21000 gas

        case 'eth_call':
          try {
            const [callParams] = params;
            const result = await publicClient.call(callParams);
            return result.data;
          } catch (error) {
            console.error('Contract call error:', error);
            throw error;
          }

        default:
          console.warn(`Method ${method} not implemented`);
          throw new Error(`Method ${method} not supported`);
      }
    },
    on: (eventName: string, handler: (params: any) => void) => {
      // Implement basic event handling
      console.log('Event subscription:', eventName);
    },
    removeListener: (eventName: string, handler: (params: any) => void) => {
      // Implement event removal
      console.log('Event unsubscription:', eventName);
    }
  });
}
export const getAccounts = async (credentials: any) => {
  try {
    return await toKernelSmartAccount({
      client: publicClient,
      version: "0.3.1",
      owners: [toWebAuthnAccount({ credential: credentials })],
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    }).then(async (account: ToKernelSmartAccountReturnType<"0.7">) => {
      console.log("account-->", account)
      let smartAccountClient = createSmartAccountClient({
        account,
        paymaster: pimlicoClient,
        chain: polygonAmoy,
        userOperation: {
          estimateFeesPerGas: async () =>
            (await pimlicoClient.getUserOperationGasPrice())
              .fast
        },
        bundlerTransport: http(pimlicoUrl)
      })
      // Create a provider adapter
      const cowSwapProvider = await createProviderCowSwap(account, smartAccountClient)

      return { account, smartAccountClient, cowSwapProvider }
    })
  } catch (error) {
    console.log("wallet get --->", error);
    return false
  }
}

const encryptToBytes = async (messageString: any) => {
  const encryptorSigner = new ethers.Wallet(ENCRYPTOR_PRIVATE_KEY);
  const provider = new ethers.providers.JsonRpcProvider(rpcProviderUrl);
  console.log(
    "Encryptor signer's address:",
    encryptorSigner,
    await encryptorSigner.getAddress(),
  );

  const message = toBytes(messageString);
  console.log('Encrypting message ("%s") ...', messageString);

  const hasPositiveBalance = new conditions.base.rpc.RpcCondition({
    chain: 80002,
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: 0,
    },
  });
  console.assert(
    hasPositiveBalance.requiresAuthentication(),
    'Condition requires authentication',
  );

  const messageKit = await encrypt(
    provider,
    "tapir",
    message,
    hasPositiveBalance,
    6,
    encryptorSigner,
  );

  return messageKit.toBytes();
};





const decryptFromBytes = async (encryptedBytes: any) => {
  const consumerSigner = new ethers.Wallet(CONSUMER_PRIVATE_KEY);
  const provider = new ethers.providers.JsonRpcProvider(rpcProviderUrl);
  console.log(
    "\nConsumer signer's address:",
    await consumerSigner.getAddress(),
  );

  const messageKit = ThresholdMessageKit.fromBytes(encryptedBytes);
  console.log('Decrypting message ...');
  const siweParams = {
    domain: 'localhost',
    uri: 'http://localhost:3000',
  };
  const conditionContext =
    conditions.context.ConditionContext.fromMessageKit(messageKit);

  // illustrative optional example of checking what context parameters are required
  // unnecessary if you already know what the condition contains
  if (
    conditionContext.requestedContextParameters.has(USER_ADDRESS_PARAM_DEFAULT)
  ) {
    const authProvider = new EIP4361AuthProvider(
      provider,
      consumerSigner,
      siweParams,
    );
    conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);
  }
  return decrypt(provider, "tapir", messageKit, conditionContext);
};


export const createAccount = async (credentials: any) => {
  try {
    return await toKernelSmartAccount({
      client: publicClient,
      version: "0.3.1",
      owners: [toWebAuthnAccount({ credential: credentials })],
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    }).then(async (account: ToKernelSmartAccountReturnType<"0.7">) => {
      console.log("account-->", account)
      try {
        let smartAccountClient = createSmartAccountClient({
          account,
          paymaster: pimlicoClient,
          chain: polygonAmoy,
          userOperation: {
            estimateFeesPerGas: async () =>
              (await pimlicoClient.getUserOperationGasPrice())
                .fast
          },
          bundlerTransport: http(pimlicoUrl)
        })
        const txHash = await smartAccountClient.sendTransaction({
          to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
          value: BigInt(0),
          data: "0x1234",
        })

        if (txHash) {
          console.log(`User operation included: https://polygonAmoy.etherscan.io/tx/${txHash}`)
          // Create a provider adapter
          // Create a provider adapter
          const cowSwapProvider = await createProviderCowSwap(account, smartAccountClient)

          return { account, smartAccountClient, cowSwapProvider }
        } else {
          return false
        }
      } catch (error) {
        console.log("wallet get --->", error);
        return false
      }
    })
  } catch (error) {
    console.log("wallet get --->", error);
    return false
  }
}


const registerPasskey = async (name: any) => {
  try {
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: name,
      passkeyServerUrl: passkeyServerUrl,
      mode: WebAuthnMode.Register,
      passkeyServerHeaders: {}
    })
    const passkeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint: getEntryPoint("0.7"),
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
    })
    console.log("passkeyValidator-->", passkeyValidator)
    console.log("webAuthnKey-->", webAuthnKey)
    return {
      webAuthnKey, passkeyValidator
    }
  } catch (error) {
    console.log("error--->", error)
  }
}

const getPasskey = async (name: any) => {
  try {
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: name,
      passkeyServerUrl: passkeyServerUrl,
      mode: WebAuthnMode.Login,
      passkeyServerHeaders: {}
    })
    const passkeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint: getEntryPoint("0.7"),
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
    })
    console.log("passkeyValidator-->", passkeyValidator)
    console.log("webAuthnKey-->", webAuthnKey)
    return {
      webAuthnKey, passkeyValidator
    }
  } catch (error) {
    console.log("error--->", error)
  }
}

const createNewKernelAccount = async (validator: any) => {
  try {
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: validator,
      },
      entryPoint,
      kernelVersion: KERNEL_V3_1
    })
    console.log("kernel Account-->", account);
    const kernelClient = await createKernelAccountClient({
      account,

      // Replace with your chain
      chain: sepolia,

      // Replace with your bundler RPC.
      // For ZeroDev, you can find the RPC on your dashboard.
      bundlerTransport: http(BUNDLER_RPC),

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
    console.log("kernel Client-->", kernelClient);
    const txHash = await kernelClient.sendTransaction({
      calls: [
        {
          to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
          value: BigInt(0),
          data: "0x1234",
        },
      ],
    })
    console.log("txHash-->", txHash)
    console.log("https://polygonAmoy.etherscan.io/")

    return { account, kernelClient }
  } catch (error) {
    console.log(" create kernel account error-->", error)
  }
}



const createMultiSignerKernelAccount = async (signer: any) => {
  try {

    let signerObj = signer.map((item:any) => (item.address))

    const multisigValidator = await createWeightedECDSAValidator(publicClient, {
      entryPoint,
      kernelVersion,
      config: {
        threshold: 100,
        signers: [
          { address: signerA.address, weight: 100 },
          { address: signerB.address, weight: 50 },
          { address: signerC.address, weight: 50 },
        ]
      },
      signers: [signerB, signerC],
    })

    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: validator,
      },
      entryPoint,
      kernelVersion: KERNEL_V3_1
    })
    console.log("kernel Account-->", account);
    const kernelClient = await createKernelAccountClient({
      account,

      // Replace with your chain
      chain: sepolia,

      // Replace with your bundler RPC.
      // For ZeroDev, you can find the RPC on your dashboard.
      bundlerTransport: http(BUNDLER_RPC),

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
    console.log("kernel Client-->", kernelClient);
    const txHash = await kernelClient.sendTransaction({
      calls: [
        {
          to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
          value: BigInt(0),
          data: "0x1234",
        },
      ],
    })
    console.log("txHash-->", txHash)
    console.log("https://polygonAmoy.etherscan.io/")

    return { account, kernelClient }
  } catch (error) {
    console.log(" create kernel account error-->", error)
  }
}



export const getSmartAccount = async () => {
  try {
    let key = "0x651f447c494eecedf2c7ddadbf78358c305cb23c2a35d38111543783b7c7d1b2" as `0x${string}`;
    let nh = privateKeyToAccount(key);
    const safeAccount = await toSafeSmartAccount({
      client: publicClient,
      owners: [nh],
      version: "1.4.1",
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
      safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
      erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
      attesters: [
        RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
        MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
      ],
      attestersThreshold: 1,
    });
    console.log("safeAccount-->craete", safeAccount)
    const _smartAccountClient = await createSmartAccountClient({
      account: safeAccount,
      paymaster: pimlicoClient,
      chain: sepolia,
      userOperation: {
        estimateFeesPerGas: async () =>
          (await pimlicoClient.getUserOperationGasPrice()).fast,
      },
      bundlerTransport: http(pimlicoAmoyUrl),
    }).extend(erc7579Actions());
    // Step 2: Create an EIP-1193 provider
    // console.log("provider-->",provider)
    return { safeAccount, _smartAccountClient };
  } catch (error) {
    console.log("error-->", error)
  }
}

const createSmartAccount = async (account: any) => {
  try {
    const safeAccount = await toSafeSmartAccount({
      client: publicClient,
      owners: [account],
      version: "1.4.1",
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
      safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
      erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
      attesters: [
        RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
        MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
      ],
      attestersThreshold: 1,
    });
    console.log("safeAccount-->craete", safeAccount)
    const _smartAccountClient = await createSmartAccountClient({
      account: safeAccount,
      paymaster: pimlicoClient,
      chain: sepolia,
      userOperation: {
        estimateFeesPerGas: async () =>
          (await pimlicoClient.getUserOperationGasPrice()).fast,
      },
      bundlerTransport: http(pimlicoAmoyUrl),
    }).extend(erc7579Actions());

    const txHash = await _smartAccountClient.sendTransaction({
      to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      value: BigInt(0),
      data: "0x1234",
    })
    console.log("smart account tx txHash-->", txHash)
  } catch (error) {
    console.log("create amrt account-->", error)
  }
}

export const createSafeAccount = async (name: any) => {
  try {
   await multiFac();
    const passkeyCred = await registerPasskey(name);
    console.log("passkeyCred --->", passkeyCred);
    const newKernelAccount = await createNewKernelAccount(passkeyCred?.passkeyValidator)
    console.log("newKernelAccount-->", newKernelAccount?.kernelClient?.account)
    // Initialize the KernelEIP1193Provider with your KernelClient
    if (newKernelAccount) {


      const kernelProvider = new KernelEIP1193Provider(newKernelAccount?.kernelClient);
      console.log("kernelProvider-->", kernelProvider)
      // Use the KernelProvider with ethers
      const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);
      console.log("ethersProvider-->", ethersProvider)
      const signer = await ethersProvider.getSigner();
      console.log("etherssigner-->", signer, signer.getAddress())



      // We have to initialize the TACo library first
      await initialize();
      // console.log("newKernelAccount?.account?.address--->", newKernelAccount?.account?.address)
      // Define decryption condition

      const message = "my secret message";
      const key = ethers.Wallet.createRandom().privateKey;
      console.log("key-->", key)

      const encryptedBytes = await encryptToBytes(key);
      console.log('Ciphertext: ', toHexString(encryptedBytes));

      const decryptedBytes = await decryptFromBytes(encryptedBytes);
      const decryptedMessageString = fromBytes(decryptedBytes);
      if (decryptedMessageString) {
        let key = decryptedMessageString as `0x${string}`;
        console.log('Decrypted message:', decryptedMessageString);
        let nh = privateKeyToAccount(key);
        console.log("nh-->", nh)
        await createSmartAccount(nh)
      }
    }
  } catch (error) {
    console.log("error---->", error)
  }
}


const multiFac = async () => {
  try {
    const authorized = await isAuthorized({ projectId: 'ce53eff2-87bf-43ab-ab0a-513efb3e2421' });
    console.log("authorized-->", authorized); // true or false
  
    // Await the initiateLogin process
    await initiateLogin({
      socialProvider: "google",
     
      projectId: "ce53eff2-87bf-43ab-ab0a-513efb3e2421"
    });
  
    // Only proceed to getSocialValidator after login completes successfully
    const socialValidator = await getSocialValidator(
      publicClientSepolia,
      {
        entryPoint: getEntryPoint("0.7"),
        kernelVersion: KERNEL_V3_1,
        projectId: "ce53eff2-87bf-43ab-ab0a-513efb3e2421"
      }
    );
  console.log("socialValidator-->",socialValidator)
  } catch (error) {
    console.error("Error during login or validation:", error);
  }
  
}

const multSign = async () =>{
  try {
    const passkeyCred = await registerPasskey("test");
    console.log("passkeyCred --->", passkeyCred);
    // const newKernelAccount = await createMultiSignerKernelAccount(passkeyCred?.passkeyValidator)
  } catch (error) {
    console.log("error multi sign -->", error)
  }
}
multSign()