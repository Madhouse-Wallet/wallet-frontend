import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "react-tooltip/dist/react-tooltip.css";
import LightningTab from "./LightningTab";
import Image from "next/image";
import QRCode from "qrcode";
import { useSelector } from "react-redux";

const BtcExchangePop = ({
  receiveUsdc,
  setReceiveUSDC,
  btcExchange,
  setBtcExchange,
  walletAddress,
  setDepositSetup,
  setDepositFound,
}) => {
  const [qrCodee, setQRCodee] = useState("");

  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });
  const [tokenReceive, setTokenReceive] = useState();
  const userAuth = useSelector((state) => state.Auth);

  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (userAuth?.bitcoinWallet) {
      const generateQRCode = async () => {
        try {
          const qr = await QRCode.toDataURL(userAuth.bitcoinWallet, {
            margin: 0.5,
            width: 512,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQRCodee(qr);
        } catch (err) {
          console.error("QR Code generation failed:", err);
        }
      };

      generateQRCode();
    }
  }, [userAuth?.bitcoinWallet]);

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

  const handleTab = (key) => {
    setTab(key);
  };

  const handleBTCExchange = () => {
    try {
      setDepositSetup("");
      setDepositFound("");
      setBtcExchange(!btcExchange);
    } catch (error) {}
  };

  const tabData = [
    {
      title: "Native SegWit",
      component: (
        <>
          {" "}
          <div className="modalBody">
            <div className="cardCstm text-center">
              {userAuth?.bitcoinWallet && (
                <Image
                  alt=""
                  src={qrCodee}
                  height={512}
                  width={512}
                  className="max-w-full md:h-[230px] md:w-auto w-full mx-auto h-auto w-auto"
                  // style={{ height: 230 }}
                  style={{ imageRendering: "pixelated" }}
                />
              )}

              <div className="content mt-2" style={{ fontSize: 12 }}>
                <div className="text-center py-5">
                  <h6 className="m-0 text-base pb-2">Your Wallet Address</h6>
                  <div className="flex max-w-full items-stretch rounded-4 border border-dashed border-white/5 bg-white/4 text-14 leading-none text-white/40 outline-none focus-visible:border-white/40">
                    <input
                      data-tooltip-id="my-tooltip"
                      data-tooltip-content={userAuth?.bitcoinWallet}
                      disabled
                      readOnly=""
                      className="block min-w-0 flex-1 appearance-none truncate bg-transparent py-1.5 pl-2.5 font-mono outline-none"
                      type="text"
                      value={
                        userAuth?.bitcoinWallet
                          ? // ? `${userAuth.bitcoinWallet.slice(0, 21)}.....${userAuth.bitcoinWallet.slice(-21)}`
                            userAuth.bitcoinWallet
                          : "Wallet Address"
                      }
                    />
                    <button
                      onClick={() => handleCopy(userAuth?.bitcoinWallet, "one")}
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
              </div>
            </div>
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
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          <button
            onClick={handleBTCExchange}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
            // style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>
          {tokenReceive ? (
            <>
              <div className="top pb-3">
                <h5 className="m-0 text-xl font-bold">Receive Bitcoin</h5>
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
              <div class="top pb-3"></div>
              <div className="grid gap-3 grid-cols-12">
                <div className="col-span-12">
                  <button
                    onClick={() => {
                      (setReceiveUSDC(!receiveUsdc),
                        setBtcExchange(!btcExchange));
                    }}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    USDC
                  </button>
                </div>
                <div className="col-span-12">
                  <button
                    onClick={() => setTokenReceive(!tokenReceive)}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Bitcoin
                  </button>
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
  ${"" /* padding-bottom: 100px; */}
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
export default BtcExchangePop;

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
