import {
  getRpcProvider,
  getProvider,
  getAccount,
  publicClient,
  sendTransaction,
} from "@/lib/zeroDev.js";
import Web3Interaction from "@/utils/web3Interaction";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { swap, TOKENS } from "@/utils/morphoSwap";
import { retrieveSecret } from "../../utils/webauthPrf";
import Image from "next/image";
import { parseAbi } from "viem";

const WithdrawalSwap = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [morphoBalance, setMorphoBalance] = useState("0");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usdValue, setUsdValue] = useState({ from: "0", to: "0" });

  // Fixed swap direction: Morpho to USDC (opposite of deposit)
  const [swapDirection] = useState({
    from: "MORPHO",
    to: "USDC",
  });

  // Chain constants - Base chain (ID: 8453)
  const BASE_CHAIN = process.env.NEXT_PUBLIC_BASE_CHAIN || 8453;
  const USDC_ADDRESS =
    process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || TOKENS.USDC[8453].address;
  const MORPHO_ADDRESS =
    process.env.NEXT_PUBLIC_MORPHO_CONTRACT_ADDRESS || TOKENS.MORPHO.address;

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalances();
    }
  }, [userAuth?.walletAddress]);

  const fetchBalances = async () => {
    try {
      if (!userAuth?.walletAddress) return;

      const senderUsdcBalance = await publicClient.readContract({
        abi: parseAbi([
          "function balanceOf(address account) returns (uint256)",
        ]),
        address: USDC_ADDRESS,
        functionName: "balanceOf",
        args: [userAuth?.walletAddress],
      });
      const balance = String(
        Number(BigInt(senderUsdcBalance)) / Number(BigInt(1e6))
      );

      if (balance) {
        setUsdcBalance(balance);
      } else {
        toast.error(usdcResult.error || "Failed to fetch USDC balance");
      }

      // Fetch Morpho balance

      const senderMPRPHOBalance = await publicClient.readContract({
        abi: parseAbi([
          "function balanceOf(address account) returns (uint256)",
        ]),
        address: MORPHO_ADDRESS,
        functionName: "balanceOf",
        args: [userAuth?.walletAddress],
      });
      const morphoResult = String(
        Number(BigInt(senderMPRPHOBalance)) / Number(BigInt(1e18))
      );

      if (morphoResult) {
        setMorphoBalance(morphoResult);
      }
    } catch (error) {
      toast.error("Failed to fetch token balances");
      console.error("Balance fetch error:", error);
    }
  };

  // Updated quote function for Morpho to USDC swap
  const updateQuote = async (amount) => {
    if (!amount || !userAuth?.walletAddress) return;

    setIsLoading(true);
    try {
      // Convert amount to base units (Morpho has 18 decimals)
      const amountInBaseUnits = ethers.utils.parseUnits(amount, 18).toString();

      // Prepare token objects - reversed from deposit
      const fromToken = {
        ...TOKENS.MORPHO,
        address: MORPHO_ADDRESS,
      };

      const toToken = {
        ...TOKENS.USDC[BASE_CHAIN],
        address: USDC_ADDRESS,
      };

      // Get swap quote from Enso
      const quoteResult = await swap(
        fromToken,
        toToken,
        amountInBaseUnits,
        BASE_CHAIN,
        userAuth?.walletAddress
      );

      console.log("Enso swap quote received:", quoteResult);
      setQuote(quoteResult);

      // Update toAmount based on the quote result
      if (quoteResult && quoteResult.estimate?.toAmount) {
        // USDC has 6 decimals
        const formattedToAmount = ethers.utils.formatUnits(
          quoteResult.estimate.toAmount,
          6
        );
        setToAmount(formattedToAmount);

        // Calculate USD values
        const morphoPrice = 2.5; // Example price for Morpho token
        const usdcPrice = 1.0; // USDC is pegged to USD

        const fromUsdValue = parseFloat(amount) * morphoPrice;
        const toUsdValue = parseFloat(formattedToAmount) * usdcPrice;

        setUsdValue({
          from: fromUsdValue.toFixed(2),
          to: toUsdValue.toFixed(2),
        });
      }
    } catch (error) {
      // toast.error("Failed to get swap quote from Enso");
      console.error("Enso quote error:", error);

      // Clear the second input on error
      setToAmount("");
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes in the first input field
  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      updateQuote(value);
    } else {
      setToAmount("");
      setQuote(null);
      setUsdValue({ from: "0", to: "0" });
    }
  };

  // Execute the swap transaction using Enso
  const executeSwap = async () => {
    if (!quote || !userAuth?.walletAddress) {
      toast.error("Quote not available or wallet not connected");
      return;
    }

    if (parseFloat(fromAmount) > parseFloat(morphoBalance)) {
      toast.error("Insufficient MORPHO balance");
      return;
    }

    let data = JSON.parse(userAuth?.webauthKey);
    let retrieveSecretCheck = await retrieveSecret(
      data?.storageKeySecret,
      data?.credentialIdSecret
    );
    if (!retrieveSecretCheck?.status) {
      toast.error(retrieveSecretCheck?.msg);
      return;
    }

    let secretData = JSON.parse(retrieveSecretCheck?.data?.secret);
    console.log("secretData", secretData);
    setIsLoading(true);
    try {
      const getAccountCli = await getAccount(
        secretData?.privateKey,
        secretData?.safePrivateKey
      );
      if (!getAccountCli.status) {
        toast.error(getAccountCli?.msg);
        return;
      }
      console.log("getAccountCli", getAccountCli);
      // const signer = await getProvider(getAccountCli?.kernelClient);
      // console.log("signer", signer);

      // Try to get the signer address
      // let signerAddress;
      // try {
      //   signerAddress = await signer.signer.getAddress();
      // } catch (error) {
      //   toast.error(
      //     "Wallet signer not properly initialized. Please reconnect your wallet."
      //   );
      //   setIsLoading(false);
      //   return;
      // }

      // If we have a valid signer address, proceed with the transaction
      // if (!signerAddress) {
      //   toast.error(
      //     "Wallet signer not properly initialized. Please reconnect your wallet."
      //   );
      //   setIsLoading(false);
      //   return;
      // }
      if (!getAccountCli.status) {
        toast.error(getAccountCli?.msg);
        return;
      }

      if (quote.approvalData && quote.routeData) {
        toast.info("Approving USDC for Enso router...");
        try {
          // const approvalTx = await signer?.signer?.sendTransaction(
          //   quote.approvalData.tx
          // );

          const tx = await sendTransaction(getAccountCli?.kernelClient, [
            quote.approvalData.tx,
            quote.routeData.tx,
          ]);
          console.log("tx", tx);
          if (tx) {
            toast.info(`Approval transaction submitted: ${tx.hash}`);

            // Wait for approval confirmation
            // const approvalReceipt = await tx.wait();
            toast.success("Swap completed successfully!");
          }

          // toast.info(`Approval transaction submitted: ${approvalTx.hash}`);

          // Wait for approval confirmation
          // const approvalReceipt = await approvalTx.wait();
          // toast.success("Token approval confirmed!");
        } catch (error) {
          if (error.message && error.message.includes("user rejected")) {
            toast.error("Approval transaction was rejected");
            setIsLoading(false);
            return;
          } else {
            throw error; // Re-throw for handling in the catch block
          }
        }
      }

      // Execute the swap transaction
      // toast.info("Executing swap through Enso router...");
      // const swapTx = await signer?.signer?.sendTransaction(quote.routeData.tx);
      // toast.info(`Swap transaction submitted: ${swapTx.hash}`);

      // Wait for swap confirmation
      // const swapReceipt = await swapTx.wait();
      // toast.success("Swap completed successfully!");

      // Refresh balances
      fetchBalances();

      // Reset form
      setFromAmount("");
      setToAmount("");
      setQuote(null);
      setUsdValue({ from: "0", to: "0" });
    } catch (error) {
      // Error handling
      if (error.message && error.message.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (
        error.message &&
        error.message.includes("insufficient funds")
      ) {
        toast.error("Insufficient funds for transaction");
      } else if (
        error.message &&
        error.message.includes("execution reverted")
      ) {
        toast.error(
          "Transaction failed: Execution reverted. The swap may have high slippage or the price moved."
        );
      } else {
        toast.error(
          `Failed to execute swap: ${error.message || "Unknown error"}`
        );
      }
      console.error("Enso swap execution error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button text based on state
  const getButtonText = () => {
    if (isLoading) return "Loading...";
    if (!fromAmount || !toAmount) return "Enter an amount";
    if (parseFloat(fromAmount) > parseFloat(morphoBalance))
      return "Insufficient MORPHO Balance";
    if (!quote) return "Get Quote";
    return "Swap Tokens";
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    return (
      isLoading ||
      !fromAmount ||
      !toAmount ||
      !quote ||
      parseFloat(fromAmount) > parseFloat(morphoBalance)
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
                  <p className="m-0 font-medium">
                    Swap Morpho to USDC via Enso
                  </p>
                  <div className="text-xs text-white/70">
                    Powered by Enso Finance
                  </div>
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
                          // disabled={isLoading}
                        />
                        {/* <h6 className="m-0 font-medium text-white/50">
                          ≈ $
                          {quote
                            ? parseFloat(
                                quote?.action?.fromToken?.priceUSD || 1
                              ).toFixed(2)
                            : "0.0"}
                        </h6> */}
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base">
                          <span className="icn">
                            <Image
                              src={
                                process.env.NEXT_PUBLIC_IMAGE_URL + "usd.png"
                              }
                              alt="logo"
                              height={22}
                              width={22}
                              className="max-w-full object-contain w-auto smlogo"
                            />
                          </span>{" "}
                          {swapDirection.from}
                        </button>
                        <h6 className="m-0 font-medium text-white/50">
                          Balance: {parseFloat(morphoBalance).toFixed(4)}{" "}
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
                            ? parseFloat(
                                quote?.action?.toToken?.priceUSD || 1
                              ).toFixed(2)
                            : "0.0"}
                        </h6> */}
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base">
                          <span className="icn">{usdcIcn}</span>{" "}
                          {swapDirection.to}
                        </button>
                        <h6 className="m-0 font-medium text-white/50">
                          Balance: {parseFloat(usdcBalance).toFixed(2)}{" "}
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
                      onClick={executeSwap}
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

export default WithdrawalSwap;

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
