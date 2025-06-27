import React, { useState } from "react";
import styled from "styled-components";
import "react-tooltip/dist/react-tooltip.css";
import LightningTab from "./LightningSendTab";
import QRScannerModal from "../../Modals/SendUsdcPop/qRScannerModal";

import Image from "next/image";
import { sendBitcoinFunction } from "@/utils/bitcoinSend";
import { useSelector } from "react-redux";
import { retrieveSecret } from "@/utils/webauthPrf";
import { fetchBitcoinBalance } from "@/pages/api/bitcoinBalance";
import { useEffect } from "react";
import TransactionConfirmationPop from "@/components/Modals/TransactionConfirmationPop";
import { createPortal } from "react-dom";
import TransactionSuccessPop from "@/components/Modals/TransactionSuccessPop";
import {
  isValidBitcoinAddress,
  filterAmountInput,
  filterHexInput,
} from "../../../utils/helper.js";
import TransactionFailedPop from "../TransactionFailedPop";

const BtcExchangeSendPop = ({
  sendUsdc,
  setSendUsdc,
  btcExchangeSend,
  setBtcExchangeSend,
  walletAddress,
  mint,
  userAddress,
  qrCode,
  loading,
  sendSdk,
  setLoading,
  startReceive,
  setDepositSetup,
  depositFound,
  setDepositFound,
}) => {
  const userAuth = useSelector((state) => state.Auth);

  const [tokenSend, setTokenSend] = useState();
  const [step, setStep] = useState(2);
  const [tab, setTab] = useState(0);
  const [btcAmount, setBtcAmount] = useState(0);
  const [btcAddress, setBtcAddress] = useState();
  const [loadingSend, setLoadingSend] = useState(false);
  const [recoveryAddress, setRecoveryAddress] = useState();
  const [openCam, setOpenCam] = useState(false);
  const [btcBalance, setBtcBalance] = useState("0");
  const [trxnApproval, setTrxnApproval] = useState(false);
  const [hash, setHash] = useState("");
  const [success, setSuccess] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [txError, setTxError] = useState("");
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState("");
  const [amountError, setAmountError] = useState("");

  const handleTab = (key) => {
    setTab(key);
  };

  const handleBTCExchangeSend = () => {
    try {
      setDepositSetup("");
      setDepositFound("");
      setBtcExchangeSend(!btcExchangeSend);
    } catch (error) {}
  };

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

  const recoverSeedPhrase = async () => {
    try {
      let data = JSON.parse(userAuth?.webauthKey);
      let callGetSecretData = await getSecretData(
        data?.storageKeySecret,
        data?.credentialIdSecret
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

  const sendNative = async () => {
    try {
      setLoadingSend(true);

      const privateKey = await recoverSeedPhrase();
      if (!privateKey) {
        return;
      }

      const satoshis = Math.round(parseFloat(btcAmount) * 100000000);

      const result = await sendBitcoinFunction({
        fromAddress: userAuth?.bitcoinWallet,
        toAddress: btcAddress,
        amountSatoshi: satoshis,
        privateKeyHex: privateKey?.wif,
        network: "main", // Use 'main' for mainnet
      });

      if (result.success) {
        setSuccess(true);
        setHash(result.transactionHash);
        setBtcAmount(0);
        setBtcAddress();
        setLoadingSend(false);
      } else {
        setFailed(true);
        setTxError("Transaction failed");
      }
      setLoadingSend(false);
    } catch (error) {
      setLoadingSend(false);
      setFailed(true);
      setTxError("Transaction failed");
    }
  };

  const fetchBalances = async () => {
    try {
      if (!userAuth?.walletAddress) return;

      const result = await fetchBitcoinBalance(
        userAuth?.bitcoinWallet
        // "1LtaUUB1QrPNmBAZ9qkCYeNw56GJu5NhG2"
      );

      if (result.balance) {
        setBtcBalance(result?.balance);
      }
    } catch (error) {
      setError("Failed to fetch Bitcoin balance");
    }
  };

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalances();
    }
  }, [userAuth?.walletAddress]);

  const isFormValid = () => {
    return (
      btcAddress?.trim() !== "" &&
      !addressError &&
      isValidBitcoinAddress(btcAddress) &&
      !amountError &&
      Number.parseFloat(btcAmount) > 0 &&
      Number.parseFloat(btcAmount) <= Number.parseFloat(btcBalance)
    );
  };

  // Update the button click handler
  const handleProceedToApproval = () => {
    if (!isFormValid()) {
      return; // Button should be disabled anyway
    }
    setTrxnApproval(!trxnApproval);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;

    // Filter input with 2 decimal places
    const filteredValue = filterAmountInput(value, 18, 20);
    setBtcAmount(filteredValue);

    if (!userAuth?.email) {
      setError("Please create account or login.");
      return;
    }

    // Validate amount
    if (filteredValue.trim() !== "") {
      if (Number.parseFloat(filteredValue) <= 0) {
        setAmountError("Amount must be greater than 0");
      } else if (
        Number.parseFloat(filteredValue) > Number.parseFloat(btcBalance)
      ) {
        setAmountError("Insufficient Bitcoin balance");
      }
      // else if (Number.parseFloat(balance) < 0.05) {
      //   setAmountError("Minimum balance of $0.05 required");
      // }
      else {
        setAmountError("");
      }
    } else {
      setAmountError("");
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value.trim();
    let filteredValue = "";

    // Match Bitcoin address patterns
    if (value.toLowerCase().startsWith("bc1p")) {
      filteredValue = filterHexInput(
        value,
        /[^bc1p023456789acdefghjklmnqrstuvwxyz]/g,
        62
      );
    } else if (value.toLowerCase().startsWith("bc1")) {
      filteredValue = filterHexInput(
        value,
        /[^bc1023456789acdefghjklmnqrstuvwxyz]/g,
        62
      );
    } else if (value.startsWith("1") || value.startsWith("3")) {
      filteredValue = filterHexInput(
        value,
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g,
        35
      );
    } else {
      filteredValue = filterHexInput(
        value,
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyzbc]/g,
        62
      );
    }
    setBtcAddress(filteredValue);

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
    let filteredValue = "";

    // Match Bitcoin address patterns
    if (value.toLowerCase().startsWith("bc1p")) {
      filteredValue = filterHexInput(
        value,
        /[^bc1p023456789acdefghjklmnqrstuvwxyz]/g,
        62
      );
    } else if (value.toLowerCase().startsWith("bc1")) {
      filteredValue = filterHexInput(
        value,
        /[^bc1023456789acdefghjklmnqrstuvwxyz]/g,
        62
      );
    } else if (value.startsWith("1") || value.startsWith("3")) {
      filteredValue = filterHexInput(
        value,
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g,
        35
      );
    } else {
      filteredValue = filterHexInput(
        value,
        /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyzbc]/g,
        62
      );
    }

    setBtcAddress(filteredValue);

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

  const tabData = [
    {
      title: "Native SegWit",
      component: (
        <>
          {" "}
          <div className="cardCstm text-center">
            {/* {step == 1 ? (
              <>
                <form action="">
                  <div className="grid gap-3 grid-cols-12">
                    <div className="col-span-12">
                      <input
                        type="text"
                        onChange={(e) => setRecoveryAddress(e.target.value)}
                        className="form-control text-xs rounded"
                        style={{ height: 45 }}
                        required
                      />
                    </div>
                    <div className="col-span-12">
                      <button
                        type="button"
                        onClick={submitAddress}
                        className="btn w-full flex itmes-center justify-center commonBtn"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : step == 2 && !depositFound ? (
              <>
                {loading ? (
                  <>
                    <Image
                      alt=""
                      src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                      height={10000}
                      width={10000}
                      className="max-w-full mx-auto w-auto"
                      style={{ height: 40 }}
                    />
                  </>
                ) : (
                  <>
                    <p className="m-0 text-xs text-center font-light text-gray-300 pb-4">
                      Bitcoin transaction confirmation typically takes 15 to 20
                      minutes to be processed on the blockchain.
                    </p>
                  </>
                )}
              </>
            ) : (
              <></>
            )} */}
            <>
              <p className="m-0 text-xs text-center font-light text-gray-300 pb-4">
                Bitcoin transaction confirmation typically takes 15 to 20
                minutes to be processed on the blockchain.
              </p>
            </>
            {openCam ? (
              <>
                {createPortal(
                  <QRScannerModal
                    setOpenCam={setOpenCam}
                    openCam={openCam}
                    onScan={(data) => {
                      handleProccessAddressChange(data);
                      // setBtcAddress(data);
                      setOpenCam(!openCam);
                    }}
                  />,
                  document.body
                )}
              </>
            ) : (
              <>
                <div className="py-2">
                  <div className="py-2">
                    <div className="flex items-center justify-between pb-1 px-3">
                      <label
                        htmlFor=""
                        className="form-label m-0 text-xs font-medium"
                      >
                        Amount
                      </label>
                      <span className="text-white opacity-60 text-xs">
                        Balance: {parseFloat(btcBalance).toFixed(8)} BTC
                      </span>
                    </div>
                    <div className="iconWithText relative">
                      <input
                        type="text"
                        value={btcAmount}
                        onChange={handleAmountChange}
                        className={` border-white/10 bg-white/4 font-normal hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full px-11`}
                      />
                    </div>
                    {amountError && (
                      <div className="text-red-500 text-xs mt-1">
                        {amountError}
                      </div>
                    )}
                  </div>
                  <div className="py-2">
                    <div className="flex items-center justify-between pb-1 px-3">
                      <label
                        htmlFor=""
                        className="form-label m-0 text-xs font-medium"
                      >
                        BTC Address
                      </label>
                    </div>
                    <div className="iconWithText relative">
                      <input
                        type="text"
                        value={btcAddress}
                        onChange={handleAddressChange}
                        className={` border-white/10 bg-white/4 font-normal hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full px-11`}
                      />
                      <button
                        onClick={() => {
                          setOpenCam(!openCam);
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

                    {error && (
                      <div className="text-red-500 text-xs mt-1">{error}</div>
                    )}
                  </div>
                  <div className="py-2 mt-4">
                    <button
                      onClick={handleProceedToApproval}
                      disabled={!isFormValid() || loadingSend}
                      className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      {loadingSend ? (
                        <Image
                          src={
                            process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"
                          }
                          alt={""}
                          height={100000}
                          width={10000}
                          className={
                            "max-w-full h-[40px] object-contain w-auto"
                          }
                        />
                      ) : (
                        "Send"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Lightning Network",
      component: <LightningTab walletAddress={walletAddress} />,
    },
  ];

  return (
    <>
      {failed &&
        createPortal(
          <TransactionFailedPop
            failed={failed}
            setFailed={setFailed}
            txError={txError}
          />,
          document.body
        )}

      {trxnApproval &&
        createPortal(
          <TransactionConfirmationPop
            trxnApproval={trxnApproval}
            settrxnApproval={setTrxnApproval}
            amount={btcAmount}
            symbol={"BTC"}
            toAddress={btcAddress}
            fromAddress={userAuth?.walletAddress}
            handleSend={sendNative}
          />,
          document.body
        )}

      {success &&
        createPortal(
          <TransactionSuccessPop
            success={success}
            setSuccess={setSuccess}
            symbol={"Bitcoin"}
            hash={`${process.env.NEXT_PUBLIC_BITCOIN_EXPLORER_URL}/${hash}`}
          />,
          document.body
        )}
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999] `}
      >
        {!openCam && (
          <button
            onClick={handleBTCExchangeSend}
            className="bg-[#0d1017] h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
            style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>
        )}

        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          {tokenSend ? (
            <>
              <div className="top pb-3">
                <h5 className="m-0 text-xl font-bold">Send Bitcoin</h5>
              </div>
              <div className="content p-3">
                <RadioList className="list-none ps-0 mb-0 flex items-center justify-center gap-3">
                  {tabData.map((data, key) => (
                    <div key={key} className="relative">
                      <button
                        onClick={() => handleTab(key)}
                        className={`${
                          tab == key && "active"
                        } flex items-center justify-center font-semibold btn`}
                      >
                        {data.title}
                      </button>
                    </div>
                  ))}
                </RadioList>
                <div className="tabContent pt-3">
                  {tabData.map((item, key) =>
                    tab === key ? <>{item.component}</> : <></>
                  )}
                </div>
                <div className="btnWrpper mt-3"></div>
              </div>
            </>
          ) : (
            <>
              <div className="top pb-3"></div>
              <div className="modalBody text-center">
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-12">
                    <button
                      onClick={() => {
                        setSendUsdc(!sendUsdc),
                          setBtcExchangeSend(!btcExchangeSend);
                      }}
                      className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      USDC
                    </button>
                  </div>
                  <div className="col-span-12">
                    <button
                      onClick={() => setTokenSend(!tokenSend)}
                      className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      Bitcoin
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  padding-bottom: 100px;
  .modalDialog {
    max-width: 500px !important;
    max-height: calc(100vh - 160px);
  }
`;

const RadioList = styled.ul`
  button {
    font-size: 12px;
    background: white;
    border-color: white;
    color: #000;
    border-radius: 35px;
  }
  input:checked + button,
  button.active {
    background: #df723b;
    border-color: #df723b;
    color: #000;
  }
`;
export default BtcExchangeSendPop;

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
