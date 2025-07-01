import React, { useEffect, useState } from "react";
import {
  getProvider,
  getAccount,
  publicClient,
  usdc,
  sendTransaction,
  USDC_ABI,
  calculateGasPriceInUSDC,
} from "@/lib/zeroDev";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import TransactionApprovalPop from "@/components/Modals/TransactionApprovalPop";
import LoadingScreen from "@/components/LoadingScreen";
import QRScannerModal from "../SendUsdcPop/qRScannerModal";
import { createUsdcToBtcShift } from "@/pages/api/sideShiftAI.ts";
import styled from "styled-components";
import { retrieveSecret } from "@/utils/webauthPrf.js";
import { parseAbi, parseUnits } from "viem";
import Image from "next/image.js";
import {
  isValidBitcoinAddress,
  filterAmountInput,
} from "../../../utils/helper.js";
import TransactionFailedPop from "../TransactionFailedPop/index.jsx";

const RefundBitcoin = ({
  refundBTC,
  setRefundBTC,
  success,
  setSuccess,
  setHash,
}) => {
  const userAuth = useSelector((state) => state.Auth);
  const [toAddress, setToAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [trxnApproval, setTrxnApproval] = useState(false);
  const [amount, setAmount] = useState("");
  const [openCam, setOpenCam] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [providerr, setProviderr] = useState(null);
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [txError, setTxError] = useState("");
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState("");
  const [swapType, setSwapType] = useState("");
  const [gasPrice, setGasPrice] = useState(null);
  const [gasPriceError, setGasPriceError] = useState("");

  const handleAmountChange = async (e) => {
    setError("");
    setToAmount("");
    setGasPriceError("");
    setSwapType("");
    setGasPrice(null);
    const value = e.target.value;

    const filteredValue = filterAmountInput(value, 2);
    setAmount(filteredValue);
    if (!userAuth?.email) {
      setError("Please create account or login.");
      return;
    }
    // Validate amount
    if (filteredValue.trim() !== "") {
      if (Number.parseFloat(filteredValue) <= 0) {
        setAmountError("Amount must be greater than 0");
      } else if (
        Number.parseFloat(filteredValue) > Number.parseFloat(balance)
      ) {
        setAmountError("Insufficient USDC balance");
      } else if (Number.parseFloat(balance) < 0.01) {
        setAmountError("Minimum balance of $0.01 required");
      } else {
        setAmountError("");
      }
    } else {
      setAmountError("");
    }

    if (filteredValue && !Number.isNaN(Number.parseFloat(filteredValue))) {
      const timer = setTimeout(async () => {
        setIsLoading(true);
        setError(""); // Clear previous errors
        setSwapType(""); // Clear previous provider

        try {
          // First, always try getDestinationAddress
          let shiftResult = null;
          let shouldTrySwapkit = false;

          try {
            shiftResult = await getDestinationAddress(filteredValue, toAddress);

            if (shiftResult) {
              // Success with getDestinationAddress
              setDestinationAddress(shiftResult.depositAddress);
              setToAmount(shiftResult.settleAmount);
              setSwapType("Sideshift");
            }
          } catch (shiftError) {
            // Check if it's the "Amount too high" error - check the message property
            const isAmountTooHighError =
              shiftError?.message?.includes("Amount too high") ||
              shiftError?.toString()?.includes("Amount too high");

            if (isAmountTooHighError) {
              // Only try Swapkit for "Amount too high" error
              shouldTrySwapkit = true;
            } else {
              // For other errors, show error and don't try Swapkit
              setError(
                shiftError?.message || "Failed to get quotes from Sideshift"
              );
              setSwapType("Sideshift");
            }
          }

          // Try Swapkit if Sideshift failed
          if (shouldTrySwapkit) {
            let quoteAttempts = 0;
            const maxQuoteAttempts = 3;
            let swapkitSuccess = false;

            while (quoteAttempts < maxQuoteAttempts && !swapkitSuccess) {
              try {
                quoteAttempts++;

                const quoteResult = await getQuote(filteredValue);

                if (quoteResult) {
                  setDestinationAddress(quoteResult.estimatedDepositAddress);
                  setToAmount(quoteResult.estimate);
                  setSwapType("Swapkit");
                  setError(""); // Clear any previous error since getQuote succeeded
                  swapkitSuccess = true;
                  break;
                }
              } catch (quoteError) {
                console.log(
                  `Swapkit attempt ${quoteAttempts} failed:`,
                  quoteError
                );

                if (quoteAttempts >= maxQuoteAttempts) {
                  // After 3 attempts, set the error
                  setSwapType("Swapkit");
                  setError(
                    "Failed to get quotes from Swapkit after multiple attempts"
                  );
                }
              }
            }
          }
        } catch (err) {
          setError("Failed to fetch quotes");
        } finally {
          setIsLoading(false);
        }
      }, 2000);

      setDebounceTimer(timer);
    } else {
      setToAmount("");
      setQuote(null);
      setDestinationAddress("");
    }
  };
  const handleClose = () => setRefundBTC(false);

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
          destinationAddress: toAddress || userAuth?.bitcoinWallet,
        }),
      });

      const data = await response.json();
      setQuote(data);
      return {
        ...data,
        estimatedDepositAddress: data?.routes[0].targetAddress,
        estimate: data?.routes[0].expectedBuyAmount,
      };
    } catch (error) {
      // Remove internal retry logic - let the caller handle retries
      throw error;
    }
  };

  const getDestinationAddress = async (amount, bitcoinAddress) => {
    try {
      const shift = await createUsdcToBtcShift(
        amount,
        bitcoinAddress || userAuth?.bitcoinWallet,
        process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
        process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
      );
      setQuote(shift);
      return {
        depositAddress: shift.depositAddress,
        settleAmount: Number.parseFloat(shift.settleAmount || 0),
      };
    } catch (error) {
      throw error;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!isValidAddress) {
      setError("Please enter a valid Bitcoin address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError("Insufficient USDC balance");
      return;
    }

    const data = JSON.parse(userAuth?.webauthKey);
    const retrieveSecretCheck = await retrieveSecret(
      data?.storageKeyEncrypt,
      data?.credentialIdEncrypt
    );
    if (!retrieveSecretCheck?.status) {
      return;
    }

    const secretData = JSON.parse(retrieveSecretCheck?.data?.secret);

    setIsLoading(true);
    setGasPriceError("");
    try {
      const getAccountCli = await getAccount(
        secretData?.privateKey,
        secretData?.safePrivateKey
      );
      if (!getAccountCli.status) {
        return;
      }

      const gasPriceResult = await calculateGasPriceInUSDC(
        getAccountCli?.kernelClient,
        [
          {
            to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [destinationAddress, parseUnits(amount.toString(), 6)],
          },
        ]
      );

      // Round gas price to 2 decimals
      const value = Number.parseFloat(gasPriceResult.formatted);
      const roundedGasPrice = (Math.ceil(value * 100) / 100).toFixed(2);
      setGasPrice(roundedGasPrice);

      // Check if amount + gas price exceeds balance
      const totalRequired =
        Number.parseFloat(amount) + Number.parseFloat(roundedGasPrice);

      if (totalRequired > Number.parseFloat(balance)) {
        setGasPriceError(
          `Insufficient balance. Required: ${totalRequired.toFixed(2)} USDC (Amount: ${amount} + Max Gas Fee: ${roundedGasPrice})`
        );
        setIsLoading(false);
        return;
      }

      const tx = await sendTransaction(getAccountCli?.kernelClient, [
        {
          to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [destinationAddress, parseUnits(amount.toString(), 6)],
        },
      ]);

      if (tx && !tx.error) {
        setHash(tx);
        setSuccess(true);
        setRefundBTC(false);
        setTimeout(fetchBalance, 2000);
      } else {
        setFailed(true);
        setTxError(tx.error || tx);
      }
    } catch (error) {
      setTxError({
        message: error.message || "Transaction failed",
        type: "UNKNOWN_ERROR",
      });
      setFailed(!failed);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balance when provider and account are available
  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalance();
    }
  }, [userAuth?.walletAddress]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const fetchBalance = async () => {
    try {
      if (!userAuth?.walletAddress) return;

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
      if (balance) {
        setBalance(balance);
      } else {
        setError("Failed to fetch USDC balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Failed to fetch USDC balance");
    }
  };

  const initiateSwap = async () => {
    if (!toAddress) {
      setError("Please enter a Bitcoin address.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setIsLoading(true);
    try {
      if (destinationAddress && toAmount) {
        setTrxnApproval(true);
      } else {
        setError("Failed to get destination address. Please try again.");
      }
    } catch (error) {
      setError(error.message || "Failed to initiate swap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = () => {
    return (
      !toAddress ||
      !amount ||
      isLoading ||
      gasPriceError ||
      parseFloat(amount) <= 0 ||
      parseFloat(amount) > parseFloat(balance) ||
      !destinationAddress
    );
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
    if (!toAddress || !amount) return "Enter an amount";
    if (parseFloat(amount) > parseFloat(balance))
      return "Insufficient USDC Balance";
    if (!destinationAddress) return "Get Quote";
    return "Refund Bitcoin";
  };

  const handleAddressChange = (e) => {
    const value = e.target.value.trim();

    // Smart filtering based on Bitcoin address patterns
    let filteredValue = "";

    if (value.toLowerCase().startsWith("bc1p")) {
      // Taproot addresses (P2TR): bc1p + 58 chars (bech32 charset)
      filteredValue = value.replace(
        /[^bc1p023456789acdefghjklmnqrstuvwxyz]/g,
        ""
      );
    } else if (value.toLowerCase().startsWith("bc1")) {
      // Bech32 SegWit addresses (P2WPKH/P2WSH): bc1 + bech32 charset
      filteredValue = value.replace(
        /[^bc1023456789acdefghjklmnqrstuvwxyz]/g,
        ""
      );
    } else if (value.startsWith("1")) {
      // Legacy addresses (P2PKH): starts with 1 + Base58
      filteredValue = value.replace(
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g,
        ""
      );
    } else if (value.startsWith("3")) {
      // Script addresses (P2SH): starts with 3 + Base58
      filteredValue = value.replace(
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g,
        ""
      );
    } else {
      // For any other input, allow Base58 + bech32 characters to let validation handle it
      filteredValue = value.replace(
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyzbc]/g,
        ""
      );
    }

    // Additional length constraints to prevent obviously invalid addresses
    if (filteredValue.length > 62) {
      filteredValue = filteredValue.substring(0, 62); // Max Bitcoin address length
    }

    setToAddress(filteredValue);

    // Validate address format (only if not empty)
    if (filteredValue.trim() !== "") {
      if (!isValidBitcoinAddress(filteredValue)) {
        setAddressError("Invalid Bitcoin address format");
      } else {
        setAddressError("");
      }
    } else {
      setAddressError("");
    }
  };

  const handleProccessAddressChange = (value) => {
    // const value = e.target.value.trim();

    // Smart filtering based on Bitcoin address patterns
    let filteredValue = "";

    if (value.toLowerCase().startsWith("bc1p")) {
      // Taproot addresses (P2TR): bc1p + 58 chars (bech32 charset)
      filteredValue = value.replace(
        /[^bc1p023456789acdefghjklmnqrstuvwxyz]/g,
        ""
      );
    } else if (value.toLowerCase().startsWith("bc1")) {
      // Bech32 SegWit addresses (P2WPKH/P2WSH): bc1 + bech32 charset
      filteredValue = value.replace(
        /[^bc1023456789acdefghjklmnqrstuvwxyz]/g,
        ""
      );
    } else if (value.startsWith("1")) {
      // Legacy addresses (P2PKH): starts with 1 + Base58
      filteredValue = value.replace(
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g,
        ""
      );
    } else if (value.startsWith("3")) {
      // Script addresses (P2SH): starts with 3 + Base58
      filteredValue = value.replace(
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g,
        ""
      );
    } else {
      // For any other input, allow Base58 + bech32 characters to let validation handle it
      filteredValue = value.replace(
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyzbc]/g,
        ""
      );
    }

    // Additional length constraints to prevent obviously invalid addresses
    if (filteredValue.length > 62) {
      filteredValue = filteredValue.substring(0, 62); // Max Bitcoin address length
    }

    setToAddress(filteredValue);

    // Validate address format (only if not empty)
    if (filteredValue.trim() !== "") {
      if (!isValidBitcoinAddress(filteredValue)) {
        setAddressError("Invalid Bitcoin address format");
      } else {
        setAddressError("");
      }
    } else {
      setAddressError("");
    }
  };

  return (
    <>
      {failed &&
        createPortal(
          <TransactionFailedPop
            failed={failed}
            setFailed={setFailed}
            txError={txError?.details?.shortMessage}
          />,
          document.body
        )}

      {trxnApproval &&
        createPortal(
          <TransactionApprovalPop
            trxnApproval={trxnApproval}
            settrxnApproval={setTrxnApproval}
            amount={amount}
            toAddress={destinationAddress}
            handleSend={handleSend}
            handleClose={handleClose}
            showNetwork={false}
            swapInfo={{
              from: "USDC",
              to: "BTC",
              fromAmount: amount,
              toAmount: toAmount,
              toAddress: toAddress,
            }}
          />,
          document.body
        )}
      {/* {isLoading && <LoadingScreen />} */}
      <Modal className="fixed inset-0 flex items-center justify-center cstmModal z-[99999]">
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div className="modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20 z-10">
          {!openCam && (
            <button
              onClick={handleClose}
              className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
              // style={{ border: "1px solid #5f5f5f59" }}
            >
              {closeIcn}
            </button>
          )}
          <div className="relative rounded px-3">
            <div className="top py-3 mb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                Refund Bitcoin
                {swapType && (
                  <div className="text-[14px] pt-2 text-white/70">
                    Powered by {swapType}
                  </div>
                )}
              </h5>
            </div>

            {openCam ? (
              <>
                <QRScannerModal
                  setOpenCam={setOpenCam}
                  openCam={openCam}
                  onScan={(data) => {
                    handleProccessAddressChange(data);
                    // setToAddress(data);
                    setOpenCam(!openCam);
                  }}
                />
              </>
            ) : (
              <>
                <div className="modalBody">
                  <div className="py-2">
                    <label className="form-label m-0 font-semibold text-xs ps-3">
                      To (Bitcoin Address)
                    </label>
                    <div className="relative">
                      <input
                        placeholder="Bitcoin Address"
                        type="text"
                        value={toAddress}
                        onChange={handleAddressChange}
                        className="border-white/10 bg-white/4 hover:bg-white/6 text-white/40 flex text-xs w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full"
                      />
                      {/* QR Scanner Button */}
                      <button
                        onClick={() => {
                          if (openCam) {
                            setOpenCam(false);
                          } else {
                            setOpenCam(true);
                          }
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                      >
                        {scanIcn}
                      </button>
                    </div>
                    {addressError && (
                      <div className="text-red-500 text-xs mt-1">
                        {addressError}
                      </div>
                    )}
                  </div>
                  <div className="py-2">
                    <div className="iconWithText relative">
                      <div className="absolute icn left-2 flex items-center gap-2 text-xs">
                        {usdcIcn}
                        USDC
                      </div>
                      <input
                        placeholder="Amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        disabled={isLoading}
                        className="border-white/10 bg-white/4 hover:bg-white/6 text-white/40 flex text-xs w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full pl-20"
                      />
                    </div>

                    {amountError && (
                      <div className="text-red-500 text-xs mt-1">
                        {amountError}
                      </div>
                    )}

                    <label className="form-label m-0 font-semibold text-xs ps-3">
                      Balance:{" "}
                      {Number(balance) < 0.01
                        ? "0"
                        : Number.parseFloat(balance).toFixed(2)}{" "}
                      USDC
                    </label>

                    {error && toAmount === "" && (
                      <div className="text-red-500 text-xs mt-1">{error}</div>
                    )}
                  </div>

                  {toAmount && (
                    <div className="py-2">
                      <label className="form-label m-0 font-semibold text-xs ps-3">
                        You will receive:
                      </label>
                      <div className="iconWithText relative">
                        <div className="absolute icn left-2 flex items-center gap-2 text-xs">
                          {btcIcn}
                          BTC
                        </div>
                        <input
                          type="text"
                          value={toAmount}
                          disabled
                          className="border-white/10 bg-white/4 hover:bg-white/6 text-white/40 flex text-xs w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full pl-20"
                        />
                      </div>
                    </div>
                  )}

                  <div className="ps-3 flex flex-col gap-1 mt-2">
                    {gasPrice && (
                      <label className="form-label m-0 font-semibold text-xs block">
                        Estimated Max Gas Fee: {gasPrice} USDC
                      </label>
                    )}

                    {gasPriceError && (
                      <div className="text-red-500 text-xs">
                        {gasPriceError}
                      </div>
                    )}
                  </div>

                  <div className="py-2 mt-4">
                    <button
                      type="button"
                      onClick={() => initiateSwap()}
                      disabled={isButtonDisabled()}
                      className={`flex btn rounded-xl items-center justify-center commonBtn w-full ${
                        isButtonDisabled() ? "opacity-70" : ""
                      }`}
                    >
                      {getButtonText()}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RefundBitcoin;

const Modal = styled.div`
  ${"" /* padding-bottom: 100px; */}

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 550px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

const closeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 15"
    fill="none"
  >
    <g clip-path="url(#clip0_0_6282)">
      <path
        d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
        fill="var(--textColor)"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="var(--textColor)"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="var(--textColor)"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);

const usdcIcn = (
  <svg
    width="16"
    height="16"
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

const scanIcn = (
  <svg
    height={24}
    width={24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path
      d="m62 215c-8 0-15-7-15-16l0-47c0-56 45-101 100-101l48 0c9 0 16 7 16 16 0 9-7 16-16 16l-48 0c-38 0-69 31-69 69l0 47c0 9-7 16-16 16z m379 0c-9 0-16-7-16-16l0-47c0-38-31-69-69-69l-48 0c-9 0-16-7-16-16 0-9 7-16 16-16l48 0c55 0 100 45 100 101l0 47c0 9-7 16-15 16z m-85 246l-29 0c-9 0-16-7-16-16 0-9 7-16 16-16l29 0c38 0 69-31 69-69l0-28c0-9 7-16 16-16 8 0 15 7 15 16l0 28c0 56-45 101-100 101z m-161 0l-48 0c-55 0-100-45-100-101l0-47c0-9 7-16 15-16 9 0 16 7 16 16l0 47c0 38 31 69 69 69l48 0c8 0 16 7 16 16 0 9-7 16-16 16z m189-221l-265 0c-9 0-16 7-16 16 0 9 7 16 16 16l265 0c9 0 16-7 16-16 0-9-7-16-16-16z m-237 56l0 6c0 34 28 62 62 62l86 0c34 0 61-28 61-62l0-6c0-3-2-5-4-5l-201 0c-2 0-4 2-4 5z m0-80l0-6c0-34 28-62 62-62l86 0c34 0 61 28 61 62l0 6c0 3-2 5-4 5l-201 0c-2 0-4-2-4-5z"
      fill="white"
    />
  </svg>
);

const btcIcn = (
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
