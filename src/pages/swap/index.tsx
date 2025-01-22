
import { CowSwapWidget } from "@cowprotocol/widget-react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getAccounts, getSmartAccount } from "../../lib/pimlicoWallet";
import { createProviderCowSwap } from "../../lib/customProvider";
import { useEffect, useState } from "react";
import styled from "styled-components";
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
    asset: "USDC",
    amount: "100000",
  },
  buy: {
    asset: "COW",
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
   let prov = await getSmartAccount();
   console.log("prov--->",prov)
   let newProv = await createProviderCowSwap(prov?.safeAccount,prov?._smartAccountClient )
   console.log("newProv-->",newProv )
   setProvider(newProv)
    // if (userAuth?.passkeyCred) {
    //   let account = await getAccounts(userAuth?.passkeyCred)
    //   console.log("account---<",account)
    //   if(account){
    //     setProvider(account?.cowSwapProvider)
    //   }
    // }

  }
  useEffect(() => {
    createProvider()
  }, [])

  return (
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
`
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

