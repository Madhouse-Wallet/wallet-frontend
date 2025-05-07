import { CowSwapWidget } from "@cowprotocol/widget-react";
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
  chainId: Number(process.env.NEXT_PUBLIC_MAINNET_CHAIN),
  tradeType: "swap",
  // tokenLists: [],
  tokenLists: [process.env.NEXT_PUBLIC_COWSWAP_CUSTOM_TOKEN_LIST_URI],
  sell: {
    // Sell token. Optionally add amount for sell orders
    asset: process.env.NEXT_PUBLIC_TBTC_CONTRACT_ADDRESS,
    amount: "1",
  },
  buy: {
    // Buy token. Optionally add amount for buy orders
    asset: "USDC",
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
      chainId: Number(process.env.NEXT_PUBLIC_MAINNET_CHAIN),
      address: process.env.NEXT_PUBLIC_TBTC_CONTRACT_ADDRESS,
      name: "Bitcoin",
      decimals: 18,
      symbol: "BTC",
      logoURI: "https://media.madhousewallet.com/btc.svg",
    },
  ],
};

const Swap = () => {
  const userAuth = useSelector((state: any) => state.Auth);
  const [provider, setProvider] = useState<any | undefined>();
  // Go back handler

  const createProvider = async () => {
    if (userAuth?.passkeyCred) {
      let account = false;
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
      if (userAuth?.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          if (provider) {
            const wrappedProvider = new LegacyProviderWrapper(
              provider?.kernelProvider
            );

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
