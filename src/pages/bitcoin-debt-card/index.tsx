"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { BackBtn } from "@/components/common";
import SendTbtcWall from "@/components/Modals/SendTbtcWallet";
import DepositPopup from "@/components/Modals/DepositPop";
import WithdrawPopup from "@/components/Modals/WithdrawPop";
import LNAdressPopup from "@/components/Modals/LNAddressPop";
import BitikaPop from "@/components/Modals/BitikaPop";
import CreateCardPop from "@/components/Modals/CreateCardPop";
import { getUser, delCreditCard } from "@/lib/apiCall";

import { createPortal } from "react-dom";
import Image from "next/image";
import QRCode from "qrcode";
const BTCDebitCard: React.FC = () => {
  const userAuth = useSelector((state: any) => state.Auth);
  const [depositPop, setDepositPop] = useState(false);
  const [withdrawPop, setWithdrawPop] = useState(false);
  const [lnAdressPop, setLNAdressPop] = useState(false);
  const [bitikaPop, setBitikaPop] = useState(false);
  const [step, setStep] = useState(1);
  const [createCard, setCreateCard] = useState(false);
  const [btcWall, setTbtcWall] = useState(false);
  const [creditCardDetails, setCreditCardDetail] = useState<any>(false);
  const [loader, setLoader] = useState(false);
  const [lnaddress, setLnaddress] = useState<any>("");
  const [lnQrCode, setLnQrCode] = useState<any>("");
  const [lightningBalance, setLightningBalance] = useState<any>(0);

  const fetchLighteningBalance = async () => {
    try {
      const userExist = await getUser(userAuth.email);
      const response = await fetch("/api/spend-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletId: userExist?.userId?.lnbitWalletId_3,
        }),
      });
      const { status, data } = await response.json();
      if (status == "success" && data?.[0]?.balance != null) {
        const balanceSats = Number(data[0].balance); // e.g., 1997000 sats
        const balanceSatss = Math.floor(balanceSats / 1000);
        setLightningBalance(balanceSatss);
      } else {
        console.error("Failed to fetch lightning balance or empty balance.");
      }
    } catch (error) {
      console.error("Error fetching lightning balance:", error);
    }
  };

  const getUSerData = async (email: any) => {
    try {
      let userExist = await getUser(email);
      if (userExist?.userId?.creditCardPass) {
        setCreditCardDetail(userExist?.userId?.creditCardPass);
      }
      if (userExist?.userId?.lnaddress) {
        const qr = await QRCode.toDataURL(userExist?.userId?.lnaddress);
        setLnQrCode(qr);
        setLnaddress(userExist?.userId?.lnaddress);
      }
    } catch (error) {
      console.log("error -->", error);
    }
  };

  const delCard = async () => {
    try {
      if (userAuth.email) {
        setLoader(true);
        const delCardData = await delCreditCard({
          email: userAuth.email,
        });
        if (delCardData?.status == "success") {
          setCreditCardDetail(false);
          setLoader(false);
          toast.success("Card Deleted!");
        } else {
          setLoader(false);
          toast.error(delCardData.message);
        }
      }

      // setStep(2)
    } catch (error) {
      console.log("addCard error-->", error);
    }
  };

  useEffect(() => {
    if (userAuth.email) {
      getUSerData(userAuth.email);
      fetchLighteningBalance();
    }
  }, []);

  return (
    <>
      {depositPop &&
        createPortal(
          <DepositPopup
            depositPop={depositPop}
            setDepositPop={setDepositPop}
          />,
          document.body
        )}
      {withdrawPop &&
        createPortal(
          <WithdrawPopup
            withdrawPop={withdrawPop}
            setWithdrawPop={setWithdrawPop}
          />,
          document.body
        )}
      {lnAdressPop &&
        createPortal(
          <LNAdressPopup
            lnAdressPop={lnAdressPop}
            setLNAdressPop={setLNAdressPop}
            lnaddress={lnaddress}
            setLnaddress={setLnaddress}
          />,
          document.body
        )}
      {bitikaPop &&
        createPortal(
          <BitikaPop
            bitikaPop={bitikaPop}
            setBitikaPop={setBitikaPop}
            lnAddress={lnaddress}
          />,
          document.body
        )}
      {btcWall &&
        createPortal(
          <SendTbtcWall btcWall={btcWall} setTbtcWall={setTbtcWall} />,
          document.body
        )}
      {createCard &&
        createPortal(
          <CreateCardPop
            email={userAuth.email || ""}
            setCreditCardDetail={setCreditCardDetail}
            createCard={createCard}
            setCreateCard={setCreateCard}
          />,
          document.body
        )}
      <section className="relative dashboard pt-12">
        <div className="container relative">
          <div className="pageCard  bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 px-2 pt-3">
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div className="sectionHeader ">
                  <div className="flex align-items-center gap-2">
                    <BackBtn />
                    <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Lightning
                    </h4>
                  </div>
                </div>
              </div>
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div className="flex flex-col gap-4">
                  {creditCardDetails && (
                    <div className="max-w-[500px] w-full bg-black/50 mx-auto rounded-xl mt-10 p-6 flex items-center gap-2 justify-center">
                      {step == 1 ? (
                        <>
                          {creditCardDetails?.type &&
                            creditCardDetails?.type == "apple" && (
                              <button
                                onClick={() => setStep(2)}
                                className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[55px] text-left text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] gap-2 justify-center disabled:pointer-events-none disabled:opacity-50`}
                              >
                                <div className="left">{applewallet}</div>
                                <div className="content">
                                  <p className="m-0 text-[14px] text-black/50">
                                    Add to
                                  </p>
                                  <p className="m-0 text-[16px]">
                                    Apple Wallet
                                  </p>
                                </div>
                              </button>
                            )}
                          {creditCardDetails?.type &&
                            creditCardDetails?.type == "google" && (
                              <button
                                onClick={() => setStep(2)}
                                className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[55px] text-left text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] gap-2 justify-center disabled:pointer-events-none disabled:opacity-50`}
                              >
                                <div className="left">{googleWallet}</div>
                                <div className="content">
                                  <p className="m-0 text-[14px] text-black/50">
                                    Add to
                                  </p>
                                  <p className="m-0 text-[16px]">
                                    Google Wallet
                                  </p>
                                </div>
                              </button>
                            )}
                        </>
                      ) : step == 2 ? (
                        <>
                          <div className=" relative mx-auto w-full">
                            <button
                              onClick={() => setStep(1)}
                              className="flex items-center gap-2"
                            >
                              {backIcn}
                            </button>
                            <button
                              className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full max-w-[300px] mx-auto h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                              onClick={() =>
                                window.open(creditCardDetails?.url, "_blank")
                              }
                            >
                              Download Pass
                            </button>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                  <div className="max-w-[500px] w-full bg-black/50 mx-auto rounded-xl mt-10 p-6">
                    <div className="grid gap-3 grid-cols-12">
                      <div className="col-span-6">
                        <button
                          onClick={() => setWithdrawPop(!withdrawPop)}
                          className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                        >
                          Withdraw
                        </button>
                      </div>
                      <div className="col-span-6">
                        <button
                          onClick={() => setDepositPop(!depositPop)}
                          className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                        >
                          Deposit
                        </button>
                      </div>
                      <div className="col-span-6">
                        <button
                          disabled={creditCardDetails || lightningBalance <= 0}
                          onClick={() => setCreateCard(!createCard)}
                          className={`  bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                        >
                          Create Card
                        </button>
                      </div>
                      <div className="col-span-6">
                        <button
                          className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          disabled={loader || !creditCardDetails}
                          onClick={() => delCard()}
                        >
                          Delete Card
                        </button>
                      </div>
                    </div>
                  </div>
                  {lnaddress && lnQrCode && (
                    <div className="max-w-[500px] w-full bg-black/50 mx-auto rounded-xl mt-10 p-6 text-center">
                      <p className="m-0 py-2 text-white/80">
                        <span className="font-bold">LN Address:</span>
                        {lnaddress}
                      </p>
                      <Image
                        alt=""
                        src={lnQrCode}
                        height={10000}
                        width={10000}
                        className="max-w-full mx-auto h-auto w-auto"
                        style={{ height: 230 }}
                      />
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                          onClick={() => setLNAdressPop(!lnAdressPop)}
                          className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                        >
                          Modify LN Address
                        </button>
                        <button
                          onClick={() => setBitikaPop(!bitikaPop)}
                          className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                        >
                          Buy with mpesa https://bitika.xyz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </section>
    </>
  );
};

export const ContentWrp = styled.div`
  h2 {
    background: linear-gradient(90.5deg, #e2682b 0.43%, #ffb38c 128%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
`;
export default BTCDebitCard;

const applewallet = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M3 15H9.4C9.731 15 10.005 15.278 10.15 15.576C10.356 15.999 10.844 16.5 12 16.5C13.156 16.5 13.644 16 13.85 15.576C13.995 15.278 14.269 15 14.6 15H21M3 7H21M3 11H21"
      stroke="black"
      strokeWidth="1.5"
    />
  </svg>
);

const googleWallet = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.75 10.545V6.8125C21.7487 5.99074 21.4216 5.20301 20.8406 4.62193C20.2595 4.04085 19.4718 3.71382 18.65 3.7125H5.35C4.52985 3.71904 3.74514 4.04774 3.16519 4.62769C2.58524 5.20765 2.25654 5.99235 2.25 6.8125V10.672"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.75 9.422C21.7487 8.60023 21.4216 7.8125 20.8406 7.23143C20.2595 6.65035 19.4718 6.32332 18.65 6.322H5.35C4.52823 6.32332 3.74051 6.65035 3.15943 7.23143C2.57835 7.8125 2.25132 8.60023 2.25 9.422"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.4765 10.744C21.231 10.1998 20.8338 9.73796 20.3325 9.41375C19.8311 9.08954 19.247 8.91672 18.65 8.916H5.35C4.75455 8.91679 4.17188 9.08878 3.67145 9.41147C3.17102 9.73416 2.77392 10.1939 2.5275 10.736"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.649 13.55L2.25 10.6715V17.1875C2.25132 18.0093 2.57835 18.797 3.15943 19.3781C3.74051 19.9591 4.52823 20.2862 5.35 20.2875H18.6505C19.4723 20.2862 20.26 19.9591 20.8411 19.3781C21.4221 18.797 21.7492 18.0093 21.7505 17.1875V10.545L18.793 12.696C18.2036 13.1266 17.5287 13.4257 16.8137 13.573C16.0988 13.7203 15.3606 13.7125 14.649 13.55Z"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
);
