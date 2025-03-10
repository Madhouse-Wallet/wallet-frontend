import { CowSwapWidget } from "@cowprotocol/widget-react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { getAccount, getProvider } from "@/lib/zeroDevWallet";

class LegacyProviderWrapper {
  private provider: any;
  private eventListeners: Record<string, ((...args: any[]) => void)[]> = {};

  constructor(provider: any) {
    this.provider = provider;
  }

  async enable(): Promise<string[]> {
    return this.provider.request({ method: "eth_requestAccounts" });
  }

  request(args: any): Promise<any> {
    return this.provider.request(args);
  }

  sendAsync(payload: any, callback: (error: any, response: any) => void): void {
    this.provider
      .request(payload)
      .then((result: any) =>
        callback(null, { jsonrpc: "2.0", id: payload.id, result })
      )
      .catch((error: any) => callback(error, null));
  }

  send(payload: any, callback: (error: any, response: any) => void): void {
    this.sendAsync(payload, callback);
  }

  // ✅ Add event listeners support
  on(event: string, listener: (...args: any[]) => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);

    // Forward event to the underlying provider if it supports `on`
    if (this.provider.on) {
      this.provider.on(event, listener);
    }
  }

  removeListener(event: string, listener: (...args: any[]) => void) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (l) => l !== listener
      );
    }

    if (this.provider.removeListener) {
      this.provider.removeListener(event, listener);
    }
  }
}

// Parameters for CowSwapWidget
const cowSwapParams = {
  appCode: "Madhouse Wallet",
  width: "100%",
  height: "640px",
  chainId: process.env.NEXT_PUBLIC_MAINNET_CHAIN,
  tradeType: "swap",
  // tokenLists: [],
  tokenLists: [
    process.env.NEXT_PUBLIC_COWSWAP_CUSTOM_TOKEN_LIST_URI,
  ],
  sell: {
    // Sell token. Optionally add amount for sell orders
    asset: "USDC",
    amount: "100",
  },
  buy: {
    // Buy token. Optionally add amount for buy orders
    asset: process.env.NEXT_PUBLIC_TBTC_CONTRACT_ADDRESS,
    amount: "0",
  },
  partnerFee: {
    // Partner fee, in Basis Points (BPS) and a receiver address
    bps: 1,
    recipient: {
      "1": "0xB64963f95215FDe6510657e719bd832BB8bb941B",
      "100": "0x6b3214fd11dc91de14718dee98ef59bcbfcfb432",
      "8453": "0x3c4DBcCf8d80D3d92B0d82197aebf52574ED1F3B",
      "42161": "0x451100Ffc88884bde4ce87adC8bB6c7Df7fACccd",
      "11155111": "0xB64963f95215FDe6510657e719bd832BB8bb941B",
    },
  },
  enabledTradeTypes: ["swap"],
  theme: {
    // light/dark or provide your own color palette
    baseTheme: "dark",
    primary: "#df723b",
    paper: "#2c1913",
    text: "#fff",
  },
  standaloneMode: false,
  disableToastMessages: false,
  disableProgressBar: false,
  hideBridgeInfo: false,
  hideOrdersTable: false,
  images: {},
  sounds: {},
  customTokens: [
    {
      chainId: process.env.NEXT_PUBLIC_MAINNET_CHAIN,
      address: process.env.NEXT_PUBLIC_TBTC_CONTRACT_ADDRESS,
      name: "Bitcoin",
      decimals: 18,
      symbol: "BTC",
      logoURI: "https://media.madhousewallet.com/btc.svg",
    },
  ],
};

const Swap = () => {
  const router = useRouter();
  const userAuth = useSelector((state: any) => state.Auth);
  const [provider, setProvider] = useState<any | undefined>();
  // Go back handler
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigate to the previous page
    } else {
      router.push("/"); // Fallback to the homepage
    }
  };

  const createProvider = async () => {
    if (userAuth?.passkeyCred) {
      console.log("line-137")
      let account = false;
      console.log("account---<", account);
      if (account) {
        // setProvider(account?.cowSwapProvider)
      }
    }
  };
  useEffect(() => {
    createProvider();
  }, []);

  useEffect(() => {
    const connectWallet = async () => {
      console.log("line-150 userAuth",)
      if (userAuth?.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        console.log("account---<", account);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          console.log("provider-->Swap", provider);
          if (provider) {
            console.log("provider-Swap-line-157", provider);
            const wrappedProvider = new LegacyProviderWrapper(
              provider?.kernelProvider
            );
            console.log("wrappedProvider -line-161", wrappedProvider);

            setProvider(wrappedProvider);
          }
        }
      }
      // else {
      //   toast.error("Please Login");
      //   return;
      // }
    };

    connectWallet();
  }, []);

  console.log("provider", provider);

  return (
    <>
      <section className="coswap py-3 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <CowSwapCard>
                <CowSwapWidget
                  params={cowSwapParams}
                  provider={provider} // Use the adapted provider
                />
              </CowSwapCard>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
const CowSwapCard = styled.div`
  > div {
    display: flex;
    justify-content: center;
  }
  iframe {
    max-width: 450px;
    border-radius: 25px;
  }
`;
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
function useSelecto(arg0: (state: any) => any) {
  throw new Error("Function not implemented.");
}
