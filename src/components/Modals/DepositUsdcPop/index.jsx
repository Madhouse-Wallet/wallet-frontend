import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { getProvider, getAccount } from "@/lib/zeroDev";
import { getUser, lbtcSat } from "../../../lib/apiCall.js";
import { retrieveSecret } from "@/utils/webauthPrf.js";
import { sendBitcoinFunction } from "@/utils/bitcoinSend.js";
import Image from "next/image";
import { parseAbi, parseUnits } from "viem";


import {
  getETHEREUMRpcProvider,
  getRpcProvider,
  publicClient,
} from "@/lib/zeroDev";
import { createUsdcToLbtcToShiftQuote, createLbtcToUsdcShiftQuote, createUsdcToLbtcToShiftFixed } from "@/pages/api/sideShiftAI";


const getSecretData = async (storageKey, credentialId) => {
  try {
    let retrieveSecretCheck = await retrieveSecret(storageKey, credentialId);
    if (retrieveSecretCheck?.status) {
      return {
        status: true,
        secret: retrieveSecretCheck?.data?.secret,
      };
    } else {
      return {
        status: false,
        msg: retrieveSecretCheck?.msg,
      };
    }
  } catch (error) {
    return {
      status: false,
      msg: "Error in Getting secret!",
    };
  }
};

