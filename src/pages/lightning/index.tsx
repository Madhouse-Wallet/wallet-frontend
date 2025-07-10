"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import SendTbtcWall from "@/components/Modals/SendTbtcWallet";
import DepositPopup from "@/components/Modals/DepositPop";
import DepositUsdcPopup from "@/components/Modals/DepositUsdcPop";
import WithdrawPopup from "@/components/Modals/WithdrawPop";
import LNAdressPopup from "@/components/Modals/LNAddressPop";
import BitikaPop from "@/components/Modals/BitikaPop";
import CreateCardPop from "@/components/Modals/CreateCardPop";
import { getUser, delCreditCard } from "@/lib/apiCall";
import LightningWithdrawPop from "@/components/Modals/LightningWithdrawPop";
import LightningDepositPop from "@/components/Modals/LightningDepositPop";
import WithdrawUsdcPopup from "@/components/Modals/WithdrawUsdcPop";

import { createPortal } from "react-dom";
import Image from "next/image";
import QRCode from "qrcode";
import { useRouter } from "next/router";
import { RadioToggle } from "@/components/common";
import { updtUser } from "../../lib/apiCall";

const BTCDebitCard: React.FC = () => {
  const router = useRouter();
  const userAuth = useSelector((state: any) => state.Auth);
  const [depositPop, setDepositPop] = useState(false);
  const [depositUsdcPop, setDepositUsdcPop] = useState(false);
  const [withdrawPop, setWithdrawPop] = useState(false);
  const [initValueAutoTransfer, setInitValueAutoTransfer] = useState(false);
  const [withdrawUsdcPop, setWithdrawUsdcPop] = useState(false);
  const [lightning, setLightning] = useState(false);
  const [LightningDeposit, setLightningDeposit] = useState(false);
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

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const setAutomation = async (value: any) => {
    try {
      // console.log("userAuth.email ->",userAuth.email, value )
      let data = await updtUser(
        { email: userAuth.email },
        {
          $set: { autoTransfer: value }, // Ensure this is inside `$set`
        }
      );
    } catch (error) {

    }
  }

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
        setInitValueAutoTransfer(userExist?.userId?.autoTransfer || false)
      }
      if (userExist?.userId?.lnaddress) {
        const qr = await QRCode.toDataURL(
          userExist?.userId?.spendLnurlpLink?.lnurl,
          {
            margin: 0.5,
            width: 512,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          }
        );
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
        } else {
          setLoader(false);
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
      {LightningDeposit &&
        createPortal(
          <LightningDepositPop
            depositUsdcPop={depositUsdcPop}
            setDepositUsdcPop={setDepositUsdcPop}
            depositPop={depositPop}
            setDepositPop={setDepositPop}
            LightningDeposit={LightningDeposit}
            setLightningDeposit={setLightningDeposit}
          />,
          document.body
        )}
      {lightning &&
        createPortal(
          <LightningWithdrawPop
            withdrawUsdcPop={withdrawUsdcPop}
            setWithdrawUsdcPop={setWithdrawUsdcPop}
            setWithdrawPop={setWithdrawPop}
            withdrawPop={withdrawPop}
            lightning={lightning}
            setLightning={setLightning}
          />,
          document.body
        )}
      {depositPop &&
        createPortal(
          <DepositPopup
            depositPop={depositPop}
            setDepositPop={setDepositPop}
          />,
          document.body
        )}
      {depositUsdcPop &&
        createPortal(
          <DepositUsdcPopup
            depositUsdcPop={depositUsdcPop}
            setDepositUsdcPop={setDepositUsdcPop}
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
      {withdrawUsdcPop &&
        createPortal(
          <WithdrawUsdcPopup
            withdrawUsdcPop={withdrawUsdcPop}
            setWithdrawUsdcPop={setWithdrawUsdcPop}
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
      <section className="relative dashboard  h-full flex items-center py-[30px] sm:flex-row flex-col">
        <div className="absolute inset-0 backdrop-blur-xl h-full"></div>

        <div className="px-3 mx-auto relative w-full sm:min-w-[500px] sm:max-w-[max-content]">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[12px] right-[25px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <header className="siteHeader top-0 py-2 w-full z-[999]">
            <div className="container mx-auto">
              <Nav className=" px-3 py-3 rounded-[30px] shadow relative flex items-center justify-center flex-wrap gap-2">
                <div className="left">
                  <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                    Lightning
                  </h4>
                </div>
              </Nav>
            </div>
          </header>
          <div className="pageCard  bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 px-2 py-3">
              <div className="p-2 px-3 px-lg-4 col-span-12">
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
                  <div className="max-w-[500px] w-full bg-black/50 mx-auto rounded-xl mt-5 p-6">
                    <div className="grid gap-3 grid-cols-12">
                      <div className="col-span-6">
                        <button
                          onClick={() => setLightning(!lightning)}
                          className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                        >
                          Withdraw
                        </button>
                      </div>
                      <div className="col-span-6">
                        <button
                          // onClick={() => setDepositPop(!depositPop)}
                          onClick={() => setLightningDeposit(!LightningDeposit)}
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
                          Create Pass
                        </button>
                      </div>
                      <div className="col-span-6">
                        <button
                          className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          disabled={loader || !creditCardDetails}
                          onClick={() => delCard()}
                        >
                          Delete Pass
                        </button>
                      </div>
                      {
                        userAuth.email && (<div className="col-span-12">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${initValueAutoTransfer ? 'bg-[#df723b]' : 'bg-gray-300'
                                }`}
                              onClick={() => { setInitValueAutoTransfer(!initValueAutoTransfer); setAutomation(!initValueAutoTransfer) }}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${initValueAutoTransfer ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                              />
                            </div>
                            <p className="m-0 text-white/30">Enable automatic withdrawal of Lightning funds to USDC.</p>
                          </div>
                        </div>)
                      }

                    </div>
                  </div>
                  {lnaddress && lnQrCode && (
                    <div className="max-w-[500px] w-full bg-black/50 mx-auto rounded-xl mt-10 p-6 text-center">
                      <p className="m-0">
                        <span className="font-bold block">LN Address:</span>
                      </p>
                      <div
                        onClick={() => handleCopy(lnaddress)}
                        className="m-0 py-2 text-white/80 flex justify-center items-center  pb-5  cursor-pointer"
                      >
                        {lnaddress} <span className="ml-1">{copyIcn}</span>
                      </div>
                      <Image
                        alt=""
                        src={lnQrCode}
                        height={10000}
                        width={10000}
                        className="max-w-full md:h-[230px] md:w-auto w-full mx-auto h-auto w-auto"
                        // style={{ height: 230 }}
                        style={{ imageRendering: "pixelated" }}
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
                          Buy Lightning with M-Pesa
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

const Nav = styled.nav`
  // background: var(--cardBg);
  background: #5c2a28a3;
  backdrop-filter: blur(12.8px);
`;

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
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
const copyIcn = (
  <svg
    width="15"
    height="15"
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
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);
