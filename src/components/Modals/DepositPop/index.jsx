import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { getProvider, getAccount } from "@/lib/zeroDev";
import { getUser, btcSat } from "../../../../src/lib/apiCall";
import { retrieveSecret } from "@/utils/webauthPrf.js";
import { sendBitcoinFunction } from "@/utils/bitcoinSend.js";
import Image from "next/image";
import { fetchBitcoinBalance } from "@/pages/api/bitcoinBalance";
import { bitcoinGasFeeFunction } from "@/utils/bitcoinGasFee";
import TransactionSuccessPop from "../TransactionSuccessPop/index.jsx";
import { createPortal } from "react-dom";

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

const DepositPopup = ({ depositPop, setDepositPop }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState();
  const [error, setError] = useState("");
  const [commonError, setCommonError] = useState(false);
  const [bitcoinBalance, setBitcoinBalance] = useState(0.0);
  const [providerr, setProviderr] = useState(null);
  const userAuth = useSelector((state) => state.Auth);
  const [gasPriceError, setGasPriceError] = useState("");
  const [gasPrice, setGasPrice] = useState(null);
  const [success, setSuccess] = useState(false);

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
      } else if (!amount) {
        setError("Minimum deposit is 0.00027 BTC");
        return;
      } else if (amount < 0.00027) {
        setError("Minimum deposit is 0.00027 BTC");
        return;
      } else if (amount > 0.25) {
        setError("Maximum deposit is 0.25 BTC");
        return;
      } else if (amount > bitcoinBalance) {
        setError("Insufficient Balance");
        return;
      }

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
          const privateKey = await recoverSeedPhrase();
          if (!privateKey) {
            setCommonError("No Private Key Found!");
            setLoading(false);
            return;
          }
          const getBtcSat = await btcSat(
            amount,
            userExist?.userId?.bitcoinWallet,
            userExist?.userId?.lnbitId_3,
            userExist?.userId?.lnbitWalletId_3
          );
          if (getBtcSat.status && getBtcSat.status == "failure") {
            setCommonError(getBtcSat.message);
            setLoading(false);
          } else {
            const satoshis = Math.round(parseFloat(amount) * 100000000);
            const btInSats = Math.floor(bitcoinBalance * 100000000);

            const gasCalulate = await bitcoinGasFeeFunction({
              fromAddress: userExist?.userId?.bitcoinWallet,
              toAddress: getBtcSat?.data?.address,
              amountSatoshi: getBtcSat?.data?.expected_amount,
              privateKeyHex: privateKey?.wif,
              network: "main", // Use 'main' for mainnet
            });

            if (gasCalulate.success === false) {
              setLoading(false);

              const allNumbers =
                gasCalulate?.error?.errors?.[0]?.error?.match(/-?\d+/g);
              const missingSats = allNumbers
                ? parseInt(allNumbers[allNumbers.length - 1])
                : 0;
              setGasPriceError(
                `Insufficient balance. You're short by ${(Math.abs(missingSats) / 1e8).toFixed(8)} BTC to cover the amount and network fee.`
              );
              return;
            }
            const gasFeeSats = gasCalulate.details.tx.fees;

            const gasFeeBTC = gasFeeSats / 100000000;
            const btcAmount = getBtcSat?.data?.expected_amount / 100000000;
            setGasPrice(gasFeeBTC);
            const totalRequired = parseFloat(btcAmount) + gasFeeBTC;

            if (totalRequired > Number.parseFloat(bitcoinBalance)) {
              setGasPriceError(
                `Insufficient balance. Required: ${totalRequired.toFixed(8)} BTC (Amount: ${btcAmount} + Network Fee: ${gasFeeBTC.toFixed(8)})`
              );
              setLoading(false);
              return;
            }

            if (btInSats < getBtcSat?.data?.expected_amount) {
              const requiredBtc = (
                getBtcSat?.data?.expected_amount / 100000000
              ).toFixed(8); // convert to BTC with precision
              setCommonError(
                `Insufficient BTC balance. You need at least ${requiredBtc} BTC for this transaction.`
              );
              setLoading(false);
              return;
            }

            const result = await sendBitcoinFunction({
              fromAddress: userExist?.userId?.bitcoinWallet,
              toAddress: getBtcSat?.data?.address,
              amountSatoshi: getBtcSat?.data?.expected_amount,
              privateKeyHex: privateKey?.wif,
              network: "main", // Use 'main' for mainnet
            });
            if (result.success) {
              fetchBtcBalance();
              setLoading(false);
              setSuccess(true)
            } else {
              setCommonError("Transaction Failed!");
              setLoading(false);
            }
          }
        }
      }

      setLoading(false);
    } catch (error) {
      setCommonError(error?.message);
      setLoading(false);
    }
  };

  const fetchBtcBalance = async () => {
    try {
      if (userAuth?.bitcoinWallet) {
        const result = await fetchBitcoinBalance(
          userAuth?.bitcoinWallet
          // "bc1q3hk4hmaqa2vdur53sx6vx56dg8pnxw2smj85v4"
        );

        if (result?.error) {
          console.error("Error fetching BTC balance:", result.error);
          return;
        }
        setBitcoinBalance(
          result?.balance !== 0 ? (result?.balance).toFixed(8) : 0
        ); // <-- e.g., "$3250.47"
      }
    } catch (error) {
      console.error("Error fetching lightning balance:", error);
    }
  };
  useEffect(() => {
    fetchBtcBalance();
  }, []);
  useEffect(() => {
    setCommonError(false);
  }, [amount]);

  const handleAmountInput = (e) => {
    const rawValue = e.target.value;

    setGasPrice(null);
    setGasPriceError("");

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
    } else if (numberValue < 0.00027) {
      setError("Minimum deposit is 0.00027 BTC");
    } else if (numberValue > 0.24) {
      setError("Maximum deposit is 0.24 BTC");
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
      {success &&
        createPortal(
          <TransactionSuccessPop
            success={success}
            setSuccess={setSuccess}
            symbol={"Bitcoin"}
            hash={''}
          />,
          document.body
        )}
      {!success && <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] max-w-[400px] w-full`}
        >
          <button
            onClick={() => setDepositPop(!depositPop)}
            type="button"
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
          // style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>{" "}
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                Deposit Bitcoin
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
                      Enter Amount in BTC
                    </label>
                    {userAuth?.email && (
                      <label
                        htmlFor=""
                        className="form-label m-0 font-semibold text-xs ps-3"
                      >
                        Your Balance: {bitcoinBalance}
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

                {gasPriceError && (
                  <div className="text-red-500 text-xs">{gasPriceError}</div>
                )}

                {gasPrice && (
                  <label className="form-label m-0 font-semibold text-xs block">
                    Estimated Max Gas Fee: {gasPrice} USDC
                  </label>
                )}
              </form>
            </div>
          </div>
        </div>
      </Modal>}
    </>
  );
};

const Modal = styled.div`
  ${"" /* padding-bottom: 100px; */}

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 450px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default DepositPopup;

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
        fill="currentColor"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="currentColor"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);
