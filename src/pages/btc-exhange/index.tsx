"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import RecentTransaction from "./RecentTransaction";
import { createPortal } from "react-dom";
import BtcExchangePop from "../../components/Modals/BtcExchangePop";
// import BtcExchangePop from "@/components/Modals/BtcExchangePop/index";
import { initializeTBTC } from "../../../tbtc/src/tbtcSdkInitializer";
import { useSelector, useDispatch } from "react-redux";
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
  console.log(
    "walletAddress, provider, signer, login-->",
    walletAddress,
    provider,
    signer,
    login
  );
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowFirstComponent(false); // Hide the first component after 4-5 seconds
  //   }, 3000); // 5000ms = 5 seconds

  //   // Cleanup timer when the component unmounts
  //   return () => clearTimeout(timer);
  // }, []);
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  const startReceive = async (address: any) => {
    try {
      setLoading(true);
      console.log("initializeTBTC00>", initializeTBTC);
      // Initialize tBTC SDK
      const sdk = await initializeTBTC(signer);
      console.log("sdk-->", sdk);
      depo(sdk, address);
      // setBtcExchange(!btcExchange)
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

  const depo = async (tbtcSdk: any, address: any) => {
    const bitcoinRecoveryAddress = "tb1q8sn2xmvgzg7jcakyz0ylmxt4mwtu0ne0qwl6zf"; // Replace with a valid BTC address
    console.log("bitcoinRecoveryAddress-->", bitcoinRecoveryAddress, address);
    try {
      // Step 4: Initiate the deposit
      console.log(tbtcSdk.deposits.initiateDeposit);
      const deposit = await tbtcSdk.deposits.initiateDeposit(address);
      console.log("Deposit initiated:", deposit);
      setDepositSetup(deposit);
      // Step 5: Get the Bitcoin deposit address
      const bitcoinDepositAddress = await deposit.getBitcoinAddress();
      console.log("Bitcoin deposit address:", bitcoinDepositAddress);
      setWalletAddressDepo(bitcoinDepositAddress);
      await generateQRCode(bitcoinDepositAddress);
      // Inform the user to send BTC to the deposit address
      // alert(`Send BTC to the deposit address: ${bitcoinDepositAddress}`);

      // Step 6: Monitor the Bitcoin funding and initiate minting
      // Wait for the user to complete the deposit (manual step required)
      // console.log("Waiting for Bitcoin funding to complete...");

      // // Initiate minting using the latest funding UTXO
      // const txHash = await deposit.initiateMinting();
      // console.log("Minting initiated, transaction hash:", txHash);

      // alert(`Minting initiated successfully! Transaction hash: ${txHash}`);
    } catch (error) {
      console.error("Error during deposit process:", error);
    }
  };

  const mint = async () => {
    try {
      // const txHash = await depositSetup.initiateMinting();
      // console.log("Minting initiated, transaction hash:", txHash);
      // Detect funding UTXOs manually. There can be more than one.
      const fundingUTXOs = await depositSetup.detectFunding();
      console.log("fundingUTXOs---->", fundingUTXOs);
      // Initiate minting using one of the funding UTXOs. Returns hash of the
      // initiate minting transaction.
      if (fundingUTXOs.length > 0) {
        const txHash = await depositSetup.initiateMinting(fundingUTXOs[0]);
        console.log("txHash---->", txHash);
      } else {
        mint();
      }
    } catch (error) {
      console.log("setSdkTbtc-->", error);
      mint();
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
                      onClick={() => setBtcExchange(!btcExchange)}
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