const DepositUsdcPopup = ({ depositUsdcPop, setDepositUsdcPop }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState();
  const [error, setError] = useState("");
  const [commonError, setCommonError] = useState(false);
  const [usdcBalance, setTotalUsdBalance] = useState(0.0);
  const [providerr, setProviderr] = useState(null);
  const userAuth = useSelector((state) => state.Auth);
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS;

  const recoverSeedPhrase = async () => {
    try {
      let data = JSON.parse(userAuth?.webauthnData);
      let callGetSecretData = await getSecretData(
        data?.encryptedData,
        data?.credentialID
      );
      if (callGetSecretData?.status) {
        return JSON.parse(callGetSecretData?.secret);
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error in Fetching secret!", error);
      return false;
    }
  };


  const handleDepositPop = async () => {
    try {
      if (!userAuth?.login) {
        setError("Please Login!");
        return;
      }
      //  else if (amount > usdcBalance) {
      //   setError("Insufficient Balance");
      //   return;
      // }

      setLoading(true);
      setCommonError(false);
      if (!userAuth?.login) {
        setCommonError("Please Login!");
      } else {
        let userExist = await getUser(userAuth?.email);
        if (userExist.status && userExist.status == "failure") {
          setCommonError("Please Login!");
          setLoading(false);
          return;
        } else {
          if (!userExist?.userId?.bitcoinWallet) {
            setCommonError("No Bitcoin Wallet Found!");
            setLoading(false);
            return;
          }
          // const privateKey = await recoverSeedPhrase();
          // if (!privateKey) {
          //   setCommonError("No Private Key Found!");
          //   setLoading(false);
          //   return;
          // }
          let getQuoteUsdcToLbtc = await createUsdcToLbtcToShiftQuote(
            amount,
            process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
            process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
          )
          if (getQuoteUsdcToLbtc && getQuoteUsdcToLbtc?.settleAmount) {
            console.log("getQuoteUsdcToLbtc-->", getQuoteUsdcToLbtc.settleAmount)
            const sats = Math.round((getQuoteUsdcToLbtc.settleAmount) * 100000000)
            if (sats < 10000 || sats > 24000000) {
              setCommonError("Insufficient Amount!");
              setLoading(false);
              return;
            }
            const getBtcSat = await lbtcSat(
              getQuoteUsdcToLbtc.settleAmount,
              "lq1qqt9wfx8t52fd7qzn2w0mzjnaf2r0c5ke3gr8dprah8rffu2nhv6mt46lc83vy78jxfmllushw655p8k74mjhguepyphve4hvq",
              userExist?.userId?.lnbitId_3,
              userExist?.userId?.lnbitWalletId_3
            );
            console.log("getBtcSat-->", getBtcSat)
            if (getBtcSat.status && getBtcSat.status == "failure") {
              setCommonError(getBtcSat.message);
              setLoading(false);
            } else {
              // getBtcSat?.data?.expected_amount
              // createLbtcToUsdcShiftQuote

              let getQuoteLbtcToUsdc = await createLbtcToUsdcShiftQuote(
                (getBtcSat?.data?.expected_amount / 100000000).toFixed(8),
                process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
                process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
              )
              console.log("getQuoteLbtcToUsdc-->", getQuoteLbtcToUsdc)
              if (getQuoteLbtcToUsdc && getQuoteLbtcToUsdc?.settleAmount) {
                const totalAmount = Number(
                  (getQuoteLbtcToUsdc?.settleAmount * 1.08).toFixed(6)
                );
                console.log("totalAmount-->", totalAmount)
                getQuoteUsdcToLbtc = await createUsdcToLbtcToShiftQuote(
                  totalAmount,
                  process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
                  process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
                )
                console.log("final quote-->", getQuoteUsdcToLbtc.settleAmount);
                console.log(getQuoteUsdcToLbtc.settleAmount * 100000000, getBtcSat?.data?.expected_amount)
                if (usdcBalance < totalAmount) {
                  setCommonError(`Insufficient USDC balance. You need at least ${totalAmount} USDC for this transaction.`);
                  setLoading(false);
                } else {
                  let routeData = await createUsdcToLbtcToShiftFixed(
                    getQuoteUsdcToLbtc,
                    getBtcSat?.data?.address,
                    process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
                    process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
                  )
                  console.log("routeData-- usdc to lbtc", routeData)
                  setLoading(false);
                }

                return;
              } else {
                setCommonError("Please Try again After sometime!");
                setLoading(false);
                return;
              }
            }
          } else {
            setCommonError("Please Try again After sometime!");
            setLoading(false);
            return;
          }

          // const getBtcSat = await lbtcSat(
          //   amount,
          //   "lq1qqt9wfx8t52fd7qzn2w0mzjnaf2r0c5ke3gr8dprah8rffu2nhv6mt46lc83vy78jxfmllushw655p8k74mjhguepyphve4hvq",
          //   userExist?.userId?.lnbitId_3,
          //   userExist?.userId?.lnbitWalletId_3
          // );
          // if (getBtcSat.status && getBtcSat.status == "failure") {
          //   setCommonError(getBtcSat.message);
          //   setLoading(false);
          // } else {
          //   const satoshis = Math.round(parseFloat(amount) * 100000000);
          //   const btInSats = Math.floor(usdcBalance * 100000000);
          //   if (btInSats < getBtcSat?.data?.expected_amount) {
          //     const requiredBtc = (getBtcSat?.data?.expected_amount / 100000000).toFixed(8); // convert to BTC with precision
          //     setCommonError(`Insufficient BTC balance. You need at least ${requiredBtc} BTC for this transaction.`);
          //     setLoading(false);
          //     return;
          //   }
          //   const result = await sendBitcoinFunction({
          //     fromAddress: userExist?.userId?.bitcoinWallet,
          //     toAddress: getBtcSat?.data?.address,
          //     amountSatoshi: getBtcSat?.data?.expected_amount,
          //     privateKeyHex: privateKey?.wif,
          //     network: "main", // Use 'main' for mainnet
          //   });
          // if (result.status) {
          //   fetchUsdBalance();
          //   setLoading(false);
          // } else {
          //   setCommonError("Transaction Failed!");
          //   setLoading(false);
          // }
        }
      }
      setLoading(false);


    } catch (error) {
      setCommonError(error?.message);
      setLoading(false);
    }
  };

  const fetchUsdBalance = async () => {
    try {
      if (userAuth?.bitcoinWallet) {

        if (!userAuth?.walletAddress) return;

        const senderUsdcBalance = await publicClient.readContract({
          abi: parseAbi([
            "function balanceOf(address account) returns (uint256)",
          ]),
          address: USDC_ADDRESS,
          functionName: "balanceOf",
          args: [userAuth?.walletAddress],
        });
        const usdcBalance = String(
          Number(BigInt(senderUsdcBalance)) / Number(BigInt(1e6))
        );
        console.log("usdcBalance-->", usdcBalance)
        setTotalUsdBalance(
          parseFloat(usdcBalance) < 0.01
            ? "0"
            : parseFloat(usdcBalance).toFixed(2)
        );
      }
    } catch (error) {
      console.error("Error fetching lightning balance:", error);
    }
  };
  useEffect(() => {
    fetchUsdBalance();
  }, []);
  useEffect(() => {
    setCommonError(false);
  }, [amount]);

  const handleAmountInput = (e) => {
    const rawValue = e.target.value;

    // Allow only numbers and a single dot
    const numericValue = rawValue.replace(/[^0-9.]/g, "");

    // Prevent multiple dots
    const parts = numericValue.split(".");
    const cleanedValue =
      parts.length > 2
        ? parts[0] + "." + parts[1] // remove extra dots
        : numericValue;

    const numberValue = parseFloat(cleanedValue);

    setAmount(cleanedValue);

    // Validation
    if (!cleanedValue) {
      setError("Only numbers allowed");
    } else if (isNaN(numberValue)) {
      setError("Invalid number format");
    } else if (numberValue < 10.8) {
      setError("Minimum deposit is 10.8 USDC");
    } else if (numberValue > 21567) {
      setError("Maximum deposit is 21567 USDC");
    } else {
      setError("");
    }

  };

  useEffect(() => {
    const connectWallet = async () => {
      if (userAuth?.passkeyCred) {
        try {
          let account = await getAccount(userAuth?.passkeyCred);
          if (account) {
            let provider = await getProvider(account.kernelClient);
            if (provider) {
              setProviderr(provider?.ethersProvider);
            } else {
              throw new Error("Provider not detected");
            }
          }
        } catch (error) {
          console.error("Wallet connection error:", error);
        }
      }
    };

    connectWallet();
  }, [userAuth?.passkeyCred]);

  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] max-w-[400px] w-full`}
        >
          <button
            onClick={() => setDepositUsdcPop(!depositUsdcPop)}
            type="button"
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
          // style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>{" "}
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                Deposit USDC
              </h5>
            </div>
            <div className="modalBody">
              <form action="">
                <div className="py-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor=""
                      className="form-label m-0 font-semibold text-xs ps-3"
                    >
                      Enter Amount in USDC
                    </label>
                    {userAuth?.email && (
                      <label
                        htmlFor=""
                        className="form-label m-0 font-semibold text-xs ps-3"
                      >
                        Your Balance: {usdcBalance}
                      </label>
                    )}
                  </div>
                  <div className="iconWithText relative">
                    <input
                      type="text"
                      onChange={handleAmountInput}
                      value={amount}
                      className="border-white/10 bg-white/4 hover:bg-white/6 text-white/40 flex text-xs w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full"
                      placeholder="min: (0.00027), max: (0.24)"
                    />
                  </div>
                  {error && <p className="m-0 text-red-500">{error}</p>}
                  {commonError && (
                    <p className="m-0 text-red-500 pb-2 pt-3">{commonError}</p>
                  )}
                </div>

                <div className="btnWrpper mt-3">
                  <button
                    type="button"
                    className="flex items-center justify-center btn commonBtn w-full"
                    disabled={loading || error}
                    onClick={handleDepositPop}
                  >
                    {loading ? (
                      <Image
                        src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                        alt={""}
                        height={100000}
                        width={10000}
                        className={"max-w-full h-[40px] object-contain w-auto"}
                      />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  ${"" /* padding-bottom: 100px; */}

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 450px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default DepositUsdcPopup;

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
