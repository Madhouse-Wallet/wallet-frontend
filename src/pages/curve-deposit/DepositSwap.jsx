import React, { useEffect, useState, useCallback } from "react";
import {
  getRpcProvider,
  getAccount,
  getETHEREUMRpcProvider,
  publicClient,
  sendTransaction,
  USDC_ABI,
} from "@/lib/zeroDev.js";
import Web3Interaction from "@/utils/web3Interaction";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Image from "next/image";
import { retrieveSecret } from "../../utils/webauthPrf";
import { parseAbi, parseUnits } from "viem";
import { createUsdcBaseToGoldShift } from "../api/sideShiftAI";
import { updtUser } from "@/lib/apiCall";
import TransactionConfirmationPop from "@/components/Modals/TransactionConfirmationPop";
import { createPortal } from "react-dom";
import { filterAmountInput } from "@/utils/helper";
import TransactionSuccessPop from "@/components/Modals/TransactionSuccessPop";

const DepositSwap = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [tethergolgBalance, setTetherGoldBalance] = useState("0");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [shiftData, setShiftData] = useState(null);
  const [trxnApproval, setTrxnApproval] = useState(false);
  const [hash, setHash] = useState("");
  const [success, setSuccess] = useState(false);
  const [depositAddress, setDepositAddress] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fixed direction: USDC on Base to PAXG on Ethereum
  const [bridgeDirection] = useState({
    from: "USDC",
    to: "TETHER GOLD",
  });

  // Chain constants
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS;
  const TETHER_GOLD_ADDRESS =
    process.env.NEXT_PUBLIC_ENV_ETHERCHAIN_TETHER_GOLD_ADDRESS;

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
        toast.error("Failed to fetch USDC balance");
      }

      // Fetch PAXG balance on Ethereum
      const paxgResult = await web3.getGOLDBalance(
        TETHER_GOLD_ADDRESS,
        userAuth?.walletAddress,
        providerETH
      );

      if (paxgResult.success && paxgResult.balance) {
        setTetherGoldBalance(Number.parseFloat(paxgResult.balance).toFixed(6));
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to fetch token balances");
    }
  };

  const updateShiftQuote = async (amount) => {
    if (!amount || !userAuth?.walletAddress) return;

    setIsLoading(true);
    try {
      const shift = await createUsdcBaseToGoldShift(
        amount,
        userAuth?.walletAddress,
        process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
        process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
      );

      setShiftData(shift);
      setDepositAddress(shift.depositAddress);
      setToAmount(shift.settleAmount.toString());
    } catch (error) {
      console.error("Shift quote error:", error);
      toast.error(error ? error.message : "Failed to get shift quote");
      setToAmount("");
      setShiftData(null);
      setDepositAddress("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFromAmountChange = useCallback(
    (e) => {
      const value = e.target.value;
      // setFromAmount(value);

      const filteredValue = filterAmountInput(value, 2);
      console.log("line-147", filteredValue);

      setFromAmount(filteredValue);

      // Validate amount
      if (filteredValue.trim() !== "") {
        if (Number.parseFloat(filteredValue) <= 0) {
          setAmountError("Amount must be greater than 0");
        } else if (
          Number.parseFloat(filteredValue) > Number.parseFloat(usdcBalance)
        ) {
          setAmountError("Insufficient USDC balance");
        } else if (Number.parseFloat(usdcBalance) < 0.01) {
          setAmountError("Minimum balance of $0.01 required");
        } else {
          setAmountError("");
        }
      } else {
        setAmountError("");
      }

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      setToAmount("");
      setShiftData(null);
      setDepositAddress("");

      if (value && !Number.isNaN(Number.parseFloat(value))) {
        const newTimer = setTimeout(() => {
          updateShiftQuote(value);
        }, 2000);
        setDebounceTimer(newTimer);
      }
    },
    [debounceTimer]
  );

  const executeDeposit = async () => {
    if (!shiftData || !depositAddress || !userAuth?.walletAddress) {
      toast.error("Shift data not available or wallet not connected");
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
      const getAccountCli = await getAccount(
        secretData?.privateKey,
        secretData?.safePrivateKey
      );
      if (!getAccountCli.status) {
        toast.error(getAccountCli?.msg);
        return;
      }

      // Send USDC to the deposit address

      const tx = await sendTransaction(getAccountCli?.kernelClient, [
        {
          to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [depositAddress, parseUnits(fromAmount.toString(), 6)],
        },
      ]);
      if (tx?.message?.includes("transfer amount exceeds balance")) {
        toast.error("Insufficient token balance.");
      } else if (tx) {
        setSuccess(true);
        setHash(tx);
        // toast.success("Deposit completed successfully!");
        fetchBalances();
        setFromAmount("");
        setToAmount("");
        setShiftData(null);
        setDepositAddress("");
        let data = await updtUser(
          { email: userAuth?.email },
          {
            $push: {
              sideshiftIds: {
                id: shiftData.id,
                date: new Date(), // stores the current date/time
                type: "goldDeposit", // or whatever type value you want to store
              },
            },
          }
        );
      } else {
        toast.error(tx || "Transaction failed");
      }
    } catch (error) {
      console.error("Deposit execution error:", error);
      if (error.message?.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error(
          `Failed to execute deposit: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading)
      return (
        <Image
          src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
          alt={""}
          height={100000}
          width={10000}
          className={"max-w-full h-[40px] object-contain w-auto"}
        />
      );
    if (!fromAmount || !toAmount) return "Enter an amount";
    if (Number.parseFloat(fromAmount) > Number.parseFloat(usdcBalance))
      return "Insufficient USDC Balance";
    if (!shiftData || !depositAddress) return "Get Shift Quote";
    return "Deposit Tokens";
  };

  const isButtonDisabled = () => {
    return (
      isLoading ||
      !fromAmount ||
      !toAmount ||
      !shiftData ||
      !depositAddress ||
      Number.parseFloat(fromAmount) > Number.parseFloat(usdcBalance)
    );
  };

  return (
    <>
      {trxnApproval &&
        createPortal(
          <TransactionConfirmationPop
            trxnApproval={trxnApproval}
            settrxnApproval={setTrxnApproval}
            amount={fromAmount}
            symbol={"USDC"}
            toAddress={depositAddress}
            fromAddress={userAuth?.walletAddress}
            handleSend={executeDeposit}
          />,
          document.body
        )}

      {success &&
        createPortal(
          <TransactionSuccessPop
            success={success}
            setSuccess={setSuccess}
            symbol={"USDC"}
            hash={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/${hash}`}
          />,
          document.body
        )}
      <section className="py-3">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="bg-black/50 mx-auto max-w-[500px] rounded-xl p-3">
                <div className="top flex items-center justify-between">
                  <p className="m-0 font-medium">Deposit</p>
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
                          Base Network
                        </h6>
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base">
                          <span className="icn">
                            {bridgeDirection.from === "USDC" ? (
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
                          {bridgeDirection.from}
                        </button>
                        <h6 className="m-0 font-medium text-white/50">
                          Balance: {parseFloat(usdcBalance).toFixed(2)}{" "}
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
                          Ethereum Network
                        </h6>
                      </div>
                      <div className="right text-right">
                        <button className="px-2 py-1 flex items-center gap-2 text-base whitespace-nowrap">
                          <span className="icn">
                            <Image
                              src={
                                process.env.NEXT_PUBLIC_IMAGE_URL +
                                "tethergold.png"
                              }
                              alt="logo"
                              height={22}
                              width={22}
                              className="max-w-full object-contain w-auto smlogo"
                            />
                          </span>{" "}
                          {bridgeDirection.to}
                        </button>
                        <h6 className="m-0 font-medium text-white/50 whitespace-nowrap">
                          Balance: {parseFloat(tethergolgBalance).toFixed(6)}{" "}
                          {/* {bridgeDirection.to} */}
                          XAUT
                        </h6>
                      </div>
                    </div>
                  </div>

                  {/* Deposit address display */}
                  {depositAddress && (
                    <div className="mt-2 bg-black/30 rounded-lg p-2 text-xs">
                      {amountError && (
                        <div className="text-red-500 text-xs mt-1">
                          {amountError}
                        </div>
                      )}
                      <p className="m-0 text-amber-500">
                        Deposit Address: {depositAddress.slice(0, 10)}...
                        {depositAddress.slice(-8)}
                      </p>
                      <p className="m-0 text-green-500">
                        You will receive: {toAmount} PAXG
                      </p>
                    </div>
                  )}

                  <div className="mt-3 py-2">
                    <button
                      className={`flex btn rounded-xl items-center justify-center commonBtn w-full ${
                        isButtonDisabled() ? "opacity-70" : ""
                      }`}
                      onClick={() => setTrxnApproval(true)}
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

export default DepositSwap;

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
