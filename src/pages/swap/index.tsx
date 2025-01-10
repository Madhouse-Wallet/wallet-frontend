import { PermissionlessProvider } from "@permissionless/wagmi";
import { CowSwapWidget } from "@cowprotocol/widget-react";
import { useRouter } from "next/router";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { useEffect, useState } from "react";
import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import {
  toKernelSmartAccount,
  ToKernelSmartAccountReturnType,
} from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { Chain, createPublicClient, parseAbi, Transport } from "viem";
import {
  entryPoint07Address,
  EntryPointVersion,
  toWebAuthnAccount,
} from "viem/account-abstraction";

// Configuration for wagmi
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// QueryClient setup
const queryClient = new QueryClient();

// API key and capabilities for PermissionlessProvider
const apiKey = "pim_gCvmGFU2NgG2xZcmjKVNsE";
const capabilities = {
  paymasterService: {
    [sepolia.id]: {
      url: `https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=${apiKey}`,
    },
  },
};

// Parameters for CowSwapWidget
const cowSwapParams = {
  appCode: "My Cool App",
  width: "100%",
  height: "640px",
  chainId: 11155111,
  tokenLists: [
    "https://files.cow.fi/tokens/CoinGecko.json",
    "https://files.cow.fi/tokens/CowSwap.json",
  ],
  tradeType: "swap",
  sell: {
    asset: "WBTC",
    amount: "100000",
  },
  buy: {
    asset: "USDC",
    amount: "0",
  },
  enabledTradeTypes: ["swap", "limit", "advanced", "yield"],
  theme: "dark",
  standaloneMode: false,
  disableToastMessages: false,
  disableProgressBar: false,
  hideBridgeInfo: false,
  hideOrdersTable: false,
};

interface EthereumProvider {
  enable: () => Promise<string[]>;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (params: any) => void) => void;
  removeListener: (eventName: string, handler: (params: any) => void) => void;
}

const Swap = () => {
  const [provider, setProvider] = useState<EthereumProvider | undefined>(undefined);
  const router = useRouter();
  const [smartAccountClient, setSmartAccountClient] =
    useState<
      SmartAccountClient<
        Transport,
        Chain,
        ToKernelSmartAccountReturnType<"0.7">
      >
    >();
    const [account, setAccount] = useState<ToKernelSmartAccountReturnType<"0.7"> | undefined>(undefined);

  // Go back handler
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigate to the previous page
    } else {
      router.push("/"); // Fallback to the homepage
    }
  };

  useEffect(() => {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http("https://sepolia.drpc.org"),
    });

    const apiKey = "pim_gCvmGFU2NgG2xZcmjKVNsE";
    const pimlicoUrl = `https://api.pimlico.io/v2/${sepolia.id}/rpc?apikey=${apiKey}`;

    const pimlicoClient = createPimlicoClient({
      chain: sepolia,
      transport: http(pimlicoUrl),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7" as EntryPointVersion,
      },
    });
    const passkeyCredential = {
      "id": "3EGf7mlW7Oum5JDnVAu76g",
      "publicKey": "0x0ae94b7d2ea6555297d68b2ae6fd080f304afebac6f08448c9b71184a3747c57141a3c2b10ec32d281ae61b51c5373d2445d6455a2ef2710e6a7c1c4c2a6572d",
      "raw": {
          "authenticatorAttachment": "platform",
          "clientExtensionResults": {},
          "id": "3EGf7mlW7Oum5JDnVAu76g",
          "rawId": "3EGf7mlW7Oum5JDnVAu76g",
          "response": {
              "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViUSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAENxBn-5pVuzrpuSQ51QLu-qlAQIDJiABIVggCulLfS6mVVKX1osq5v0IDzBK_rrG8IRIybcRhKN0fFciWCAUGjwrEOwy0oGuYbUcU3PSRF1kVaLvJxDmp8HEwqZXLQ",
              "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAENxBn-5pVuzrpuSQ51QLu-qlAQIDJiABIVggCulLfS6mVVKX1osq5v0IDzBK_rrG8IRIybcRhKN0fFciWCAUGjwrEOwy0oGuYbUcU3PSRF1kVaLvJxDmp8HEwqZXLQ",
              "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiYWF1MHRhRGVTOFlxS2lBZmpTVzY2USIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImNyb3NzT3JpZ2luIjpmYWxzZX0",
              "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAECulLfS6mVVKX1osq5v0IDzBK_rrG8IRIybcRhKN0fFcUGjwrEOwy0oGuYbUcU3PSRF1kVaLvJxDmp8HEwqZXLQ",
              "publicKeyAlgorithm": -7,
              "transports": [
                  "hybrid",
                  "internal"
              ]
          },
          "type": "public-key"
      }
  }

    console.log("passkeyCredential-->", passkeyCredential);
    console.log("line-298", "fu");
    if (!passkeyCredential) {
      throw Error("Passkey creation failed: No credential was returned.");
    }
    console.log(
      "passkeyCredential-->",
      passkeyCredential,
      passkeyCredential.id
    );
    try {
      toKernelSmartAccount({
        client: publicClient,
        version: "0.3.1",
        owners: [toWebAuthnAccount({ credential: passkeyCredential })],
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      }).then(async (account: ToKernelSmartAccountReturnType<"0.7">) => {
        const smartAccountClient = createSmartAccountClient({
          account,
          paymaster: pimlicoClient,
          chain: sepolia,
          userOperation: {
            estimateFeesPerGas: async () =>
              (await pimlicoClient.getUserOperationGasPrice()).fast,
          },
          bundlerTransport: http(pimlicoUrl),
        });

        // Create a provider adapter
        const providerAdapter: EthereumProvider = {
          enable: async () => {
            return [account.address];
          },
          request: async ({ method, params }) => {
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
                    paymasterContext: {
                      token: to // Use the target address as token for paymaster context
                    }
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
        };

        setSmartAccountClient(smartAccountClient);
        setAccount(account);
        setProvider(providerAdapter);
      });
    } catch (error) {
      console.log("error:", error);
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      {/* <CowSwapWidget client={queryClient}   params={cowSwapParams}> */}
      <QueryClientProvider client={queryClient}>
        <PermissionlessProvider capabilities={capabilities}>
          <>
          <section className="coswap py-3 relative">
            <div className="container">
              <div className="grid gap-3 grid-cols-12">
                <div className="col-span-12">
                  <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <button
                        onClick={handleGoBack}
                        className="border-0 themeClr p-0"
                      >
                        {backIcn}
                      </button>
                      <h4 className="m-0 text-2xl font-bold">Cowswap</h4>
                    </div>
                  </div>
                </div>
                <div className="col-span-12">
                <CowSwapWidget
                params={cowSwapParams}
                provider={provider} // Use the adapted provider
              />
                  {/* <CowSwapWidget client={queryClient} params={cowSwapParams} /> */}
                </div>
              </div>
            </div>
          </section>
          </>
        </PermissionlessProvider>
        {/* </CowSwapWidget> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Swap;

// Back button icon
const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
