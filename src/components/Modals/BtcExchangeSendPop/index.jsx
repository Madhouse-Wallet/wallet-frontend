import React, { useState } from "react";
import styled from "styled-components";
import "react-tooltip/dist/react-tooltip.css";
import { toast } from "react-toastify";
import LightningTab from "./LightningSendTab";
import { BigNumber } from "ethers";
import QRScannerModal from "../../Modals/SendUsdcPop/qRScannerModal";

import Image from "next/image";
import { sendBitcoinFunction } from "@/utils/bitcoinSend";
import { useSelector } from "react-redux";
import { getUser } from "@/lib/apiCall";
import { retrieveSecret } from "@/utils/webauthPrf";

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

  const submitAddress = async () => {
    try {
      if (recoveryAddress) {
        startReceive(recoveryAddress);
        setStep(2);
        setLoading(true);
      } else toast.error("Wow so easy!");
    } catch (error) {}
  };

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

  // const sendNative = async () => {
  //   try {
  //     setLoadingSend(true);
  //     if (!btcAmount) {
  //       setLoadingSend(false);
  //       return toast.error("Please Enter Valid Amount!");
  //     }
  //     if (!btcAddress) {
  //       setLoadingSend(false);
  //       return toast.error("Please Enter Valid Address!");
  //     }
  //     if (sendSdk) {
  //       try {
  //         const weiAmount = BigNumber.from((btcAmount * 1e18).toString()); // Convert to BigNumber with 18 decimals
  //         const { targetChainTxHash, walletPublicKey } =
  //           await sendSdk.redemptions.requestRedemption(
  //             btcAddress,
  //             weiAmount.toString()
  //           );
  //         toast.success("Send BTC Success!");
  //       } catch (error) {
  //         toast.error(error.message);
  //       }
  //     } else {
  //       toast.error("Please Login!");
  //     }
  //     setLoadingSend(false);
  //   } catch (error) {
  //     setLoadingSend(false);
  //     toast.error(error.message);
  //   }
  // };
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
      let userExist = await getUser(userAuth?.email);
      if (
        userExist?.userId?.secretCredentialId &&
        userExist?.userId?.secretStorageKey
      ) {
        let callGetSecretData = await getSecretData(
          userExist?.userId?.secretStorageKey,
          userExist?.userId?.secretCredentialId
        );
        if (callGetSecretData?.status) {
          return JSON.parse(callGetSecretData?.secret);
        } else {
          return false;
        }
      }
    } catch (error) {
      console.log("Error in Fetching secret!", error);
      return false;
    }
  };

  const sendNative = async () => {
    try {
      setLoadingSend(true);
      if (!btcAmount) {
        setLoadingSend(false);
        return toast.error("Please Enter Valid Amount!");
      }
      if (!btcAddress) {
        setLoadingSend(false);
        return toast.error("Please Enter Valid Address!");
      }
      console.log("btcAddress", btcAddress, btcAmount);

      const privateKey = await recoverSeedPhrase();
      if (!privateKey) {
        toast.error("Please enter a valid amount");
        return;
      }

      const result = await sendBitcoinFunction({
        fromAddress: userAuth?.bitcoinWallet,
        toAddress: btcAddress,
        amountSatoshi: btcAmount * 100000000,
        privateKeyHex: privateKey?.privateKey,
        network: "main", // Use 'main' for mainnet
      });

      if (result.success) {
        toast.success("BTC sent successfully!");
      } else {
        toast.error(result.error || "Transaction failed");
      }
      setLoadingSend(false);
    } catch (error) {
      setLoadingSend(false);
      toast.error(error.message);
    }
  };

  const tabData = [
    {
      title: "Native SegWit",
      component: (
        <>
          {" "}
          <div className="cardCstm text-center">
            {step == 1 ? (
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
                      Unminting requires one Ethereum transaction and it takes
                      around 3-5 hours.
                    </p>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
            {openCam ? (
              <>
                <QRScannerModal
                  setOpenCam={setOpenCam}
                  openCam={openCam}
                  onScan={(data) => {
                    setBtcAddress(data);
                    setOpenCam(!openCam);
                  }}
                />
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
                        Balance: 0 tBTC
                      </span>
                    </div>
                    <div className="iconWithText relative">
                      <input
                        type="number"
                        value={btcAmount}
                        onChange={(e) => setBtcAmount(e.target.value)}
                        className={` border-white/10 bg-white/4 font-normal hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full px-11`}
                      />
                      <button
                        className={`absolute icn right-2 bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 inline-flex h-[38px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Max
                      </button>
                    </div>
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
                        onChange={(e) => setBtcAddress(e.target.value)}
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
                  </div>
                  <div className="py-2 mt-4">
                    <button
                      onClick={sendNative}
                      // disabled={loadingSend}
                      className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      {loadingSend ? "Please Wait ..." : "Send"}
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
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999] `}
      >
        <button
          onClick={handleBTCExchangeSend}
          className="bg-[#0d1017] h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </button>
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
