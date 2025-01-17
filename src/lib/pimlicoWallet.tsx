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


// tBTC SDK Initialization Function
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http('https://rpc-amoy.polygon.technology'),
});
import {
  getMultiFactorValidator,
} from '@rhinestone/module-sdk'
import { ethers } from "ethers";
import { initialize, encrypt, domains, conditions, decrypt } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';

const appId = "webauthn";
const pimlicoUrl = `https://api.pimlico.io/v2/${polygonAmoy.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`

const pimlicoSepoliaUrl = `https://api.pimlico.io/v2/${polygonAmoy.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`;
const pimlicoClient = createPimlicoClient({
  chain: polygonAmoy,
  transport: http(pimlicoUrl)
})



// zero Dev
const passkeyServerUrl = 'https://passkeys.zerodev.app/api/v3/459dfa57-b4fc-46e4-8e57-df544ead38f9';
const entryPoint = getEntryPoint("0.7")
const PROJECT_ID = 'ce53eff2-87bf-43ab-ab0a-513efb3e2421';
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;
const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`;
const paymasterClient = createZeroDevPaymasterClient({
  chain: polygonAmoy,
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
      chain: polygonAmoy,

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
    // const receipt = txHash.wait();
    console.log("txHash-->", txHash)
    console.log("https://polygonAmoy.etherscan.io/")

    return { account, kernelClient }
  } catch (error) {
    console.log(" create kernel account error-->", error)
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
      chain: polygonAmoy,
      userOperation: {
        estimateFeesPerGas: async () =>
          (await pimlicoClient.getUserOperationGasPrice()).fast,
      },
      bundlerTransport: http(pimlicoSepoliaUrl),
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
    const passkeyCred = await registerPasskey(name);
    console.log("passkeyCred --->", passkeyCred);
    const newKernelAccount = await createNewKernelAccount(passkeyCred?.passkeyValidator)
    console.log("newKernelAccount-->", newKernelAccount?.kernelClient?.account)
    // Initialize the KernelEIP1193Provider with your KernelClient
    const kernelProvider = new KernelEIP1193Provider(newKernelAccount?.kernelClient);
    console.log("kernelProvider-->", kernelProvider)
    // Use the KernelProvider with ethers
    const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);
    console.log("ethersProvider-->", ethersProvider)
    const signer = await ethersProvider.getSigner();
    console.log("etherssigner-->", signer)



    // We have to initialize the TACo library first
    await initialize();
    console.log("newKernelAccount?.account?.address--->", newKernelAccount?.account?.address)
    // Define decryption condition
    const ownerAddress = new conditions.base.rpc.RpcCondition({
      chain: 80002,
      method: 'eth_getBalance',
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: '>',
        value: 0,
      },
    });

    console.log("ownerAddress-->", ownerAddress)
    const message = "my secret message";
    const ritualId = 6
const key =  ethers.Wallet.createRandom().privateKey;
console.log("key-->",key)
let nh = privateKeyToAccount(key);
console.log("nh-->",nh)
await createSmartAccount(nh)

    // encrypt data
    const messageKit = await encrypt(
      ethersProvider,
      domains.TESTNET,
      key,
      ownerAddress,
      ritualId,
      signer
    );

    console.log("messageKit--->", messageKit)


    const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);
    const authProvider = new EIP4361AuthProvider(
      ethersProvider,
      signer,
    );
    console.log("authProvider-->", authProvider)
    conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);
    let dec = await decrypt(
      ethersProvider,
      domains.TESTNET,
      messageKit,
      conditionContext,
    )
    console.log("dec-->", dec)
    let pv = await privateKeyToAccount(`0x${dec}`);
    console.log("pv-->", pv)
    // const getpasskeyCred = await getPasskey(name);
    // console.log("passkeyCred --->", getpasskeyCred);

  } catch (error) {
    console.log("error---->", error)
  }
}


// export const createSafeAccount = async (credentials: any) => {
//   try {
//     //pimlicoClient


//     let kernelAccount = await toKernelSmartAccount({
//       client: publicClient,
//       version: "0.3.1",
//       owners: [toWebAuthnAccount({ credential: credentials })],
//       entryPoint: {
//         address: entryPoint07Address,
//         version: "0.7",
//       },
//     }).then(async (account: ToKernelSmartAccountReturnType<"0.7">) => {
//       console.log("account-->", account)
//       try {
//         let smartAccountClient = createSmartAccountClient({
//           account,
//           paymaster: pimlicoClient,
//           chain: polygonAmoy,
//           userOperation: {
//             estimateFeesPerGas: async () =>
//               (await pimlicoClient.getUserOperationGasPrice())
//                 .fast
//           },
//           bundlerTransport: http(pimlicoUrl)
//         })
//         const txHash = await smartAccountClient.sendTransaction({
//           to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
//           value: BigInt(0),
//           data: "0x1234",
//         })

//         if (txHash) {
//           console.log(`User operation included: https://polygonAmoy.etherscan.io/tx/${txHash}`)
//           // Create a provider adapter
//           // Create a provider adapter
//           const cowSwapProvider = await createProviderCowSwap(account, smartAccountClient)

