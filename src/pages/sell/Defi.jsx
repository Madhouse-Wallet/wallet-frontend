import React, { useEffect, useState } from "react";
import { getProvider, getAccount } from "../../lib/zeroDevWallet";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { SupportedChainId, OrderKind, TradeParameters, TradingSdk } from '@cowprotocol/cow-sdk'
import { EnsoClient } from "@ensofinance/sdk";
// import SwapWidget from '@ensofinance/shortcuts-widget';

// import { WagmiProvider, createConfig, http } from "wagmi"
// import { sepolia, arbitrum, mainnet } from "wagmi/chains"
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"


const ensoClient = new EnsoClient({
  apiKey: process.env.NEXT_PUBLIC_ENSO_API_KEY
});

// import { createKernelDefiClient } from "@zerodev/defi"
// import { baseTokenAddresses } from "@zerodev/defi"
// import { parseUnits } from "viem"
import { mainnet, sepolia, arbitrum } from "viem/chains";
// Replace this with your network
const chain = mainnet;
console.log("chain->", chain.id)
const Defi = () => {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const userAuth = useSelector((state) => state.Auth);
  const swap = async () => {
    try {
      setLoading(true);
      if (amount <= 0) {
        setLoading(false);
        return toast.error("Please Enter Valid Amount!");
      }
      if (userAuth?.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        let provider = await getProvider(account.kernelClient);
        console.log("account-->", provider, provider.signer);
//kernelProvider, ethersProvider, signer


        const quoteData = await ensoClient.getQuoteData({
          fromAddress: userAuth.walletAddress,
          chainId: 1,
          amountIn: "1000000",
          tokenIn: process.env.NEXT_PUBLIC_USDC1_CONTRACT_ADDRESS,
          tokenOut: process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS,
        });
        console.log("quoteData-->", quoteData)


        const approvalData = await ensoClient.getApprovalData({
          fromAddress: userAuth.walletAddress,
          tokenAddress: process.env.NEXT_PUBLIC_USDC1_CONTRACT_ADDRESS,
          chainId: 1,
          amount: "1000000",
        });
        console.log("approvalData--->", approvalData)

        const op1Hash = await account.kernelClient.sendUserOperation({
          callData: await account.kernelClient.account.encodeCalls([
            {
              to: approvalData.tx.to,
              value: BigInt(0),
              data: approvalData.tx.data,
            },
          ]),
        });

        console.log("Approval Transaction Hash:", op1Hash);
        const routeData = await ensoClient.getRouterData({
          fromAddress: userAuth.walletAddress,
          receiver: userAuth.walletAddress,
          spender: userAuth.walletAddress,
          chainId: 1,
          amountIn: "1000000",
          tokenIn: process.env.NEXT_PUBLIC_USDC1_CONTRACT_ADDRESS,
          tokenOut: process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS,
          routingStrategy: "router", // optional
        });
        console.log("routeData-->", routeData)
 

        const op2Hash = await account.kernelClient.sendUserOperation({
          callData: await account.kernelClient.account.encodeCalls([
            {
              to: routeData.tx.to, // The contract handling the swap
              value: BigInt(routeData.tx.value), // Amount of ETH to send if needed
              data: routeData.tx.data, // The actual swap transaction data
            },
          ]),
        });

        console.log("Swap Transaction Hash:", op2Hash);



        // // Initialize the SDK
        // const sdk = new TradingSdk({
        //   chainId: SupportedChainId.SEPOLIA,
        //   signer: provider.signer,
        //   appCode: 'trade-sdk-example'
        // })
        // console.log("sdk-->", sdk)
        // // Define trade parameters
        // const parameters = {
        //   kind: OrderKind.BUY,
        //   sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        //   sellTokenDecimals: 18,
        //   buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
        //   buyTokenDecimals: 18,
        //   amount: '120000000000000000'
        // }

        // // Post the order
        // const orderId = await sdk.postSwapOrder(parameters)

        // console.log('Order created, id: ', orderId)
      } else {
        toast.error("Please Login!");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("swap error-->", error);
      toast.error(error.message);
    }
  };



  return (
    <>
      <section className="swapkit py-5">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="mx-auto max-w-md">
                <div className="bg-black/50 rounded-20 p-3">
                  <div className="my-2">
                    <div className="bg-black/50 p-3 rounded-lg flex items-center justify-between">
                      <div className="left">
                        <p className="m-0 text-white opacity-50 text-xs">
                          You Pay
                        </p>
                        <input
                          style={{ height: 30 }}
                          onChange={(e) => setAmount(e.target.value)}
                          value={amount}
                          placeholder="0.00"
                          type="number"
                          className="form-control text-base h-auto outline-0 w-full border-0 p-0 bg-transparent"
                        />
                      </div>
                      <div className="right">
                        <div className="flex items-center gap-2">
                          {btc}{" "}
                          <span className="text-xs font-medium">BTC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="bg-black/50 p-3 rounded-lg flex items-center justify-between">
                      <div className="left">
                        <p className="m-0 text-white opacity-50 text-xs">
                          You Receive
                        </p>
                        <input
                          //   placeholder="0.00"
                          style={{ height: 30 }}
                          //   value={150}
                          type="number"
                          className="form-control text-base h-auto outline-0 w-full border-0 p-0 bg-transparent"
                        />
                        <p className="m-0 text-xs text-white/50">
                          1 ETH = 1455.05
                        </p>
                      </div>
                      <div className="right">
                        <div className="flex items-center gap-2">
                          {usdc}{" "}
                          <span className="text-xs font-medium">USDC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="my-2">
                    <ul className="list-none pl-0 mb-0 text-xs">
                      <li className="py-1 flex items-center gap-2 text-white/50">
                        <span className="icn">{icn2}</span>
                        See Fees calculation
                      </li>
                      <li className="py-1 flex items-center gap-2 text-white/50">
                        <span className="icn">{icn1}</span>
                        5.98 GBP <span className="text-xs">Total Fees</span>
                      </li>
                    </ul>
                  </div> */}
                  <div className="py-2">
                    <button
                      onClick={swap}
                      disabled={loading}
                      className="btn flex items-center justify-center commonBtn rounded-20 h-[45px] w-full text-xs font-medium"
                    >
                      {loading ? "Please wait ..." : "Continue"}
                    </button>
                  </div>
                  {/* <WagmiProvider config={wagmiConfig}>
                    <QueryClientProvider client={queryClient}>
                      <ZeroDevProvider config={zdConfig}>
                        <SwapWidget provider={"g"} chainId={1} tokenIn={"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"} tokenOut={"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"} apiKey={process.env.NEXT_PUBLIC_ENSO_API_KEY} indicateRoute={true} 
                    enableShare={true}
                    adaptive={true} />
                      </ZeroDevProvider>
                    </QueryClientProvider>
                  </WagmiProvider> */}


                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Defi;

const usa = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 7V17H29V15H17V13H29V11H17V9H29V7H3ZM5 8C5.26522 8 5.51957 8.10536 5.70711 8.29289C5.89464 8.48043 6 8.73478 6 9C6 9.26522 5.89464 9.51957 5.70711 9.70711C5.51957 9.89464 5.26522 10 5 10C4.73478 10 4.48043 9.89464 4.29289 9.70711C4.10536 9.51957 4 9.26522 4 9C4 8.73478 4.10536 8.48043 4.29289 8.29289C4.48043 8.10536 4.73478 8 5 8ZM9 8C9.26522 8 9.51957 8.10536 9.70711 8.29289C9.89464 8.48043 10 8.73478 10 9C10 9.26522 9.89464 9.51957 9.70711 9.70711C9.51957 9.89464 9.26522 10 9 10C8.73478 10 8.48043 9.89464 8.29289 9.70711C8.10536 9.51957 8 9.26522 8 9C8 8.73478 8.10536 8.48043 8.29289 8.29289C8.48043 8.10536 8.73478 8 9 8ZM13 8C13.2652 8 13.5196 8.10536 13.7071 8.29289C13.8946 8.48043 14 8.73478 14 9C14 9.26522 13.8946 9.51957 13.7071 9.70711C13.5196 9.89464 13.2652 10 13 10C12.7348 10 12.4804 9.89464 12.2929 9.70711C12.1054 9.51957 12 9.26522 12 9C12 8.73478 12.1054 8.48043 12.2929 8.29289C12.4804 8.10536 12.7348 8 13 8ZM7 11C7.26522 11 7.51957 11.1054 7.70711 11.2929C7.89464 11.4804 8 11.7348 8 12C8 12.2652 7.89464 12.5196 7.70711 12.7071C7.51957 12.8946 7.26522 13 7 13C6.73478 13 6.48043 12.8946 6.29289 12.7071C6.10536 12.5196 6 12.2652 6 12C6 11.7348 6.10536 11.4804 6.29289 11.2929C6.48043 11.1054 6.73478 11 7 11ZM11 11C11.2652 11 11.5196 11.1054 11.7071 11.2929C11.8946 11.4804 12 11.7348 12 12C12 12.2652 11.8946 12.5196 11.7071 12.7071C11.5196 12.8946 11.2652 13 11 13C10.7348 13 10.4804 12.8946 10.2929 12.7071C10.1054 12.5196 10 12.2652 10 12C10 11.7348 10.1054 11.4804 10.2929 11.2929C10.4804 11.1054 10.7348 11 11 11ZM15 11C15.2652 11 15.5196 11.1054 15.7071 11.2929C15.8946 11.4804 16 11.7348 16 12C16 12.2652 15.8946 12.5196 15.7071 12.7071C15.5196 12.8946 15.2652 13 15 13C14.7348 13 14.4804 12.8946 14.2929 12.7071C14.1054 12.5196 14 12.2652 14 12C14 11.7348 14.1054 11.4804 14.2929 11.2929C14.4804 11.1054 14.7348 11 15 11ZM5 14C5.26522 14 5.51957 14.1054 5.70711 14.2929C5.89464 14.4804 6 14.7348 6 15C6 15.2652 5.89464 15.5196 5.70711 15.7071C5.51957 15.8946 5.26522 16 5 16C4.73478 16 4.48043 15.8946 4.29289 15.7071C4.10536 15.5196 4 15.2652 4 15C4 14.7348 4.10536 14.4804 4.29289 14.2929C4.48043 14.1054 4.73478 14 5 14ZM9 14C9.26522 14 9.51957 14.1054 9.70711 14.2929C9.89464 14.4804 10 14.7348 10 15C10 15.2652 9.89464 15.5196 9.70711 15.7071C9.51957 15.8946 9.26522 16 9 16C8.73478 16 8.48043 15.8946 8.29289 15.7071C8.10536 15.5196 8 15.2652 8 15C8 14.7348 8.10536 14.4804 8.29289 14.2929C8.48043 14.1054 8.73478 14 9 14ZM13 14C13.2652 14 13.5196 14.1054 13.7071 14.2929C13.8946 14.4804 14 14.7348 14 15C14 15.2652 13.8946 15.5196 13.7071 15.7071C13.5196 15.8946 13.2652 16 13 16C12.7348 16 12.4804 15.8946 12.2929 15.7071C12.1054 15.5196 12 15.2652 12 15C12 14.7348 12.1054 14.4804 12.2929 14.2929C12.4804 14.1054 12.7348 14 13 14ZM3 19V21H29V19H3ZM3 23V25H29V23H3Z"
      fill="#DA4A4A"
    />
  </svg>
);

const btc = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.6707 13.661C20.2014 19.5539 14.2322 23.1402 8.33802 21.6707C2.4462 20.2015 -1.14053 14.2327 0.329506 8.34018C1.79816 2.44665 7.76733 -1.14 13.6598 0.32917C19.5537 1.79834 23.1401 7.76785 21.6707 13.661Z"
      fill="#F7931A"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16.0129 9.56296C16.2418 8.02184 15.0769 7.19338 13.484 6.6407L14.0007 4.55306L12.7392 4.23637L12.2361 6.269C11.9045 6.18575 11.5639 6.10721 11.2254 6.02939L11.732 3.98338L10.4712 3.66669L9.95415 5.7536C9.67963 5.69062 9.41015 5.62837 9.14857 5.56286L9.15001 5.55635L7.41021 5.11877L7.07462 6.47602C7.07462 6.47602 8.01063 6.6921 7.99086 6.70549C8.50181 6.83397 8.59415 7.17456 8.5787 7.44456L7.99015 9.82283C8.02536 9.83188 8.07099 9.84491 8.12129 9.86518L8.07855 9.85442L8.07852 9.85441C8.04927 9.84703 8.01895 9.83937 7.98799 9.83188L7.16301 13.1635C7.10049 13.3198 6.94203 13.5544 6.58487 13.4653C6.59745 13.4838 5.66791 13.2348 5.66791 13.2348L5.04163 14.6894L6.68333 15.1016C6.86666 15.1479 7.04779 15.1955 7.22704 15.2426C7.34639 15.2739 7.46491 15.3051 7.58268 15.3355L7.0606 17.447L8.32071 17.7637L8.83776 15.6746C9.18199 15.7687 9.51615 15.8556 9.84312 15.9373L9.32787 18.0167L10.5894 18.3334L11.1115 16.2258C13.2627 16.6359 14.8803 16.4705 15.5612 14.5106C16.1099 12.9326 15.5339 12.0223 14.4021 11.4287C15.2263 11.2373 15.8472 10.6911 16.0129 9.56296ZM13.1305 13.6344C12.7728 15.0821 10.5231 14.4836 9.49368 14.2097C9.40107 14.1851 9.31833 14.1631 9.24774 14.1454L9.94049 11.348C10.0264 11.3696 10.1315 11.3934 10.2504 11.4203C11.3151 11.6609 13.497 12.1541 13.1305 13.6344ZM10.4643 10.1221C11.3226 10.3528 13.1946 10.856 13.5207 9.54016C13.8537 8.19424 12.0342 7.78851 11.1456 7.59037C11.0457 7.56808 10.9575 7.54842 10.8855 7.53034L10.2574 10.0675C10.3167 10.0824 10.3864 10.1011 10.4643 10.1221Z"
      fill="white"
    />
  </svg>
);

