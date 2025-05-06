"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import RecentTransaction from "./RecentTransaction";
import { createPortal } from "react-dom";
import BtcExchangePop from "../../components/Modals/BtcExchangePop";
import SuccessPop from "../../components/Modals/SuccessPop";
import SendBitcoinPop from "../../components/Modals/SendBitcoinPop";
import ReceiveUSDCPop from "../../components/Modals/ReceiveUsdcPop";
import SendUSDCPop from "../../components/Modals/SendUsdcPop";
import TransactionApprovalPop from "../../components/Modals/TransactionApprovalPop";
import BtcExchangeSendPop from "../../components/Modals/BtcExchangeSendPop";
// import BtcExchangePop from "@/components/Modals/BtcExchangePop/index";
import { initializeTBTC } from "../../lib/tbtcSdkInitializer";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getProvider, getAccount } from "../../lib/zeroDevWallet";
import Loader from "@/components/loader";
import LoadingScreen from "@/components/LoadingScreen";
import { ethers } from "ethers";
// @ts-ignore
import QRCode from "qrcode";
import styled from "styled-components";
import { fetchBalance } from "@/lib/utils";
import { BackBtn } from "@/components/common";
const BTCEchange = () => {
  const router = useRouter();
  const userAuth = useSelector((state: any) => state.Auth);
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [btcExchange, setBtcExchange] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState(false);
  const [sendUsdc, setSendUsdc] = useState(false);
  const [sendBitcoin, setSendBitcoin] = useState(false);
  const [success, setSuccess] = useState(false);
  const [btcExchangeSend, setBtcExchangeSend] = useState(false);
  const [qrCode, setQRCode] = useState("");
  const [receiveUsdc, setReceiveUSDC] = useState("");
  const [trxnApproval, settrxnApproval] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddressDepo, setWalletAddressDepo] = useState("");
  const [depositSetup, setDepositSetup] = useState<any>("");
  const [depositSetupCheck, setDepositSetupCheck] = useState<any>(false);
  const [depositFound, setDepositFound] = useState<any>("");
  const [sendSdk, setSendSdk] = useState<any>("");
  const [totalUsdBalance, setTotalUsdBalance] = useState(0);

  console.log("walletAddress-->", userAuth);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  const startReceive = async () => {
    try {
      console.log("receice");
      setLoading(true);
      setDepositSetup("");
      setDepositFound("");

      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // await window.ethereum.request({ method: "eth_requestAccounts" });

      // const signer = provider.getSigner();
      // const address = await signer.getAddress();
      // console.log("signer00>",signer,address)
      console.log("userAuth.passkeyCred-->", userAuth.passkeyCred);
      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        console.log("account---<", account);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          console.log("provider-->", provider);
          if (provider) {
            // kernelProvider, ethersProvider, signer
            const sdk = await initializeTBTC(provider.signer);
            console.log("sdk -->", sdk);
            if (sdk) {
              depo(sdk);
              setBtcExchange(!btcExchange);
            }
          }
        }
      } else {
        setBtcExchange(!btcExchange);
        // toast.error("Please Login First");
      }
    } catch (error) {
      console.log("error rec-->", error);
    }
  };

  const startSend = async () => {
    try {
      console.log("start send");
      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        console.log("account---<", account);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          console.log("provider-->", provider);
          if (provider) {
            // kernelProvider, ethersProvider, signer
            const sdk = await initializeTBTC(provider.signer);
            if (sdk) {
              setSendSdk(sdk);
            }
            setBtcExchangeSend(!btcExchangeSend);
          }
        }
      } else {
        setBtcExchangeSend(!btcExchangeSend);
        // toast.error("Please Login First");
      }
    } catch (error) {
      console.log("startSend error-->");
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
    const bitcoinRecoveryAddress = process.env.NEXT_PUBLIC_RECOVERY_ADDRESS; // Replace with a valid BTC address
    console.log("bitcoinRecoveryAddress00>", bitcoinRecoveryAddress);
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
          setLoaderStatus(true);
          const txHash = await depo.initiateMinting(fundingUTXOs[0]);
          console.log("txHash---->", txHash);
          setLoaderStatus(false);
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
      setLoaderStatus(false);
      setDepositSetupCheck(!depositSetupCheck);
    }
  };

  useEffect(() => {
    if (userAuth?.walletAddress) {
      const fetchData = async () => {
        try {
          if (userAuth?.passkeyCred) {
            let account = await getAccount(userAuth?.passkeyCred);
            if (account) {
              let provider = await getProvider(account.kernelClient);
              if (provider) {
                try {
                  const walletBalance = await fetchBalance(
                    userAuth?.walletAddress
                  );
                  console.log("Wallet Balance Data:", walletBalance);

                  if (walletBalance?.result?.length) {
                    const totalUsd = walletBalance.result.reduce(
                      (sum: any, token: any) => sum + (token.usd_value || 0),
                      0
                    );
                    setTotalUsdBalance(totalUsd.toFixed(2));
                  }
                } catch (err) {}
              }
            }
          }
        } catch (error) {
          console.error("Error fetching token balances:", error);
        }
      };

      fetchData();
    }
  }, [userAuth?.walletAddress, userAuth?.passkeyCred]);

  return (
    <>
      {btcExchangeSend &&
        createPortal(
          <BtcExchangeSendPop
            btcExchangeSend={btcExchangeSend}
            sendSdk={sendSdk}
            setBtcExchangeSend={setBtcExchangeSend}
            walletAddress={walletAddressDepo}
            qrCode={qrCode}
            loading={loading}
            setLoading={setLoading}
            mint={mint}
            startReceive={startReceive}
            setDepositSetup={setDepositSetup}
            depositFound={depositFound}
            setDepositFound={setDepositFound}
            userAddress={userAuth.walletAddress}
            setSendUsdc={setSendUsdc}
            sendUsdc={sendUsdc}
          />,
          document.body
        )}
      {sendUsdc &&
        createPortal(
          <SendUSDCPop
            setSendUsdc={setSendUsdc}
            sendUsdc={sendUsdc}
            success={success}
            setSuccess={setSuccess}
          />,
          document.body
        )}
      {sendBitcoin &&
        createPortal(
          <SendBitcoinPop
            sendBitcoin={sendBitcoin}
            setSendBitcoin={setSendBitcoin}
            success={success}
            setSuccess={setSuccess}
          />,
          document.body
        )}
      {success &&
        createPortal(
          <SuccessPop success={success} setSuccess={setSuccess} />,
          document.body
        )}
      {receiveUsdc &&
        createPortal(
          <ReceiveUSDCPop
            receiveUsdc={receiveUsdc}
            setReceiveUSDC={setReceiveUSDC}
          />,
          document.body
        )}
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
            userAddress={userAuth.walletAddress}
            receiveUsdc={receiveUsdc}
            setReceiveUSDC={setReceiveUSDC}
          />,
          document.body
        )}
      {/* {trxnApproval &&
        createPortal(
          <TransactionApprovalPop trxnApproval={trxnApproval} settrxnApproval={settrxnApproval} />,
          document.body
        )} */}
      {loaderStatus && createPortal(<LoadingScreen />, document.body)}
      <section className="relative dashboard pt-12">
        <div className="container h-full relative">
          {/* <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button> */}
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 lg:px-3 pt-3">
              <div className="my-2 col-span-12 p-2 px-3 px-lg-4">
                <div className="sectionHeader ">
                  <div className="flex align-items-center gap-3">
                    <BackBtn />
                    <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Send & Recieve
                    </h4>
                  </div>
                </div>
              </div>
              <div className="my-2 col-span-12 p-2 px-3 px-lg-4">
                <div className=" px-lg-4 ">
                  <TopHead className="flex p-3 py-lg-3 px-lg-4 items-center justify-between flex-wrap md:px-[26px] md:py-[36px] overflow-hidden bg-white/5 gap-4">
                    <div className="left ">
                      <h4 className="m-0 font-normal text-base flex items-center">
                        Total Balance
                        <span className="font-bold ms-2 text-2xl">
                          $ {totalUsdBalance}
                        </span>
                      </h4>
                    </div>
                    <div className="right">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startSend()}
                          className="flex items-center justify-center bg-[#dd6c47] text-white btn border-0 rounded-20 text-black text-xs font-bold"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => startReceive()}
                          // onClick={() => setBtcExchange(!btcExchange)}
                          className="flex items-center justify-center bg-[#fff] border-[1px] border-[#dd6c47] text-[#dd6c47] btn border-0 rounded-20 text-black text-xs font-bold"
                        >
                          Receive
                        </button>
                        <button
                          onClick={() => setSendBitcoin(!sendBitcoin)}
                          className="flex items-center justify-center bg-[#dd6c47] text-white btn border-0 rounded-20 text-black text-xs font-bold"
                        >
                          Bridge
                        </button>
                      </div>
                    </div>
                  </TopHead>
                </div>
              </div>
              <div className="my-2 col-span-12">
                <div className="px-3 px-lg-4">
                  <div className="sectionHeader ">
                    {/* <div className="flex align-items-center gap-3 mb-3">
                      <h4 className="m-0 text-xl">Recent Transactions</h4>
                    </div> */}
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
  // backdrop-filter: blur(39.6px);
  border-radius: 15px;
  button {
    min-width: 120px;
    transition: 0.4s;
    &:hover {
      background: #000;
      color: #fff !important;
    }
  }
  @media (max-width: 575px) {
    .left {
      width: 100%;
      text-align: center;
      h4 {
        justify-content: center;
      }
    }
    .right {
      width: 100%;
      > div {
        width: 100%;
        button {
          width: 100%;
        }
      }
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
