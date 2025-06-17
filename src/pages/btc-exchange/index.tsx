"use client";
// @ts-ignore
import React, { useEffect, useState } from "react";
import RecentTransaction from "./RecentTransaction";
import { createPortal } from "react-dom";
import BtcExchangePop from "../../components/Modals/BtcExchangePop";
import SuccessPop from "../../components/Modals/SuccessPop";
import SendBitcoinPop from "../../components/Modals/SendBitcoinPop";
import ReceiveUSDCPop from "../../components/Modals/ReceiveUsdcPop";
import SendUSDCPop from "../../components/Modals/SendUsdcPop";
import BtcExchangeSendPop from "../../components/Modals/BtcExchangeSendPop";
import { useSelector } from "react-redux";
import {
  getProvider,
  getAccount,
  publicClient,
  getETHEREUMRpcProvider,
  getRpcProvider,
} from "../../lib/zeroDev";
import LoadingScreen from "@/components/LoadingScreen";

import styled from "styled-components";
import { BackBtn } from "@/components/common";
import { parseAbi } from "viem";
import { getUser } from "@/lib/apiCall";
import { fetchBitcoinBalance } from "../api/bitcoinBalance";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
const BTCEchange = () => {
  const userAuth = useSelector((state: any) => state.Auth);
  const [btcExchange, setBtcExchange] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState(false);
  const [sendUsdc, setSendUsdc] = useState(false);
  const [sendBitcoin, setSendBitcoin] = useState(false);
  const [success, setSuccess] = useState(false);
  const [btcExchangeSend, setBtcExchangeSend] = useState(false);
  const [qrCode, setQRCode] = useState("");
  const [receiveUsdc, setReceiveUSDC] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddressDepo, setWalletAddressDepo] = useState("");
  const [depositSetup, setDepositSetup] = useState<any>("");
  const [depositSetupCheck, setDepositSetupCheck] = useState<any>(false);
  const [depositFound, setDepositFound] = useState<any>("");
  const [sendSdk, setSendSdk] = useState<any>("");
  const [totalUsdBalance, setTotalUsdBalance] = useState("0.0");
  const [filterType, setSetFilterType] = useState(5);

  const MORPHO_ADDRESS = process.env.NEXT_PUBLIC_MORPHO_CONTRACT_ADDRESS;
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS;

  const startReceive = async () => {
    try {
      setLoading(true);
      setDepositSetup("");
      setDepositFound("");

      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          if (provider) {
            // const sdk = await initializeTBTC(provider.signer);
            // if (sdk) {
            //   depo(sdk);
            //   setBtcExchange(!btcExchange);
            // }
          }
        }
      } else {
        setBtcExchange(!btcExchange);
      }
    } catch (error) {
      console.log("error rec-->", error);
    }
  };

  const startSend = async () => {
    try {
      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          if (provider) {
            // const sdk = await initializeTBTC(provider.signer);
            // if (sdk) {
            //   setSendSdk(sdk);
            // }
            setBtcExchangeSend(!btcExchangeSend);
          }
        }
      } else {
        setBtcExchangeSend(!btcExchangeSend);
      }
    } catch (error) {
      console.log("error-->", error);
    }
  };

  useEffect(() => {
    if (depositSetup) {
      mint(depositSetup);
    }
  }, [depositSetup, depositSetupCheck]);

  const mint = async (depo: any) => {
    try {
      if (depo) {
        const fundingUTXOs = await depo.detectFunding();
        if (fundingUTXOs.length > 0) {
          setLoaderStatus(true);
          const txHash = await depo.initiateMinting(fundingUTXOs[0]);
          setLoaderStatus(false);
          setDepositFound(txHash);
        } else {
          if (depo) {
            setDepositSetupCheck(!depositSetupCheck);
          }
        }
      }
    } catch (error) {
      setLoaderStatus(false);
      setDepositSetupCheck(!depositSetupCheck);
    }
  };

  useEffect(() => {
    fetchBalance(filterType);
  }, [filterType]);

  const fetchBalance = async (filterType: any) => {
    if (userAuth?.walletAddress) {
      if (filterType === 0) {
        try {
          const senderUsdcBalance = await publicClient.readContract({
            abi: parseAbi([
              "function balanceOf(address account) returns (uint256)",
            ]),
            address: USDC_ADDRESS as `0x${string}`,
            functionName: "balanceOf",
            args: [userAuth?.walletAddress],
          });
          const usdcBalance = String(
            Number(BigInt(senderUsdcBalance)) / Number(BigInt(1e6))
          );

          setTotalUsdBalance(
            `Dollars: $ ${
              parseFloat(usdcBalance) < 0.01
                ? "0"
                : parseFloat(usdcBalance).toFixed(2)
            }`
          );
        } catch (err) {
          console.error("Error fetching token balances:", err);
        }
      } else if (filterType === 1) {
        try {
          const result = await fetchBitcoinBalance(userAuth?.bitcoinWallet);

          if (result?.error) {
            console.error("Error fetching BTC balance:", result.error);
            return;
          }
          setTotalUsdBalance(
            `Bitcoin: ${result?.balance !== 0 ? (result?.balance).toFixed(8) : "0"}`
          );
        } catch (error) {
          console.error("Failed to fetch BTC balance in USD:", error);
        }
      } else if (filterType === 2) {
        const providerETH = await getETHEREUMRpcProvider();
        const provider = await getRpcProvider();
        const web3 = new Web3Interaction("sepolia", provider);

        // Fetch PAXG balance on Ethereum
        const paxgResult = await web3.getGOLDBalance(
          process.env.NEXT_PUBLIC_ENV_ETHERCHAIN_TETHER_GOLD_ADDRESS!,
          userAuth?.walletAddress,
          providerETH as ethers.providers.Web3Provider
        );

        if (paxgResult.success && paxgResult.balance) {
          setTotalUsdBalance(
            `Gold: ${
              paxgResult.balance !== "0.0"
                ? Number.parseFloat(paxgResult.balance).toFixed(6).toString()
                : "0"
            }`
          );
        }
      } else if (filterType === 3) {
        try {
          const userExist = await getUser(userAuth.email);

          const response = await fetch("/api/lnbit-balance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletId: userExist?.userId?.lnbitWalletId,
              // walletId: "ccd505c23ebf4a988b190e6aaefff7a5", i
            }),
          });

          const { status, data } = await response.json();

          if (status === "success") {
            if (data?.[0]?.balance != null) {
              const balanceSats = Number(data[0].balance); // e.g., 1997000 sats
              const balanceSatss = Math.floor(balanceSats / 1000);
              setTotalUsdBalance(
                `Lightning TPOS USDC: ${balanceSatss.toString()}`
              );
            } else {
              setTotalUsdBalance(`Lightning TPOS USDC: 0`);
            }
          } else {
            console.error(
              "Failed to fetch lightning balance or empty balance."
            );
          }
        } catch (error) {
          console.error("Error fetching lightning balance:", error);
        }
      } else if (filterType === 4) {
        try {
          const userExist = await getUser(userAuth.email);

          const response = await fetch("/api/lnbit-balance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletId: userExist?.userId?.lnbitWalletId_2,
              // walletId: "ccd505c23ebf4a988b190e6aaefff7a5", i
            }),
          });

          const { status, data } = await response.json();

          if (status === "success") {
            if (data?.[0]?.balance != null) {
              const balanceSats = Number(data[0].balance); // e.g., 1997000 sats
              const balanceSatss = Math.floor(balanceSats / 1000);
              setTotalUsdBalance(
                `Lightning TPOS Bitcoin: ${balanceSatss.toString()}`
              );
            } else {
              setTotalUsdBalance(`Lightning TPOS Bitcoin: 0`);
            }
          } else {
            console.error(
              "Failed to fetch lightning balance or empty balance."
            );
          }
        } catch (error) {
          console.error("Error fetching lightning balance:", error);
        }
      } else if (filterType === 5 || filterType === 7) {
        try {
          const userExist = await getUser(userAuth.email);

          const response = await fetch("/api/spend-balance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletId: userExist?.userId?.lnbitWalletId_3,
              // walletId: "ccd505c23ebf4a988b190e6aaefff7a5", i
            }),
          });

          const { status, data } = await response.json();

          if (status === "success") {
            if (data?.[0]?.balance != null) {
              const balanceSats = Number(data[0].balance); // e.g., 1997000 sats
              const balanceSatss = Math.floor(balanceSats / 1000);
              setTotalUsdBalance(`Lightning Spend: ${balanceSatss.toString()}`);
            } else {
              setTotalUsdBalance(`Lightning Spend: 0`);
            }
          } else {
            console.error(
              "Failed to fetch lightning balance or empty balance."
            );
          }
        } catch (error) {
          console.error("Error fetching lightning balance:", error);
        }
      } else if (filterType === 6) {
        try {
          const senderMPRPHOBalance = await publicClient.readContract({
            abi: parseAbi([
              "function balanceOf(address account) returns (uint256)",
            ]),
            address: MORPHO_ADDRESS as `0x${string}`,
            functionName: "balanceOf",
            args: [userAuth?.walletAddress],
          });
          const morphoBalance = String(
            Number(BigInt(senderMPRPHOBalance)) / Number(BigInt(1e18))
          );

          setTotalUsdBalance(
            `Spark USDC: $ ${
              parseFloat(morphoBalance) < 0.01
                ? "0"
                : parseFloat(morphoBalance).toFixed(2)
            }`
          );
        } catch (error) {
          console.error("Error fetching token balances:", error);
        }
      }
    }
  };

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
            setDepositSetup={setDepositSetup}
            setDepositFound={setDepositFound}
            receiveUsdc={receiveUsdc}
            setReceiveUSDC={setReceiveUSDC}
          />,
          document.body
        )}
      {loaderStatus && createPortal(<LoadingScreen />, document.body)}
      <section className="relative dashboard  ">
        <div className="container h-full relative">
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
                        <span className="font-bold ms-2 text-2xl">
                          {totalUsdBalance}
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
                          className="flex items-center justify-center bg-[#fff] border-[1px] border-[#dd6c47] text-[#dd6c47] btn border-0 rounded-20 text-black text-xs font-bold"
                        >
                          Receive
                        </button>
                        {/* <button
                          onClick={() => setSendBitcoin(!sendBitcoin)}
                          className="flex items-center justify-center bg-[#dd6c47] text-white btn border-0 rounded-20 text-black text-xs font-bold"
                        >
                          Bridge
                        </button> */}
                      </div>
                    </div>
                  </TopHead>
                </div>
              </div>
              <div className="my-2 col-span-12">
                <div className="px-3 px-lg-4">
                  <div className="sectionHeader ">
                    <RecentTransaction setSetFilterType={setSetFilterType} />
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
