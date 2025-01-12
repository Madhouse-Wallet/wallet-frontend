"use client";
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
      setDepositFound("")
      if (signer) {
        const sdk = await initializeTBTC(signer);
        if (sdk) {
          depo(sdk);
          setBtcExchange(!btcExchange)
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
    console.log("depositSetup test",depositSetup)
    if (depositSetup) {
      mint(depositSetup)
    }
  }, [depositSetup, depositSetupCheck])
  console.log("setDepositSetup-->", depositSetup)
  const depo = async (tbtcSdk: any) => {
    const bitcoinRecoveryAddress = "tb1q8sn2xmvgzg7jcakyz0ylmxt4mwtu0ne0qwl6zf"; // Replace with a valid BTC address
    try {
      console.log(tbtcSdk.deposits.initiateDeposit);
      const deposit = await tbtcSdk.deposits.initiateDeposit(bitcoinRecoveryAddress);
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
      console.log("mint-->", depo)
      if (depo) {
        const fundingUTXOs = await depo.detectFunding();
        console.log("fundingUTXOs---->", fundingUTXOs);
        if (fundingUTXOs.length > 0) {
          const txHash = await depo.initiateMinting(fundingUTXOs[0]);
          console.log("txHash---->", txHash);
          setDepositFound(txHash)
        } else {
          console.log("depo-->",depo)
          if(depo){
            setDepositSetupCheck(!depositSetupCheck)
          }
        }
      }
    } catch (error) {
      console.log("setSdkTbtc-->", error);
      setDepositSetupCheck(!depositSetupCheck)
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
      <section className="position-relative dashboard py-3">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="my-2 col-span-12">
              <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
                <div className="d-flex align-items-center gap-3">
                  <button
                    onClick={handleGoBack}
                    className="border-0 themeClr p-0"
                  >
                    {backIcn}
                  </button>
                  <h4 className="m-0 text-2xl font-bold">Threshold Wallet</h4>
                </div>
              </div>
            </div>
            <div className="my-2 col-span-12">
              <div className="d-flex align-items-start justify-content-between flex-wrap">
                <div className="left ">
                  <h4 className="m-0 font-bold text-xl">
                    Balance
                    <span className="themeClr ms-2">$ 12,345,00.00</span>
                  </h4>
                </div>
                <div className="right">
                  <div className="d-flex align-items-center gap-3">
                    <button
                      onClick={() => setBtcExchange(!btcExchange)}
                      className="d-flex align-items-center justify-content-center commonBtn"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => startReceive()}
                      className="d-flex align-items-center justify-content-center commonBtn"
                    >
                      Receive
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="my-2 col-span-12">
              <div className="sectionHeader pb-2  mt-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <h4 className="m-0 text-xl">Recent Transaction</h4>
                </div>
                <RecentTransaction />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

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
