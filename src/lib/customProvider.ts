import { sepolia, baseSepolia, polygonAmoy } from "viem/chains";
import { Hex, createPublicClient, encodePacked, getContract, http, pad } from "viem";
const publicClient   = createPublicClient({
    chain: sepolia,
    transport: http('https://sepolia.drpc.org'),
  });
export const createProviderCowSwap = async (account: any, smartAccountClient: any) => {
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