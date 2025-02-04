"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import RecentTransaction from "./RecentTransaction";
import { createPortal } from "react-dom";
import BtcExchangePop from "../../components/Modals/BtcExchangePop";
// import BtcExchangePop from "@/components/Modals/BtcExchangePop/index";
import { initializeTBTC } from "../../lib/tbtcSdkInitializer";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { ethers } from "ethers";
// @ts-ignore
import QRCode from "qrcode";
import styled from "styled-components";
const BTCEchange = () => {
  const router = useRouter();
  const { walletAddress, provider, signer, login } = useSelector(
    (state: any) => state.Auth
  );
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [btcExchange, setBtcExchange] = useState(false);
  const [qrCode, setQRCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddressDepo, setWalletAddressDepo] = useState("");
  const [depositSetup, setDepositSetup] = useState<any>("");
  const [depositSetupCheck, setDepositSetupCheck] = useState<any>(false);
  const [depositFound, setDepositFound] = useState<any>("");
  console.log(
    "walletAddress, provider, signer, login-->",
    walletAddress,
    provider,
    signer,
    login
  );

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  const startReceive = async () => {
    try {
      setLoading(true);
      setDepositSetup("");
      setDepositFound("");
      if (signer) {
        const sdk = await initializeTBTC(signer);
        if (sdk) {
          depo(sdk);
          setBtcExchange(!btcExchange);
        }
      } else {
        toast.error("Please Login First");
      }
    } catch (error) {
      console.log("error rec-->", error);
    }
  };

  const generateQRCode = async (text: any) => {
    try {
      const qr = await QRCode.toDataURL(text);
      setQRCode(qr);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };
  useEffect(() => {
    console.log("depositSetup test", depositSetup);
    if (depositSetup) {
      mint(depositSetup);
    }
  }, [depositSetup, depositSetupCheck]);
  console.log("setDepositSetup-->", depositSetup);
  const depo = async (tbtcSdk: any) => {
    const bitcoinRecoveryAddress = "tb1q8sn2xmvgzg7jcakyz0ylmxt4mwtu0ne0qwl6zf"; // Replace with a valid BTC address
    try {
      console.log(tbtcSdk.deposits.initiateDeposit);
      const deposit = await tbtcSdk.deposits.initiateDeposit(
        bitcoinRecoveryAddress
      );
      console.log("Deposit initiated:", deposit);
      setDepositSetup(deposit);
      // Step 5: Get the Bitcoin deposit address
      const bitcoinDepositAddress = await deposit.getBitcoinAddress();
      console.log("Bitcoin deposit address:", bitcoinDepositAddress);
      setWalletAddressDepo(bitcoinDepositAddress);
      await generateQRCode(bitcoinDepositAddress);
    } catch (error) {
      console.error("Error during deposit process:", error);
    }
  };

  const mint = async (depo: any) => {
    try {
      console.log("mint-->", depo);
      if (depo) {
        const fundingUTXOs = await depo.detectFunding();
        console.log("fundingUTXOs---->", fundingUTXOs);
        if (fundingUTXOs.length > 0) {
          const txHash = await depo.initiateMinting(fundingUTXOs[0]);
          console.log("txHash---->", txHash);
          setDepositFound(txHash);
        } else {
          console.log("depo-->", depo);
          if (depo) {
            setDepositSetupCheck(!depositSetupCheck);
          }
        }
      }
    } catch (error) {
      console.log("setSdkTbtc-->", error);
      setDepositSetupCheck(!depositSetupCheck);
    }
  };

  return (
    <>
      {btcExchange &&
        createPortal(
          <BtcExchangePop
            btcExchange={btcExchange}
            setBtcExchange={setBtcExchange}
            walletAddress={walletAddressDepo}
            qrCode={qrCode}
            loading={loading}
            setLoading={setLoading}
            mint={mint}
            startReceive={startReceive}
            setDepositSetup={setDepositSetup}
            depositFound={depositFound}
            setDepositFound={setDepositFound}
            userAddress={walletAddress}
          />,
          document.body
        )}
      <section className="relative dashboard pt-12">
        <div className="container h-full">
          <div className="pageCard bg-white/5 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <button
              onClick={() => router.push("/dashboard")}
              className="border-0 p-0 absolute z-[99] top-2 right-2 opacity-40 hover:opacity-70"
              style={{ background: "transparent" }}
            >
              {closeIcn}
            </button>
            <div className="grid gap-3 grid-cols-12 lg:px-3 pt-3">
              <div className="my-2 col-span-12 p-2 px-3 px-lg-4">
                <div className="sectionHeader ">
                  <div className="d-flex align-items-center gap-3">
                    {/* <button
                      onClick={handleGoBack}
                      className="border-0 themeClr p-0"
                    >
                      {backIcn}
                    </button> */}
                    <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Threshold Wallet
                    </h4>
                  </div>
                </div>
              </div>
              <div className="my-2 col-span-12 p-2 px-3 px-lg-4">
                <div className="px-3 px-lg-4 ">
                  <TopHead className="flex p-2 py-lg-3 px-lg-4 items-center justify-between flex-wrap  px-2 py-2 md:px-[26px] md:py-[36px] overflow-hidden bg-white/5">
                    <div className="left ">
                      <h4 className="m-0 font-normal text-base flex items-center">
                        Balance
                        <span className="font-bold ms-2 text-2xl">
                          $ 12,345,00.00
                        </span>
                      </h4>
                    </div>
                    <div className="right">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBtcExchange(!btcExchange)}
                          className="flex items-center justify-center bg-[#FFEC8A] text-dark btn border-0 rounded-20 text-black text-xs font-bold"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => startReceive()}
                          className="flex items-center justify-center btn bg-[#CB89FF] border-0 text-white rounded-20 text-white text-xs font-bold"
                        >
                          Receive
                        </button>
                      </div>
                    </div>
                  </TopHead>
                </div>
              </div>
              <div className="my-2 col-span-12 p-2 px-3 px-lg-4">
                <div className="px-3 px-lg-4">
                  <div className="sectionHeader ">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <h4 className="m-0 text-xl">Recent Transaction</h4>
                    </div>
                    <RecentTransaction />
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

const TopHead = styled.div`
  backdrop-filter: blur(39.6px);
  border-radius: 15px;
  button {
    min-width: 120px;
    transition: 0.4s;
    &:hover {
      background: #000;
      color: #fff !important;
    }
  }
`;

export default BTCEchange;

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