//           return { account, smartAccountClient, cowSwapProvider }
//         } else {
//           return false
//         }
//       } catch (error) {
//         console.log("wallet get --->", error);
//         return false
//       }
//     })
//     console.log("kernelAccount--->", kernelAccount, kernelAccount.account?.address)
//     // const safeAccount = await toSafeSmartAccount({
//     //   client: publicClient,
//     //   entryPoint: {
//     //     address: entryPoint07Address,
//     //     version: "0.7",
//     //   },
//     //   owners: [kernelAccount?.account],
//     //   version: "1.4.1",
//     // })
//     const owner = kernelAccount.account?.address;
//     console.log("owner-->",owner)
//     const ownableValidator = getOwnableValidator({
//       owners: [owner],
//       threshold: 1,
//     });
//     console.log("ownableValidator-->",ownableValidator)
//     const safeAccount = await toSafeSmartAccount({
//       // saltNonce: getNonce({
//       //   appId,
//       // }),
//       client: publicClient,
//       owners: [kernelAccount?.account],
//       version: "1.4.1",
//       entryPoint: {
//         address: entryPoint07Address,
//         version: "0.7",
//       },
//       safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
//       erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
//       attesters: [
//         RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
//         MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
//       ],
//       attestersThreshold: 1,
//       validators: [
//         {
//           address: ownableValidator.address,
//           context: ownableValidator.initData,
//         },
//       ],
//     });
// console.log("safeAccount-->craete",safeAccount)
//     const _smartAccountClient = await createSmartAccountClient({
//       account: safeAccount,
//       paymaster: pimlicoClient,
//       chain: polygonAmoy,
//       userOperation: {
//         estimateFeesPerGas: async () =>
//           (await pimlicoClient.getUserOperationGasPrice()).fast,
//       },
//       bundlerTransport: http(pimlicoSepoliaUrl),
//     }).extend(erc7579Actions());

//     const txHash = await _smartAccountClient.sendTransaction({
//       to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
//       value: BigInt(0),
//       data: "0x1234",
//     })
//     console.log("_smartAccountClient deployment txHash-->",txHash)
//     console.log("safeAccount-->", safeAccount, safeAccount.address)
//     console.log("_smartAccountClient-->", _smartAccountClient)
//     console.log("credentials-->", credentials)
//     const { x, y, prefix } = parsePublicKey(credentials.publicKey);
//     console.log("x, y, prefix ", x, y, prefix);
//     const validator = await getWebAuthnValidator({
//       pubKey: { x, y, prefix },
//       authenticatorId: credentials.id,
//     });
//     console.log("validator", validator)
//     const installOp = await _smartAccountClient.installModule(validator);
//     console.log("installOp-->", installOp)
//     const receipt = await _smartAccountClient.waitForUserOperationReceipt({
//       hash: installOp,
//     });
//     console.log("receipt", receipt);
//     let isValidatorInstalled = await _smartAccountClient.isModuleInstalled(validator)
//     console.log("isValidatorInstalled-->", isValidatorInstalled)
//   } catch (error) {
//     console.log("wallet get --->", error);
//     return false
//   }
// }




