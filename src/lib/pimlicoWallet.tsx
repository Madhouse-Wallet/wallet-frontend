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
import { sepolia, baseSepolia } from "viem/chains";
import { parsePublicKey, parseSignature, sign } from "webauthn-p256";
import { Hex, createPublicClient, encodePacked, getContract, http, pad } from "viem";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { getNonce } from "@/components/NonceManager";
import {
  toSafeSmartAccount,
  ToSafeSmartAccountReturnType,
} from "permissionless/accounts";
import { erc7579Actions } from "permissionless/actions/erc7579";
import {  privateKeyToAccount } from "viem/accounts";
import {
  entryPoint07Address,
  toWebAuthnAccount,
} from "viem/account-abstraction";
// tBTC SDK Initialization Function
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.drpc.org'),
});
import {
  getMultiFactorValidator,
} from '@rhinestone/module-sdk'
import { ethers } from "ethers";
import { initialize, encrypt, domains,conditions, decrypt } from '@nucypher/taco';
import { EIP4361AuthProvider,USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
const appId = "webauthn";
const pimlicoUrl = `https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`

const pimlicoSepoliaUrl = `https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`;
const pimlicoClient = createPimlicoClient({
  chain: sepolia,
  transport: http(pimlicoUrl)
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
          return `0x${sepolia.id.toString(16)}`;

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
        chain: sepolia,
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
          chain: sepolia,
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
          console.log(`User operation included: https://sepolia.etherscan.io/tx/${txHash}`)
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
//           chain: sepolia,
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
//           console.log(`User operation included: https://sepolia.etherscan.io/tx/${txHash}`)
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
//       chain: sepolia,
//       userOperation: {
//         estimateFeesPerGas: async () =>
//           (await pimlicoClient.getUserOperationGasPrice()).fast,
//       },
//       bundlerTransport: http(pimlicoSepoliaUrl),
//     }).extend(erc7579Actions());


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




export const createSafeAccount = async (credential: any) => {
  try {
    //if an account does not exist, create a private key
    const PRIVATE_KEY = ethers.Wallet.createRandom().privateKey

    const KERNEL_PRIVATE_KEY = ethers.Wallet.createRandom().privateKey

     const publicClient = createPublicClient({
      chain: sepolia,
      transport: http("https://rpc.ankr.com/eth_sepolia"),
    })

     const paymasterClient = createPimlicoClient({
      transport: http(`https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    })

    const kernel_account = await toKernelSmartAccount({
      client: publicClient,
      version: "0.3.1",
      owners: [toWebAuthnAccount({ credential })],
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7"
      }
    })


    const client = createSmartAccountClient({
      account: kernel_account,
      chain: sepolia,
      bundlerTransport: http("https://rpc.ankr.com/eth_sepolia"),
      paymaster: paymasterClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await paymasterClient.getUserOperationGasPrice()).fast
        },
      },
    }).extend(erc7579Actions())

    const wallet = new ethers.Wallet(KERNEL_PRIVATE_KEY, ethers.getDefaultProvider()) //need to update this with the private key of the kernel wallet

    // We have to initialize the TACo library first
    await initialize();

    const ownerAddress = new conditions.base.rpc.RpcCondition({
      method: 'eth_getBalance',
      parameters: [kernel_account.address], // 
      chain: 1,
      returnValueTest: {
        comparator: '>=',
        value: 0,
      },
    });


    const message = PRIVATE_KEY
    const ritualId = 0

    // encrypt data
    const messageKit = await encrypt(
      wallet.provider,
      domains.TESTNET,
      message,
      ownerAddress,
      ritualId,
      wallet
    );

    const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);

    // auth provider when condition contains ":userAddress" context variable
    // the decryptor user must provide a signature to prove ownership of their wallet address
    const authProvider = new EIP4361AuthProvider(
      wallet.provider,
      wallet,
    );
    conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);

    const safeAccount = await toSafeSmartAccount({
      client: publicClient,
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
      owners: [privateKeyToAccount(`0x${await decrypt(
        wallet.provider,
        domains.TESTNET,
        messageKit,
        conditionContext,
      )}`)


      ],
      saltNonce: 0n, // optional
      version: "1.4.1",
      address: "0x...", // optional, only if you are using an already created account
    })

    const pimlicoClient = createPimlicoClient({
      transport: http("https://rpc.ankr.com/eth_sepolia"),
      entryPoint: {
        address: entryPoint07Address,
        version: '0.7',
      },
    })

    const smartAccountClient = createSmartAccountClient({
      account: safeAccount,
      chain: sepolia,
      bundlerTransport: http("https://rpc.ankr.com/eth_sepolia"),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast
        },
      },
    }).extend(erc7579Actions())


    const multiFactorValidator = getMultiFactorValidator({
      threshold: 2,
      validators: [
        {
          packedValidatorAndId: encodePacked(
            ['bytes12', 'address'],
            [
              '0x000000000000000000000000',
              kernel_account.address,
            ],
          ),
          data: '0x123...',
        },
      ],
    })

    const opHash = await smartAccountClient.installModule(multiFactorValidator)

    await pimlicoClient.waitForUserOperationReceipt({
      hash: opHash,
    })
  } catch (error) {
    console.log("wallet get --->", error);
    return false
  }
}
