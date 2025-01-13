import {
  toKernelSmartAccount,
  ToKernelSmartAccountReturnType
} from "permissionless/accounts";
import {
  type SmartAccountClient,
  createSmartAccountClient
} from "permissionless"
import { sepolia, baseSepolia } from "viem/chains";
import { Hex, createPublicClient, getContract, http, pad } from "viem";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
  entryPoint07Address,
  toWebAuthnAccount,
} from "viem/account-abstraction";
// tBTC SDK Initialization Function
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.drpc.org'),
});

const pimlicoUrl = `https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE`
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
export const getAccount = async (credentials: any) => {
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