// export const createSafeAccount = async (credential: any) => {
//   try {
//     //if an account does not exist, create a private key
//     const PRIVATE_KEY = ethers.Wallet.createRandom().privateKey

//     const KERNEL_PRIVATE_KEY = ethers.Wallet.createRandom().privateKey

//      const publicClient = createPublicClient({
//       chain: polygonAmoy,
//       transport: http("https://rpc.ankr.com/eth_sepolia"),
//     })

//      const paymasterClient = createPimlicoClient({
//       transport: http(`https://api.pimlico.io/v2/${polygonAmoy.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`),
//       entryPoint: {
//         address: entryPoint07Address,
//         version: "0.7",
//       },
//     })

//     const kernel_account = await toKernelSmartAccount({
//       client: publicClient,
//       version: "0.3.1",
//       owners: [toWebAuthnAccount({ credential })],
//       entryPoint: {
//         address: entryPoint07Address,
//         version: "0.7"
//       }
//     })


//     const client = createSmartAccountClient({
//       account: kernel_account,
//       chain: polygonAmoy,
//       bundlerTransport: http("https://rpc.ankr.com/eth_sepolia"),
//       paymaster: paymasterClient,
//       userOperation: {
//         estimateFeesPerGas: async () => {
//           return (await paymasterClient.getUserOperationGasPrice()).fast
//         },
//       },
//     }).extend(erc7579Actions())

//     const wallet = new ethers.Wallet(KERNEL_PRIVATE_KEY, ethers.getDefaultProvider()) //need to update this with the private key of the kernel wallet

//     // We have to initialize the TACo library first
//     await initialize();

//     const ownerAddress = new conditions.base.rpc.RpcCondition({
//       method: 'eth_getBalance',
//       parameters: [kernel_account.address], // 
//       chain: 1,
//       returnValueTest: {
//         comparator: '>=',
//         value: 0,
//       },
//     });


//     const message = PRIVATE_KEY
//     const ritualId = 0

//     // encrypt data
//     const messageKit = await encrypt(
//       wallet.provider,
//       domains.TESTNET,
//       message,
//       ownerAddress,
//       ritualId,
//       wallet
//     );

//     const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);

//     // auth provider when condition contains ":userAddress" context variable
//     // the decryptor user must provide a signature to prove ownership of their wallet address
//     const authProvider = new EIP4361AuthProvider(
//       wallet.provider,
//       wallet,
//     );
//     conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);

//     const safeAccount = await toSafeSmartAccount({
//       client: publicClient,
//       entryPoint: {
//         address: entryPoint07Address,
//         version: "0.7",
//       },
//       owners: [privateKeyToAccount(`0x${await decrypt(
//         wallet.provider,
//         domains.TESTNET,
//         messageKit,
//         conditionContext,
//       )}`)


//       ],
//       saltNonce: 0n, // optional
//       version: "1.4.1",
//       address: "0x...", // optional, only if you are using an already created account
//     })

//     const pimlicoClient = createPimlicoClient({
//       transport: http("https://rpc.ankr.com/eth_sepolia"),
//       entryPoint: {
//         address: entryPoint07Address,
//         version: '0.7',
//       },
//     })

//     const smartAccountClient = createSmartAccountClient({
//       account: safeAccount,
//       chain: polygonAmoy,
//       bundlerTransport: http("https://rpc.ankr.com/eth_sepolia"),
//       paymaster: pimlicoClient,
//       userOperation: {
//         estimateFeesPerGas: async () => {
//           return (await pimlicoClient.getUserOperationGasPrice()).fast
//         },
//       },
//     }).extend(erc7579Actions())


//     const multiFactorValidator = getMultiFactorValidator({
//       threshold: 2,
//       validators: [
//         {
//           packedValidatorAndId: encodePacked(
//             ['bytes12', 'address'],
//             [
//               '0x000000000000000000000000',
//               kernel_account.address,
//             ],
//           ),
//           data: '0x123...',
//         },
//       ],
//     })

//     const opHash = await smartAccountClient.installModule(multiFactorValidator)

//     await pimlicoClient.waitForUserOperationReceipt({
//       hash: opHash,
//     })
//   } catch (error) {
//     console.log("wallet get --->", error);
//     return false
//   }
// }


