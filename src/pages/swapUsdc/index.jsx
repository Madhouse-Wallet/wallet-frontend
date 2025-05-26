import {
  getAccount,
  getProvider,
  sendTransaction,
  USDC_ABI,
  publicClient,
  usdc,
} from "@/lib/zeroDev";
import { parseUnits, parseAbi } from "viem";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createUsdcToBtcShift } from "../api/sideShiftAI";
import { fetchBitcoinBalance } from "../../pages/api/bitcoinBalance";
import { retrieveSecret } from "@/utils/webauthPrf";

const Swap = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [tbtcBalance, setTbtcBalance] = useState("0");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usdValue, setUsdValue] = useState({ from: "0", to: "0" });
  const [destinationAddress, setDestinationAddress] = useState("");
  const [swapDirection] = useState({
    from: "USDC",
    to: "BTC",
  });

  const getDestinationAddress = async (amount) => {
    try {
      const shift = await createUsdcToBtcShift(
        amount,
        userAuth?.bitcoinWallet,
        process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
        process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
      );

      return {
        depositAddress: shift.depositAddress,
        settleAmount: Number.parseFloat(shift.settleAmount || 0),
      };
    } catch (error) {
      console.error("SideShift API error:", error);
      return null;
    }
  };

  const getQuote = async (amount) => {
    try {
      const response = await fetch("/api/swap-quote-thorStream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellAsset: `BASE.USDC-${process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS}`,
          buyAsset: "BTC.BTC",
          sellAmount: amount,
          sourceAddress: userAuth?.walletAddress,
          destinationAddress: userAuth?.bitcoinWallet,
        }),
      });

      const data = await response.json();
      return {
        ...data,
        estimatedDepositAddress: data?.routes[0].targetAddress,
        estimate: data?.routes[0].expectedBuyAmount,
      };
    } catch (error) {
      console.error("Quote fetch error:", error);
      return null;
    }
  };

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalances();
    }
  }, [userAuth?.walletAddress]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const fetchBalances = async () => {
    try {
      if (!userAuth?.walletAddress) return;

      // Fetch USDC balance
      const senderUsdcBalance = await publicClient.readContract({
        abi: parseAbi([
          "function balanceOf(address account) returns (uint256)",
        ]),
        address: usdc,
        functionName: "balanceOf",
        args: [userAuth?.walletAddress],
      });
      const balance = String(
        Number(BigInt(senderUsdcBalance)) / Number(BigInt(1e6))
      );
      setUsdcBalance(balance);

      // Fetch BTC balance (assuming similar method exists or create one)
      // const tbtcResult = await web3.getUSDCBalance(
      //   TBTC_ADDRESS,
      //   userAuth?.walletAddress,
      //   providerr
      // );

      const result = await fetchBitcoinBalance(
        userAuth?.bitcoinWallet
        // "1LtaUUB1QrPNmBAZ9qkCYeNw56GJu5NhG2"
      );

      if (result.balance) {
        setTbtcBalance(result?.balance);
      }
    } catch (error) {
      toast.error("Failed to fetch token balances");
    }
  };

  const handleFromAmountChange = async (e) => {
    const value = e.target.value;
    setFromAmount(value);

    if (value && !Number.isNaN(Number.parseFloat(value))) {
      const timer = setTimeout(async () => {
        setIsLoading(true);
        try {
          const quotePromise = getQuote(value);
          const shiftPromise = getDestinationAddress(value);

          const [quoteResult, shiftResult] = await Promise.all([
            quotePromise,
            shiftPromise,
          ]);
          const quoteSettleAmount = Number.parseFloat(
            quoteResult?.estimate || 0
          );
          const shiftSettleAmount = Number.parseFloat(
            shiftResult?.settleAmount || 0
          );

          let finalAddress = "";

          if (
            quoteSettleAmount <= process.env.NEXT_PUBLIC_SWAP_COMPARE_VALUE &&
            shiftSettleAmount <= process.env.NEXT_PUBLIC_SWAP_COMPARE_VALUE
          ) {
            finalAddress = shiftResult?.depositAddress;
            setToAmount(shiftResult?.settleAmount);
          } else {
            finalAddress = quoteResult?.estimatedDepositAddress;
            setToAmount(quoteResult?.estimate);
          }

          if (finalAddress) {
            setDestinationAddress(finalAddress);
          }
        } catch (err) {
          toast.error("Failed to fetch quote or destination address");
        } finally {
          setIsLoading(false);
        }
      }, 2000); // 500ms debounce

      setDebounceTimer(timer);
    } else {
      setToAmount("");
      setQuote(null);
      setDestinationAddress("");
      setUsdValue({ from: "0", to: "0" });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!toAmount || Number.parseFloat(toAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number.parseFloat(toAmount) > Number.parseFloat(balance)) {
      toast.error("Insufficient USDC balance");
      return;
    }

    const data = JSON.parse(userAuth?.webauthKey);
    const retrieveSecretCheck = await retrieveSecret(
      data?.storageKeySecret,
      data?.credentialIdSecret
    );
    if (!retrieveSecretCheck?.status) {
      toast.error(retrieveSecretCheck?.msg);
      return;
    }

    const secretData = JSON.parse(retrieveSecretCheck?.data?.secret);

    setIsLoading(true);
    try {
      const getAccountCli = await getAccount(secretData?.seedPhrase);
      if (!getAccountCli.status) {
        toast.error(getAccountCli?.msg);
        return;
      }

      const tx = await sendTransaction(getAccountCli?.kernelClient, [
        {
          to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [destinationAddress, parseUnits(fromAmount.toString(), 6)],
        },
      ]);

      if (tx) {
        // setSuccess(true);
        // setRefundBTC(false);
        toast.success("USDC sent successfully!");
        setTimeout(fetchBalances, 2000);
      } else {
        toast.error(result.error || "Transaction failed");
      }
    } catch (error) {
      toast.error(error.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Loading...";
    if (!fromAmount || !toAmount) return "Enter an amount";
    if (Number.parseFloat(fromAmount) > Number.parseFloat(usdcBalance))
      return "Insufficient USDC Balance";
    if (!quote) return "Get Quote";
    return "Swap Tokens";
  };

  const isButtonDisabled = () => {
    return (
      isLoading ||
      !fromAmount ||
      !toAmount ||
      !quote ||
      Number.parseFloat(fromAmount) > Number.parseFloat(usdcBalance)
    );
  };

  return (
    <>
      <section className="py-3">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="bg-black/50 mx-auto max-w-[500px] rounded-xl p-3">
                <div className="top flex items-center justify-between">
                  <p className="m-0 font-medium">Swap</p>
                </div>
                <div className="contentBody">
                  <div className="py-2">
                    <div className="bg-black/50 rounded-xl px-3 py-4 flex items-center justify-between text-xs">
                      <div className="left">
                        <input
                          type="text"
                          className="bg-transparent border-0 text-xl outline-0"
                          value={fromAmount}
                          onChange={handleFromAmountChange}
                          placeholder="0.0"
                          disabled={isLoading}
                        />
                        {/* <h6 className="m-0 font-medium text-white/50">
                          ≈ $
                          {quote
                            ? Number.parseFloat(
                                quote?.action?.fromToken?.priceUSD
                              ).toFixed(2)
                            : "0.0"}
                        </h6> */}
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base">
                          <span className="icn">
                            {swapDirection.from === "USDC" ? usdcIcn : BTC}
                          </span>{" "}
                          {swapDirection.from}
                        </button>
                        <h6 className="m-0 font-medium text-white/50">
                          Balance:{" "}
                          {swapDirection.from === "USDC"
                            ? Number.parseFloat(usdcBalance).toFixed(2)
                            : Number.parseFloat(tbtcBalance).toFixed(2)}{" "}
                          {swapDirection.from}
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className="py-2 my-[-30px] text-center">
                    <button
                      className="bg-black border-[4px] border-[#30190f] shadow p-1 rounded-xl"
                      disabled={true}
                    >
                      {swapIcn}
                    </button>
                  </div>
                  <div className="py-2">
                    <div className="bg-black/50 rounded-xl px-3 py-4 flex items-center justify-between text-xs">
                      <div className="left">
                        <input
                          type="text"
                          className="bg-transparent border-0 text-xl outline-0"
                          value={toAmount}
                          placeholder="0.0"
                          disabled={true} // This input is always disabled
                          readOnly
                        />
                        {/* <h6 className="m-0 font-medium text-white/50">
                          ≈ $
                          {quote
                            ? Number.parseFloat(
                                quote?.action?.toToken?.priceUSD
                              ).toFixed(2)
                            : "0.0"}
                        </h6> */}
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base">
                          <span className="icn">
                            {swapDirection.to === "USDC" ? usdcIcn : BTC}
                          </span>{" "}
                          {swapDirection.to}
                        </button>
                        <h6 className="m-0 font-medium text-white/50">
                          Balance:{" "}
                          {swapDirection.to === "USDC"
                            ? Number.parseFloat(usdcBalance).toFixed(2)
                            : Number.parseFloat(tbtcBalance).toFixed(2)}{" "}
                          {swapDirection.to}
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 py-2">
                    <button
                      className={`flex btn rounded-xl items-center justify-center commonBtn w-full ${
                        isButtonDisabled() ? "opacity-70" : ""
                      }`}
                      onClick={handleSend}
                      disabled={isButtonDisabled()}
                    >
                      {getButtonText()}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Swap;

const BTC = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
  >
    <div
      xmlns=""
      id="in-page-channel-node-id"
      dataChannelName="in_page_channel_kuv5bp"
    />
    <path
      d="M21.6707 13.661C20.2014 19.5539 14.2322 23.1402 8.33802 21.6707C2.4462 20.2015 -1.14053 14.2327 0.329506 8.34018C1.79816 2.44665 7.76733 -1.14 13.6598 0.32917C19.5537 1.79834 23.1401 7.76785 21.6707 13.661Z"
      fill="#F7931A"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.0129 9.56296C16.2418 8.02184 15.0769 7.19338 13.484 6.6407L14.0007 4.55306L12.7392 4.23637L12.2361 6.269C11.9045 6.18575 11.5639 6.10721 11.2254 6.02939L11.732 3.98338L10.4712 3.66669L9.95415 5.7536C9.67963 5.69062 9.41015 5.62837 9.14857 5.56286L9.15001 5.55635L7.41021 5.11877L7.07462 6.47602C7.07462 6.47602 8.01063 6.6921 7.99086 6.70549C8.50181 6.83397 8.59415 7.17456 8.5787 7.44456L7.99015 9.82283C8.02536 9.83188 8.07099 9.84491 8.12129 9.86518L8.07855 9.85442L8.07852 9.85441C8.04927 9.84703 8.01895 9.83937 7.98799 9.83188L7.16301 13.1635C7.10049 13.3198 6.94203 13.5544 6.58487 13.4653C6.59745 13.4838 5.66791 13.2348 5.66791 13.2348L5.04163 14.6894L6.68333 15.1016C6.86666 15.1479 7.04779 15.1955 7.22704 15.2426C7.34639 15.2739 7.46491 15.3051 7.58268 15.3355L7.0606 17.447L8.32071 17.7637L8.83776 15.6746C9.18199 15.7687 9.51615 15.8556 9.84312 15.9373L9.32787 18.0167L10.5894 18.3334L11.1115 16.2258C13.2627 16.6359 14.8803 16.4705 15.5612 14.5106C16.1099 12.9326 15.5339 12.0223 14.4021 11.4287C15.2263 11.2373 15.8472 10.6911 16.0129 9.56296ZM13.1305 13.6344C12.7728 15.0821 10.5231 14.4836 9.49368 14.2097C9.40107 14.1851 9.31833 14.1631 9.24774 14.1454L9.94049 11.348C10.0264 11.3696 10.1315 11.3934 10.2504 11.4203C11.3151 11.6609 13.497 12.1541 13.1305 13.6344ZM10.4643 10.1221C11.3226 10.3528 13.1946 10.856 13.5207 9.54016C13.8537 8.19424 12.0342 7.78851 11.1456 7.59037C11.0457 7.56808 10.9575 7.54842 10.8855 7.53034L10.2574 10.0675C10.3167 10.0824 10.3864 10.1011 10.4643 10.1221Z"
      fill="white"
    />
  </svg>
);

const swapIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    class="styled__ArrowDownIcon-sc-1ch9xvh-2 esblle"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const usdcIcn = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_2_2)">
      <path
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
        fill="#3E73C4"
      />
      <path
        d="M10.011 9.062C10.011 8 9.371 7.636 8.091 7.484C7.177 7.3625 6.9945 7.12 6.9945 6.695C6.9945 6.27 7.2995 5.997 7.9085 5.997C8.457 5.997 8.762 6.179 8.914 6.6345C8.92996 6.67847 8.95894 6.71652 8.99709 6.74359C9.03524 6.77066 9.08073 6.78545 9.1275 6.786H9.615C9.64316 6.78675 9.67117 6.78178 9.69735 6.77138C9.72353 6.76098 9.74732 6.74537 9.76728 6.7255C9.78724 6.70563 9.80297 6.68191 9.81349 6.65578C9.82401 6.62966 9.82912 6.60166 9.8285 6.5735V6.5435C9.76892 6.21395 9.60217 5.9133 9.35417 5.68826C9.10616 5.46322 8.79077 5.32638 8.457 5.299V4.571C8.457 4.4495 8.3655 4.3585 8.2135 4.328H7.756C7.6345 4.328 7.543 4.419 7.5125 4.571V5.269C6.598 5.39 6.0195 5.997 6.0195 6.756C6.0195 7.757 6.6285 8.1515 7.9085 8.3035C8.762 8.455 9.036 8.6375 9.036 9.123C9.036 9.608 8.6095 9.942 8.0305 9.942C7.238 9.942 6.964 9.6085 6.8725 9.153C6.8425 9.032 6.7505 8.971 6.659 8.971H6.141C6.11288 8.97032 6.08492 8.97535 6.0588 8.98578C6.03268 8.99621 6.00895 9.01183 5.98904 9.03169C5.96913 9.05155 5.95346 9.07525 5.94297 9.10134C5.93247 9.12744 5.92738 9.15539 5.928 9.1835V9.2135C6.0495 9.9725 6.5375 10.5185 7.543 10.6705V11.399C7.543 11.52 7.6345 11.6115 7.7865 11.6415H8.244C8.3655 11.6415 8.457 11.5505 8.4875 11.399V10.67C9.402 10.5185 10.011 9.881 10.011 9.0615V9.062Z"
        fill="white"
      />
      <path
        d="M6.44599 12.2485C4.06899 11.3985 2.84999 8.7585 3.73399 6.422C4.19099 5.147 5.19649 4.1765 6.44599 3.721C6.56799 3.6605 6.62849 3.5695 6.62849 3.4175V2.9925C6.62849 2.8715 6.56799 2.7805 6.44599 2.75C6.41549 2.75 6.35449 2.75 6.32399 2.78C5.63821 2.99416 5.00156 3.34186 4.4507 3.80309C3.89985 4.26431 3.44567 4.82994 3.11431 5.46741C2.78296 6.10489 2.58098 6.80161 2.51999 7.51746C2.45901 8.23332 2.54024 8.95417 2.75899 9.6385C3.30699 11.3385 4.61749 12.6435 6.32399 13.1895C6.44599 13.25 6.56799 13.1895 6.59799 13.068C6.62849 13.038 6.62849 13.007 6.62849 12.9465V12.5215C6.62849 12.4305 6.53749 12.3095 6.44599 12.2485ZM9.67599 2.7805C9.55399 2.7195 9.43199 2.7805 9.40199 2.9015C9.37149 2.932 9.37149 2.9625 9.37149 3.023V3.448C9.37149 3.5695 9.46249 3.6905 9.55399 3.7515C11.931 4.6015 13.15 7.2415 12.266 9.578C11.809 10.853 10.8035 11.8235 9.55399 12.279C9.43199 12.3395 9.37149 12.4305 9.37149 12.5825V13.0075C9.37149 13.1285 9.43199 13.2195 9.55399 13.25C9.58449 13.25 9.64549 13.25 9.67599 13.22C10.3618 13.0058 10.9984 12.6581 11.5493 12.1969C12.1001 11.7357 12.5543 11.1701 12.8857 10.5326C13.217 9.89511 13.419 9.19839 13.48 8.48254C13.541 7.76668 13.4597 7.04583 13.241 6.3615C12.693 4.6315 11.352 3.3265 9.67599 2.7805Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_2_2">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
