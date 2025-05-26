import React, { useEffect, useState, useCallback } from "react";
import {
  getRpcProvider,
  getProvider,
  getAccount,
  getETHEREUMRpcProvider,
} from "@/lib/zeroDev.js";
import Web3Interaction from "@/utils/web3Interaction";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { reverseBridge, swap } from "../../utils/morphoSwap"; // Updated import to use bridge and swap functions
import Image from "next/image";
import { retrieveSecret } from "../../utils/webauthPrf";
import { mainnet, base } from "viem/chains";

const WithdrawalSwap = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [paxgBalance, setPaxgBalance] = useState("0");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [bridgeData, setBridgeData] = useState(null);
  const [gasSwapData, setGasSwapData] = useState(null); // Store swap route for gas
  const [gasRequiredWei, setGasRequiredWei] = useState("0"); // Store gas required in wei
  const [isLoading, setIsLoading] = useState(false);
  const [usdValue, setUsdValue] = useState({ from: "0", to: "0" });

  // Fixed bridge direction: PAXG on Ethereum to USDC on Base
  const [bridgeDirection] = useState({
    from: "PAXG",
    to: "USDC",
  });

  // Chain constants
  const BASE_CHAIN = process.env.NEXT_PUBLIC_MAINNET_CHAIN; // 8453 for Base
  const ETHEREUM_CHAIN = process.env.NEXT_PUBLIC_ENV_ETHERCHAIN_PAXG; // 1 for Ethereum
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS;
  const PAXG_ADDRESS = process.env.NEXT_PUBLIC_ENV_ETHERCHAIN_PAXG_Address;
  const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; // Native ETH address

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
      const providerETH = await getETHEREUMRpcProvider();
      const provider = await getRpcProvider();
      const web3 = new Web3Interaction("sepolia", provider);

      // Fetch USDC balance on Base
      const usdcResult = await web3.getUSDCBalance(
        USDC_ADDRESS,
        userAuth?.walletAddress,
        provider
      );

      if (usdcResult.success && usdcResult.balance) {
        setUsdcBalance(Number.parseFloat(usdcResult.balance).toFixed(6));
      } else {
        toast.error(usdcResult.error || "Failed to fetch USDC balance");
      }

      // Fetch PAXG balance on Ethereum
      const paxgResult = await web3.getMorphoBalance(
        PAXG_ADDRESS,
        userAuth?.walletAddress,
        // "0xA5E256722897FCdC32a5406222175C09B4952489",
        providerETH
      );

      if (paxgResult.success && paxgResult.balance) {
        setPaxgBalance(Number.parseFloat(paxgResult.balance).toFixed(6));
      }
    } catch (error) {
      toast.error("Failed to fetch token balances");
    }
  };

  // Updated to use bridge function and prepare gas swap for reverse direction
  const updateBridgeQuote = async (amount) => {
    if (!amount || !userAuth?.walletAddress) return;

    setIsLoading(true);
    try {
      // Define token objects for the bridge function (reverse direction)
      const tokenIn = {
        address: PAXG_ADDRESS,
        name: "PAXG",
        chainId: Number.parseInt(ETHEREUM_CHAIN),
      };

      const tokenOut = {
        address: USDC_ADDRESS,
        name: "USDC",
        chainId: Number.parseInt(BASE_CHAIN),
      };

      // Convert amount to wei (PAXG has 18 decimals)
      const amountInWei = ethers.utils.parseUnits(amount, 18).toString();

      // Call the bridge function
      const bridgeResult = await reverseBridge(
        tokenIn,
        tokenOut,
        amountInWei,
        Number.parseInt(ETHEREUM_CHAIN),
        Number.parseInt(BASE_CHAIN),
        userAuth?.walletAddress
      );

      setBridgeData(bridgeResult);

      // Get the expected amount out from the bridge response
      if (bridgeResult?.amountsOut) {
        const amountOutValue = Object.values(bridgeResult.amountsOut)[0];
        if (amountOutValue) {
          const formattedToAmount = ethers.utils.formatUnits(
            amountOutValue,
            6 // USDC has 6 decimals
          );
          setToAmount(formattedToAmount);
        }
      }

      // Extract gas requirement from bridge data and add buffer
      let gasRequired = "0";
      console.log("line-131", bridgeResult);
      if (bridgeResult?.tx?.value) {
        // If gas is in tx.value field, use that with buffer
        const gasWithBuffer = ethers.BigNumber.from(bridgeResult.tx.value).add(
          "1000"
        );
        gasRequired = gasWithBuffer.toString();
      }

      setGasRequiredWei(gasRequired);

      // Now prepare gas swap: ETH to PAXG to get required PAXG amount for gas (on Ethereum)
      if (gasRequired !== "0") {
        await prepareGasSwap(gasRequired);
      }
    } catch (error) {
      console.error("Bridge quote error:", error);
      toast.error("Failed to get bridge quote");
      setToAmount("");
      setBridgeData(null);
      setGasSwapData(null);
      setGasRequiredWei("0");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare gas swap: ETH to PAXG on Ethereum to determine required PAXG
  const prepareGasSwap = async (gasRequiredWei) => {
    try {
      console.log("Preparing gas swap for gas amount:", gasRequiredWei);

      const ethToken = {
        address: ETH_ADDRESS,
        name: "ETH",
        chainId: Number.parseInt(ETHEREUM_CHAIN),
      };

      const paxgToken = {
        address: PAXG_ADDRESS,
        name: "PAXG",
        chainId: Number.parseInt(ETHEREUM_CHAIN),
      };

      // Get swap quote from ETH to PAXG to know how much PAXG we need
      const ethToPaxgSwap = await swap(
        ethToken,
        paxgToken,
        gasRequiredWei, // ETH amount in wei
        Number.parseInt(ETHEREUM_CHAIN),
        userAuth?.walletAddress
      );

      console.log("ETH to PAXG swap quote:", ethToPaxgSwap);

      // Now get the reverse swap (PAXG to ETH) using the PAXG amount we just calculated
      if (ethToPaxgSwap?.estimate?.toAmount) {
        const paxgToEthSwap = await swap(
          paxgToken,
          ethToken,
          ethToPaxgSwap.estimate.toAmount, // PAXG amount needed
          Number.parseInt(ETHEREUM_CHAIN),
          userAuth?.walletAddress
        );

        console.log("PAXG to ETH swap route prepared:", paxgToEthSwap);
        setGasSwapData(paxgToEthSwap);
      }
    } catch (error) {
      console.error("Gas swap preparation error:", error);
      toast.error("Failed to prepare gas swap");
    }
  };

  // Handle input changes in the first input field
  // const handleFromAmountChange = (e) => {
  //   const value = e.target.value;
  //   setFromAmount(value);
  //   if (value && !Number.isNaN(Number.parseFloat(value))) {
  //     updateBridgeQuote(value);
  //   } else {
  //     setToAmount("");
  //     setBridgeData(null);
  //     setGasSwapData(null);
  //     setGasRequiredWei("0");
  //     setUsdValue({ from: "0", to: "0" });
  //   }
  // };

  const handleFromAmountChange = useCallback(
    (e) => {
      const value = e.target.value;
      setFromAmount(value);

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Clear previous data immediately when input changes
      setToAmount("");
      setBridgeData(null);
      setGasSwapData(null);
      setGasRequiredWei("0");
      setUsdValue({ from: "0", to: "0" });

      // Set new timer for 2 seconds
      if (value && !Number.isNaN(Number.parseFloat(value))) {
        const newTimer = setTimeout(() => {
          updateBridgeQuote(value);
        }, 2000);
        setDebounceTimer(newTimer);
      }
    },
    [debounceTimer]
  );

  // Execute the complete bridge transaction with gas handling
  const executeBridge = async () => {
    if (!bridgeData || !userAuth?.walletAddress) {
      toast.error("Bridge data not available or wallet not connected");
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
    console.log("secretData", secretData);
    setIsLoading(true);

    try {
      const chain = mainnet; // We're working on Ethereum chain for gas swap
      const getAccountCli = await getAccount(secretData?.seedPhrase, chain);
      if (!getAccountCli.status) {
        toast.error(getAccountCli?.msg);
        return;
      }

      console.log("getAccountCli", getAccountCli);
      const signer = await getProvider(getAccountCli?.kernelClient);
      console.log("signer", signer);

      let signerAddress;
      try {
        signerAddress = await signer?.signer?.getAddress();
      } catch (error) {
        toast.error(
          "Wallet signer not properly initialized. Please reconnect your wallet."
        );
        setIsLoading(false);
        return;
      }

      if (!signerAddress) {
        toast.error(
          "Wallet signer not properly initialized. Please reconnect your wallet."
        );
        setIsLoading(false);
        return;
      }

      // Step 1: Execute gas swap (PAXG to ETH) if we have gas swap data
      if (gasSwapData && gasRequiredWei !== "0") {
        console.log("Step 1: Executing gas swap (PAXG to ETH)");

        // Handle approval for gas swap if needed
        if (gasSwapData.approvalData) {
          console.log("Processing gas swap approval");
          const gasApprovalTx = await signer?.signer?.sendTransaction(
            gasSwapData.approvalData.tx
          );
          toast.info(`Gas swap approval submitted: ${gasApprovalTx.hash}`);
          await gasApprovalTx.wait();
          toast.success("Gas swap approval complete");
        }

        // Execute gas swap transaction
        const gasSwapTx = await signer?.signer?.sendTransaction(
          gasSwapData.routeData.tx
        );
        toast.info(`Gas swap transaction submitted: ${gasSwapTx.hash}`);
        await gasSwapTx.wait();
        toast.success(
          "Gas swap completed - ETH acquired for bridge transaction"
        );
      }

      // Step 2: Execute bridge transaction approval if needed
      if (bridgeData.approvalData) {
        console.log("Step 2: Processing bridge approval");
        const bridgeApprovalTx = await signer?.signer?.sendTransaction(
          bridgeData.approvalData.tx
        );
        toast.info(`Bridge approval submitted: ${bridgeApprovalTx.hash}`);
        await bridgeApprovalTx.wait();
        toast.success("Bridge approval complete");
      }

      // Step 3: Execute bridge transaction
      console.log("Step 3: Processing bridge transaction");
      const bridgeTx = await signer?.signer?.sendTransaction(bridgeData.tx);

      toast.info(`Bridge transaction submitted: ${bridgeTx.hash}`);
      const receipt = await bridgeTx.wait();
      toast.success("Bridge transaction completed successfully!");

      // Refresh balances
      fetchBalances();

      // Reset form
      setFromAmount("");
      setToAmount("");
      setBridgeData(null);
      setGasSwapData(null);
      setGasRequiredWei("0");
    } catch (error) {
      console.log("error", error);
      if (error.message?.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error(
          `Failed to execute bridge: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button text based on state
  const getButtonText = () => {
    if (isLoading) return "Loading...";
    if (!fromAmount || !toAmount) return "Enter an amount";
    if (Number.parseFloat(fromAmount) > Number.parseFloat(paxgBalance))
      return "Insufficient PAXG Balance";
    if (!bridgeData) return "Get Bridge Quote";
    if (gasRequiredWei !== "0" && !gasSwapData) return "Preparing gas swap...";
    return "Bridge Tokens";
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    return (
      isLoading ||
      !fromAmount ||
      !toAmount ||
      !bridgeData ||
      Number.parseFloat(fromAmount) > Number.parseFloat(paxgBalance) ||
      (gasRequiredWei !== "0" && !gasSwapData)
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
                  <p className="m-0 font-medium">Bridge</p>
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
                        />
                        <h6 className="m-0 font-medium text-white/50">
                          Ethereum Network
                        </h6>
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base">
                          <span className="icn">
                            <Image
                              src={
                                process.env.NEXT_PUBLIC_IMAGE_URL + "gold.webp"
                              }
                              alt="logo"
                              height={22}
                              width={22}
                              className="max-w-full object-contain w-auto smlogo"
                            />
                          </span>{" "}
                          {bridgeDirection.from}
                        </button>
                        <h6 className="m-0 font-medium text-white/50">
                          Balance: {parseFloat(paxgBalance).toFixed(4)}{" "}
                          {bridgeDirection.from}
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
                          disabled={true}
                          readOnly
                        />
                        <h6 className="m-0 font-medium text-white/50">
                          Base Network
                        </h6>
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base">
                          <span className="icn">
                            {bridgeDirection.to === "USDC" ? (
                              usdcIcn
                            ) : (
                              <Image
                                src={
                                  process.env.NEXT_PUBLIC_IMAGE_URL + "usd.png"
                                }
                                alt="logo"
                                height={22}
                                width={22}
                                className="max-w-full object-contain w-auto smlogo"
                              />
                            )}
                          </span>{" "}
                          {bridgeDirection.to}
                        </button>
                        <h6 className="m-0 font-medium text-white/50">
                          Balance: {parseFloat(usdcBalance).toFixed(2)}{" "}
                          {bridgeDirection.to}
                        </h6>
                      </div>
                    </div>
                  </div>

                  {/* Gas information display */}
                  {gasRequiredWei !== "0" && (
                    <div className="mt-2 bg-black/30 rounded-lg p-2 text-xs">
                      <p className="m-0 text-amber-500">
                        Gas required: {ethers.utils.formatEther(gasRequiredWei)}{" "}
                        ETH
                      </p>
                      {gasSwapData && (
                        <p className="m-0 text-green-500">
                          Gas swap prepared: PAXG → ETH
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 py-2">
                    <button
                      className={`flex btn rounded-xl items-center justify-center commonBtn w-full ${
                        isButtonDisabled() ? "opacity-70" : ""
                      }`}
                      onClick={executeBridge}
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