const icn1 = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="14" cy="14" r="14" fill="#D9D9D9" />
    <line opacity="0.5" x1="4" y1="14.5" x2="24" y2="14.5" stroke="black" />
  </svg>
);

const icn2 = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="14" cy="14" r="14" fill="#D9D9D9" />
    <path
      opacity="0.5"
      d="M8.57542 13.4757L9.75603 15.5205L5.19598 18.1533L5.7739 19.1897L10.3493 16.5481L11.5269 18.5878L12.6073 14.556L8.57542 13.4757Z"
      fill="black"
    />
    <path
      opacity="0.5"
      d="M16.5561 8.64158L17.7367 10.6864L22.2968 8.0537L22.9053 9.07239L18.33 11.714L19.5076 13.7537L15.4758 12.6734L16.5561 8.64158Z"
      fill="black"
    />
  </svg>
);

const usdc = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9 18C13.99 18 18 13.99 18 9C18 4.01 13.99 0 9 0C4.01 0 0 4.01 0 9C0 13.99 4.01 18 9 18ZM11.475 10.422C11.475 9.112 10.688 8.662 9.113 8.476C7.988 8.324 7.763 8.026 7.763 7.498C7.763 6.975 8.14 6.638 8.888 6.638C9.563 6.638 9.94 6.862 10.125 7.425C10.165 7.537 10.277 7.61 10.39 7.61H10.986C11.0205 7.61108 11.0549 7.60516 11.0871 7.59259C11.1193 7.58002 11.1486 7.56107 11.1733 7.53687C11.198 7.51267 11.2175 7.48372 11.2307 7.45178C11.2438 7.41984 11.2504 7.38555 11.25 7.351V7.312C11.098 6.485 10.423 5.698 9.563 5.625V4.798C9.563 4.646 9.45 4.533 9.265 4.5H8.77C8.618 4.5 8.477 4.612 8.438 4.798V5.625C7.313 5.776 6.565 6.637 6.565 7.576C6.565 8.814 7.313 9.298 8.888 9.489C9.94 9.674 10.278 9.899 10.278 10.501C10.278 11.098 9.748 11.514 9.04 11.514C8.06 11.514 7.724 11.098 7.611 10.535C7.577 10.389 7.465 10.31 7.352 10.31H6.711C6.67645 10.3096 6.64216 10.3162 6.61022 10.3293C6.57828 10.3425 6.54933 10.362 6.52513 10.3867C6.50093 10.4114 6.48198 10.4407 6.46941 10.4729C6.45684 10.5051 6.45092 10.5395 6.452 10.574V10.614C6.598 11.548 7.2 12.189 8.438 12.374V13.207C8.438 13.359 8.55 13.46 8.736 13.5H9.276C9.422 13.5 9.524 13.398 9.563 13.207V12.374C10.688 12.189 11.475 11.435 11.475 10.422ZM5.213 13.225C5.75714 13.7231 6.39434 14.1089 7.088 14.36C7.2 14.439 7.313 14.585 7.313 14.698V15.226C7.313 15.299 7.313 15.339 7.273 15.372C7.24 15.524 7.088 15.597 6.936 15.524C5.57163 15.089 4.38093 14.2314 3.536 13.0752C2.69107 11.919 2.2357 10.524 2.2357 9.092C2.2357 7.65996 2.69107 6.26502 3.536 5.1088C4.38093 3.95259 5.57163 3.095 6.936 2.66C6.976 2.626 7.048 2.626 7.088 2.626C7.24 2.66 7.313 2.773 7.313 2.924V3.448C7.313 3.638 7.24 3.751 7.088 3.824C6.32102 4.10085 5.62447 4.5433 5.04788 5.11988C4.4713 5.69647 4.02885 6.39302 3.752 7.16C3.36503 8.20157 3.29724 9.33483 3.55729 10.4151C3.81734 11.4954 4.39342 12.4736 5.212 13.225M10.726 2.812C10.76 2.66 10.912 2.587 11.064 2.66C12.0952 2.99475 13.0314 3.57121 13.7945 4.3413C14.5577 5.1114 15.1256 6.0528 15.451 7.087C16.576 10.647 14.624 14.439 11.064 15.564C11.024 15.597 10.951 15.597 10.912 15.597C10.76 15.564 10.687 15.451 10.687 15.299V14.776C10.687 14.585 10.76 14.473 10.912 14.399C11.6787 14.1221 12.375 13.6798 12.9514 13.1034C13.5278 12.527 13.9701 11.8307 14.247 11.064C14.5043 10.3725 14.6221 9.63695 14.5935 8.89972C14.5649 8.16249 14.3905 7.43823 14.0804 6.76877C13.7704 6.09931 13.3307 5.49793 12.7869 4.99936C12.243 4.50078 11.6058 4.1149 10.912 3.864C10.799 3.785 10.687 3.639 10.687 3.487V2.964C10.687 2.885 10.687 2.851 10.727 2.812"
      fill="#2775CA"
    />
  </svg>
);
