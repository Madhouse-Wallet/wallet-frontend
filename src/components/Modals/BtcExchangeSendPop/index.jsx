import React, { useState } from "react";
import styled from "styled-components";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";
import LightningTab from "./LightningSendTab";

import loader from "@/Assets/Images/loading.gif";
import Image from "next/image";
// css

// img

const BtcExchangeSendPop = ({
  btcExchangeSend,
  setBtcExchangeSend,
  walletAddress,
  qrCode,
  loading,
  setLoading,
  mint,
  startReceive,
  setDepositSetup,
  depositFound,
  setDepositFound,
  userAddress,
}) => {
  const [textToCopy, setTextToCopy] = useState(walletAddress);
  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });

  const [step, setStep] = useState(2);
  const [tab, setTab] = useState(0);
  const [recoveryAddress, setRecoveryAddress] = useState();
  // if (depositFound) {
  //   setStep(3)
  // }
  const handleCopy = async (address, type) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied((prev) => ({ ...prev, [type]: true }));
      setTimeout(
        () =>
          setIsCopied({
            one: false,
            two: false,
            three: false,
          }),
        2000
      ); // Reset the copied state after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  const splitAddress = (address, charDisplayed = 6) => {
    const firstPart = address.slice(0, charDisplayed);
    const lastPart = address.slice(-charDisplayed);
    return `${firstPart}...${lastPart}`;
  };

  const submitAddress = async () => {
    try {
      // () => {setStep(2); setLoading(true)}
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
                      src={loader}
                      height={10000}
                      width={10000}
                      className="max-w-full mx-auto w-auto"
                      style={{ height: 40 }}
                    />
                  </>
                ) : (
                  <>
                    <p className="m-0 text-xs text-center font-light text-gray-300 pb-4">
                      Use this generated address to send minimum 0.01 BTC, to
                      mint as tBTC.
                    </p>
                    <Image
                      src={qrCode}
                      height={10000}
                      width={10000}
                      className="max-w-full mx-auto h-auto w-auto"
                      style={{ height: 150 }}
                    />
                  </>
                )}
                {!loading && (
                  <>
                    {" "}
                    <div className="content mt-2" style={{ fontSize: 12 }}>
                      <div className="text-center py-5">
                        <h6 className="m-0 text-base pb-2">
                          Your Wallet Address
                        </h6>
                        <div className="flex max-w-full items-stretch rounded-4 border border-dashed border-white/5 bg-white/4 text-14 leading-none text-white/40 outline-none focus-visible:border-white/40">
                          <input
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content={walletAddress}
                            readOnly=""
                            className="block min-w-0 flex-1 appearance-none truncate bg-transparent py-1.5 pl-2.5 font-mono outline-none"
                            type="text"
                            defaultValue={walletAddress || "Wallet Address"}
                          />
                          <button
                            onClick={() => handleCopy(walletAddress, "one")}
                            className="rounded-4 px-1.5 ring-inset transition-colors hover:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            data-state="closed"
                          >
                            {copyIcn}
                          </button>
                        </div>
                        {isCopied?.one && (
                          <span style={{ marginLeft: "10px", color: "green" }}>
                            Copied!
                          </span>
                        )}
                      </div>
                      <div
                        data-orientation="horizontal"
                        role="none"
                        className="shrink-0 from-transparent via-white/10 to-transparent h-[1px] w-full bg-gradient-to-r mb-5"
                      />

                      <div className="grid gap-3 grid-cols-12 my-2 bg-white/5 p-3 rounded-10">
                        <div className="col-span-4 ">
                          <div className="cardCstm text-center bg-white/5">
                            <div className="top p-2 bg-white/5 ">
                              <span className="font-bold text-base block themeClr">
                                1 hour
                              </span>
                              <span className="text-xs font-light">
                                + 1 confirmation
                              </span>
                            </div>
                            <div className="bottom px-2 py-3">
                              <p className="m-0 text-base text-gray-500 font-medium">
                                {`<`} 0.10 <sub className="text-xs">BTC</sub>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-4 ">
                          <div className="cardCstm text-center bg-white/5">
                            <div className="top p-2 bg-white/5 ">
                              <span className="font-bold text-base block themeClr">
                                1.5 hours
                              </span>
                              <span className="text-xs font-light">
                                + 3 confirmations
                              </span>
                            </div>
                            <div className="bottom px-2 py-3">
                              <p className="m-0 text-base text-gray-500 font-medium">
                                {`<`} 1.00 <sub className="text-xs">BTC</sub>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-4 ">
                          <div className="cardCstm text-center bg-white/5">
                            <div className="top p-2 bg-white/5 ">
                              <span className="font-bold text-base block themeClr">
                                2 hours
                              </span>
                              <span className="text-xs font-light">
                                + 6 confirmations
                              </span>
                            </div>
                            <div className="bottom px-2 py-3">
                              <p className="m-0 text-base text-gray-500 font-medium">
                                {`≥`} 1.00 <sub className="text-xs">BTC</sub>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bottom pt-3">
                        <div className="bg-white/5 rounded-10 p-3">
                          <h6 className="m-0 font-bold text-base">
                            Provided Addresses Recap
                          </h6>
                          <ul className="list-none pl-0 mb-0">
                            <li className="py-1 flex items-center justify-between">
                              <span className=" text-xs text-white font-medium">
                                ETH Address
                              </span>
                              <Tooltip id="my-tooltip1" />
                              <div className="flex items-center gap-1">
                                <p
                                  className="m-0 text-truncate text-right text-white opacity-50"
                                  data-tooltip-id="my-tooltip1"
                                  data-tooltip-content={userAddress}
                                  style={{ maxWidth: 200 }}
                                >
                                  {splitAddress(userAddress)}
                                </p>

                                <button
                                  onClick={() => handleCopy(userAddress, "two")}
                                  className="border-0 p-0 bg-transparent"
                                >
                                  {copyIcn}
                                </button>
                                {isCopied?.two && (
                                  <span
                                    style={{
                                      marginLeft: "10px",
                                      color: "green",
                                    }}
                                  >
                                    Copied!
                                  </span>
                                )}
                              </div>
                            </li>
                            <li className="py-1 flex items-center justify-between">
                              <span className="text-xs text-white  font-medium">
                                BTC Recovery Address
                              </span>
                              <Tooltip id="my-tooltip1" />
                              <div className="flex items-center gap-1">
                                <p
                                  className="m-0 text-right text-truncate text-white opacity-50"
                                  data-tooltip-id="my-tooltip1"
                                  data-tooltip-content={
                                    "tb1q8sn2xmvgzg7jcakyz0ylmxt4mwtu0ne0qwl6zf"
                                  }
                                  style={{ maxWidth: 200 }}
                                >
                                  {splitAddress(
                                    "tb1q8sn2xmvgzg7jcakyz0ylmxt4mwtu0ne0qwl6zf"
                                  )}
                                </p>

                                <button
                                  onClick={() =>
                                    handleCopy(
                                      "tb1q8sn2xmvgzg7jcakyz0ylmxt4mwtu0ne0qwl6zf",
                                      "three"
                                    )
                                  }
                                  className="border-0 p-0 bg-transparent "
                                >
                                  {copyIcn}
                                </button>
                                {isCopied?.three && (
                                  <span
                                    style={{
                                      marginLeft: "10px",
                                      color: "green",
                                    }}
                                  >
                                    Copied!
                                  </span>
                                )}
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : depositFound ? (
              <>
                <div className="text-center p-3">
                  <div className="py-2 flex items-center justify-center">
                    {checkIcn}
                  </div>
                  <h2 className="m-0 text-green-500 text-base font-semibold">
                    Successfully
                  </h2>
                  <p className="m-0 py-1">
                    We have found deposit in generated address.
                  </p>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Lightning Network",
      component: <LightningTab walletAddress={walletAddress} />,
    },
    // { title: "Liquid Network", component: "asfsdf1233" },
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
          <div className={`relative hidden rounded`}>
            <div className="top pb-3">
              <h5 className="m-0 text-xl font-bold">
               Sendd Basdfasdfitcoin
              </h5>
              {/* <p className="m-0" style={{ fontSize: 12 }}>
              Generate a QR code or wallet address to receive Bitcoin Securely
            </p> */}
            </div>
            <div className="content">
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
            </div>
            {/* {step != 1 && !loading && (
              <div className="btnWRpper mt-4">
                <button
                  onClick={() => mint()}
                  className="d-flex align-items-center justify-content-center commonBtn w-100"
                >
                  Mint
                </button>
              </div>
            )} */}
          </div>
          <div className="top pb-3">
            <h5 className="m-0 text-xl font-bold">
             Send Bitcoin
            </h5>
            {/* <p className="m-0" style={{ fontSize: 12 }}>
              Generate a QR code or wallet address to receive Bitcoin Securely
            </p> */}
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

const qrCode = (
  <svg
    width="100"
    height="100"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13 14H14V15H13V14ZM14 15H15V16H14V15ZM14 16H15V17H14V16ZM16 16H17V17H16V16ZM16 17H17V18H16V17ZM13 16H14V17H13V16ZM15 16H16V17H15V16ZM15 17H16V18H15V17ZM18 16H19V17H18V16ZM18 15H19V16H18V15ZM19 14H20V15H19V14ZM17 16H18V17H17V16ZM17 17H18V18H17V17ZM16 18H17V19H16V18ZM15 18H16V19H15V18ZM17 18H18V19H17V18ZM18 18H19V19H18V18ZM16 19H17V20H16V19ZM14 19H15V20H14V19ZM15 19H16V20H15V19ZM13 19H14V20H13V19ZM13 20H14V21H13V20ZM14 21H15V22H14V21ZM15 21H16V22H15V21ZM17 21H18V22H17V21ZM18 21H19V22H18V21ZM17 19H18V20H17V19ZM18 19H19V20H18V19ZM19 18H20V19H19V18ZM19 17H20V18H19V17ZM19 20H20V21H19V20ZM19 19H20V20H19V19ZM20 18H21V19H20V18ZM20 17H21V18H20V17ZM21 20H22V21H21V20ZM21 18H22V19H21V18ZM21 19H22V20H21V19ZM19 16H20V17H19V16ZM13 17H14V18H13V17ZM12 17H13V18H12V17ZM12 18H13V19H12V18ZM14 18H15V19H14V18ZM11 18H12V19H11V18ZM13 18H14V19H13V18ZM11 19H12V20H11V19ZM11 20H12V21H11V20ZM11 1H12V2H11V1ZM12 2H13V3H12V2ZM11 4H12V5H11V4ZM12 5H13V6H12V5ZM11 6H12V7H11V6ZM12 6H13V7H12V6ZM12 7H13V8H12V7ZM12 8H13V9H12V8ZM11 9H12V10H11V9ZM12 9H13V10H12V9ZM11 10H12V11H11V10ZM1 11H2V12H1V11ZM2 12H3V13H2V12ZM4 11H5V12H4V11ZM4 12H5V13H4V12ZM5 11H6V12H5V11ZM6 12H7V13H6V12ZM7 11H8V12H7V11ZM8 12H9V13H8V12ZM8 11H9V12H8V11ZM9 11H10V12H9V11ZM10 11H11V12H10V11ZM11 12H12V13H11V12ZM13 12H14V13H13V12ZM14 11H15V12H14V11ZM15 11H16V12H15V11ZM16 11H17V12H16V11ZM15 13H16V14H15V13ZM13 22H14V23H13V22ZM12 22H13V23H12V22ZM12 13H13V14H12V13ZM11 13H12V14H11V13ZM11 14H12V15H11V14ZM11 15H12V16H11V15ZM22 14H23V15H22V14ZM21 15H22V16H21V15ZM22 17H23V18H22V17ZM17 13H18V14H17V13ZM18 12H19V13H18V12ZM22 12H23V13H22V12ZM22 13H23V14H22V13ZM21 13H22V14H21V13ZM22 21H23V22H22V21ZM21 22H22V23H21V22ZM19 22H20V23H19V22ZM22 22H23V23H22V22Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15 2H22V9H15V2ZM2 2H9V9H2V2ZM2 15H9V22H2V15ZM18 5H19V6H18V5ZM5 5H6V6H5V5ZM5 18H6V19H5V18Z"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
);

const copyIcn = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.60001 11.397C6.60001 8.671 6.60001 7.308 7.44301 6.461C8.28701 5.614 9.64401 5.614 12.36 5.614H15.24C17.955 5.614 19.313 5.614 20.156 6.461C21 7.308 21 8.671 21 11.397V16.217C21 18.943 21 20.306 20.156 21.153C19.313 22 17.955 22 15.24 22H12.36C9.64401 22 8.28701 22 7.44301 21.153C6.59901 20.306 6.60001 18.943 6.60001 16.217V11.397Z"
      fill="currentColor"
    />
    <path
      opacity="0.5"
      d="M4.172 3.172C3 4.343 3 6.229 3 10V12C3 15.771 3 17.657 4.172 18.828C4.789 19.446 5.605 19.738 6.792 19.876C6.6 19.036 6.6 17.88 6.6 16.216V11.397C6.6 8.671 6.6 7.308 7.443 6.461C8.287 5.614 9.644 5.614 12.36 5.614H15.24C16.892 5.614 18.04 5.614 18.878 5.804C18.74 4.611 18.448 3.792 17.828 3.172C16.657 2 14.771 2 11 2C7.229 2 5.343 2 4.172 3.172Z"
      fill="currentColor"
    />
  </svg>
);

const checkIcn = (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1_2)">
      <path
        d="M40 80C29.3913 80 19.2172 75.7857 11.7157 68.2843C4.21427 60.7828 0 50.6087 0 40C0 29.3913 4.21427 19.2172 11.7157 11.7157C19.2172 4.21427 29.3913 0 40 0C50.6087 0 60.7828 4.21427 68.2843 11.7157C75.7857 19.2172 80 29.3913 80 40C80 50.6087 75.7857 60.7828 68.2843 68.2843C60.7828 75.7857 50.6087 80 40 80ZM32 60L68 26L62 20L32 48L18 34L12 40L32 60Z"
        fill="#22C55E"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_2">
        <rect width="80" height="80" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

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
