import React, { useEffect, useState } from "react";
import { SVGProps } from "react";
import InstallFirstApp from "./InstallFirstApp";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import CounterList from "@/components/CounterList";
import { useRouter } from "next/router";
import { createPortal } from "react-dom";
import BuyBitcoin from "@/components/Modals/buyBitcoinPop";
import BuySellBitcoinPop from "@/components/Modals/BuySellBitcoinPop";
import BuyCoveragePop from "@/components/Modals/buyCoveragePop";
import WithdrawDepositPopup from "@/components/Modals/WithdrawDepositPop";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { splitAddress } from "../../utils/globals";
import { fetchBalance, fetchTokenBalances } from "../../lib/utils";
import { getAccount, getProvider } from "@/lib/zeroDevWallet";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import LoadingScreen from "@/components/LoadingScreen";
import PointOfSalePop from "@/components/Modals/PointOfSalePop";
import RefundBitcoin from "@/components/Modals/RefundBitcoinPop";

// interface CardMetrics {
//   head: string;
//   value: string;
//   icn: React.ReactNode;
// }

// interface CardData {
//   head: string;
//   icn: React.FC<SVGProps<SVGSVGElement>> | StaticImageData;
//   onClick: () => void;
// }

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [pointSale, setPointSale] = useState();
  const [refundBTC, setRefundBTC] = useState();

  const userAuth = useSelector((state) => state.Auth);
  const [buy, setBuy] = useState(false);
  const [withdrawDep, setWithdrawDep] = useState(false);
  const [buySell, setBuySell] = useState(false);
  const [buycoverage, setBuyCoverage] = useState(false);
  const [tbtcBalance, setTbtcBalance] = useState(0);
  const [thusdBalance, setThusdBalance] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);
  const [collateralRatio, setCollateralRatio] = useState(0);
  const [totalUsdBalance, setTotalUsdBalance] = useState(0);

  const cardMetrics = [
    { head: "Total Balance", value: `$${totalUsdBalance}`, icn: icn11 },
    { head: "Bitcoin Balance", value: tbtcBalance, icn: icn22 },
    { head: "USDC Balance", value: thusdBalance, icn: icn33 },
    { head: "Virtual Card", value: collateralRatio, icn: icn11 },
  ];
  const cardData = [
    {
      head: "Send & Receive",
      icn: icn1,
      onClick: () => {
        router.push("/btc-exchange");
      },
    },
    // {
    //   head: "Bitcoin Loan",
    //   icn: icn2,
    //   onClick: () => {
    //     router.push("/debt-position");
    //   },
    // },
    {
      head: "Point of Sale",
      icn: icn7,
      onClick: () => {
        setPointSale(!pointSale);
        // router.push("/debt-position");
      },
    },
    {
      head: "Buy & Sell Bitcoin",
      icn: icn3,
      onClick: () => {
        setBuySell(!buySell);
      },
    },
    {
      head: "Withdraw & Deposit Dollars",
      icn: icn4,
      onClick: () => {
        // router.push("/identity");
        setWithdrawDep(!withdrawDep);
      },
    },
    {
      head: "Earn",
      icn: icn5,
      onClick: () => {
        // if (userAuth.login) {
        router.push("/curve-deposit");
        // } else {
        //   toast.error("Please Login!");
        // }
      },
    },
    {
      head: "Virtual Card Balance",
      icn: icn6,
      onClick: () => {
        // setBuyCoverage(!buycoverage);
        router.push("/bitcoin-debt-card");
      },
    },
  ];
  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied Successfully!");
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const fetchTroveData = async (provider) => {
    try {
      if (!provider) return;

      const walletAddress = userAuth?.walletAddress;

      // Create Web3 instance
      const web3 = new Web3Interaction("sepolia", provider);

      // Fetch BTC price
      const receipt = await web3.fetchPrice(
        process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
      );
      const receiptInEther = ethers.utils.formatEther(receipt);
      const btcPrice = parseFloat(receiptInEther) * Math.pow(10, 10);

      // Fetch Trove data
      const troveResponse = await web3.Troves(
        process.env.NEXT_PUBLIC_TROVEMANAGER_CONTRACT_ADDRESS,
        walletAddress
      );

      const coll = troveResponse?.coll;
      const debt = troveResponse?.debt;

      const collInEther = ethers.utils.formatEther(coll);
      const debtInEther = ethers.utils.formatEther(debt);
      // Calculate collateral ratio
      calculateCollateralAndHealthFactor(collInEther, debtInEther, btcPrice);
    } catch (err) {
      console.log(err);
    }
  };

  const calculateCollateralAndHealthFactor = (collateral, debt, btcPrice) => {
    const collateralValue = parseFloat(collateral);
    const collateralValueUSD = parseFloat(collateral) * btcPrice;
    const debtValue = parseFloat(debt);
    const collateralRatio =
      debtValue > 0 ? (collateralValueUSD / debtValue) * 100 : 0;
    const collateralValuee = btcPrice * collateralValue;
    const healthFactor = (collateralValuee * 1.1) / debtValue;
    setHealthFactor(healthFactor ? healthFactor : 0);
    setCollateralRatio(collateralRatio.toFixed(2));
  };

  // useEffect(() => {
  //   if(userAuth?.walletAddress){
  //     const fetcData = async () => {
  //       const balance = await fetchTokenBalances(
  //        [process.env.NEXT_PUBLIC_TBTC_ADDRESS,process.env.NEXT_PUBLIC_THUSD_ADDRESS],
  //         userAuth?.walletAddress
  //       );
  //       console.log(balance);
  //       // fetchWalletHistory().catch(console.error);
  //       // fetchTokenTransfers().catch(console.error);
  //     };

  //     fetcData();
  //   }

  // }, []);

  useEffect(() => {
    if (userAuth?.walletAddress) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          if (userAuth?.passkeyCred) {
            let account = await getAccount(userAuth?.passkeyCred);
            if (account) {
              let provider = await getProvider(account.kernelClient);
              if (provider) {
                try {
                  const balances = await fetchTokenBalances(
                    [
                      process.env.NEXT_PUBLIC_THRESHOLD_TBTC_CONTRACT_ADDRESS,
                      process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
                    ],
                    userAuth?.walletAddress
                  );
                  balances.forEach((token) => {
                    const formattedBalance =
                      Number(token.balance) / 10 ** token.decimals;
                    if (
                      token.token_address.toLowerCase() ===
                      process.env.NEXT_PUBLIC_THRESHOLD_TBTC_CONTRACT_ADDRESS.toLowerCase()
                    ) {
                      setTbtcBalance(formattedBalance.toFixed(2));
                    }
                    if (
                      token.token_address.toLowerCase() ===
                      process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS.toLowerCase()
                    ) {
                      setThusdBalance(formattedBalance.toFixed(2));
                    }
                  });

                  const walletBalance = await fetchBalance(
                    userAuth?.walletAddress
                  );
                  console.log("Wallet Balance Data:", walletBalance);

                  if (walletBalance?.result?.length) {
                    const totalUsd = walletBalance.result.reduce(
                      (sum, token) => sum + (token.usd_value || 0),
                      0
                    );
                    setTotalUsdBalance(totalUsd.toFixed(2));
                  }
                  fetchTroveData(provider?.ethersProvider);
                } catch (err) { }
              }
            }
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching token balances:", error);
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [userAuth?.walletAddress, userAuth?.passkeyCred]);

  return (
    <>
      {pointSale &&
        createPortal(
          <PointOfSalePop
            refundBTC={refundBTC}
            setRefundBTC={setRefundBTC}
            pointSale={pointSale}
            setPointSale={setPointSale}
          />,
          document.body
        )}
      {refundBTC &&
        createPortal(
          <RefundBitcoin refundBTC={refundBTC} setRefundBTC={setRefundBTC} />,
          document.body
        )}
      {isLoading && <LoadingScreen />}

      {buy &&
        createPortal(<BuyBitcoin buy={buy} setBuy={setBuy} />, document.body)}

      {withdrawDep &&
        createPortal(
          <WithdrawDepositPopup
            withdrawDep={withdrawDep}
            setWithdrawDep={setWithdrawDep}
          />,
          document.body
        )}

      {buySell &&
        createPortal(
          <BuySellBitcoinPop buySell={buySell} setBuySell={setBuySell} />,
          document.body
        )}

      {buycoverage &&
        createPortal(
          <BuyCoveragePop
            buycoverage={buycoverage}
            setBuyCoverage={setBuyCoverage}
          />,
          document.body
        )}
      {/* <LoadingScreen /> */}
      <DashboardMain className="relative flex w-full flex-col items-center">
        <div
          className="flex h-full w-full select-none flex-col items-center container"
          style={{ opacity: 1, transform: "none" }}
        >
          <div className="pt-3 md:pt-8 sm:block hidden" />
          {/* <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-3 px-4 md:gap-4">
              <Image
                src={logo}
                alt="logo"
                className="max-w-full mx-auto w-auto mb-3"
                height={100000}
                width={10000}
                style={{ height: 45 }}
              />

              <h1 className="text-center text-19 font-bold md:text-5xl">
                Setup your <span className="themeClr">Madhouse</span> Wallet
              </h1>
            </div>
          </div> */}
          <div className="pt-1 md:pt-6  " />
          <div
            className="flex w-full  animate-in fade-in slide-in-from-bottom-8"
            style={{ opacity: 1, transform: "none" }}
          >
            <div
              className="flex w-full flex-grow flex-col items-center"
              style={{ maxHeight: "max-content" }}
            >
              <div
                className="relative flex w-full flex-grow justify-center  h-auto"
                style={{ maxHeight: "max-content" }}
              >
                <div
                  className="umbrel-hide-scrollbar flex w-full snap-x snap-mandatory  md:max-w-[var(--apps-max-w)] "
                  style={{ maxHeight: "max-content" }}
                >
                  <div
                    data-index={0}
                    className="relative w-full flex-none snap-center"
                    style={{ maxHeight: "max-content" }}
                  >
                    <div className="flex w-full items-stretch justify-center pt-2">
                      <div className="flex w-full max-w-[var(--apps-max-w)] flex-col content-start items-center gap-y-[var(--app-y-gap)] md:px-[var(--apps-padding-x)] px-3">
                        <div className="flex gap-[var(--app-x-gap)] w-full justify-center">
                          <CounterList data={cardMetrics} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full pt-5 md:pt-10 sm:mt-5">
            <div
              className="text-center py-3  px-5 sm:py-8 min-w-0 rounded-xl md:max-w-[var(--apps-max-w)] mx-auto bg-neutral-900/70 shadow-widget
                  backdrop-blur-md backdrop-saturate-250 backdrop-brightness-[1.25] contrast-more:backdrop-blur-none contrast-more:bg-neutral-900 backdrop-saturate-[300%]  ring-white/25"
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {/* {userAuth.login && (
                  <>
                    {" "}
                    <div
                      onClick={() => handleCopy(userAuth?.walletAddress)}
                      className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[42px] px-5 py-4 text-14 backdrop-blur-md"
                      style={{ border: " 1px solid #565656a3", marginTop: 0 }}
                    >
                      <p className="m-0 ">
                        Wallet Address:{" "}
                        <span className="text-[#00FF0A]">
                          {splitAddress(userAuth?.walletAddress)}
                        </span>
                      </p>
                      <div
                        className="rounded-20 p-1 flex items-center gap-1 
                      bg-[#5858583d]
                    backdrop-blur-[17.5px]
  "
                        style={{ borderRadius: 20 }}
                      >
                        <span className=" text-xs">{copyIcn}</span>
                      </div>
                    </div>
                  </>
                )} */}

                {/* <div
                  className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[42px] px-5  py-4 text-14 backdrop-blur-md"
                  style={{ border: " 1px solid #565656a3", marginTop: 0 }}
                >
                  <p className="m-0">
                    Loan-to-Value Ratio:{" "}
                    <span className="text-[#00FF0A]">
                      {healthFactor.toFixed(2)}
                    </span>
                  </p>
                </div> */}
              </div>
              <DashboardLink className="list-none text-center pl-0 mb-0 flex items-start justify-evenly gap-3 sm:pt-6 pt-4 flex-wrap">
                {cardData.map((item, key) => (
                  <li
                    onClick={item.onClick}
                    key={key}
                    className="mx-auto"
                    style={{ maxWidth: 135 }}
                  >
                    <button className="border-0 p-0 bg-transparent">
                      {/* <Image
                        src={item.icn}
                        alt={""}
                        className="max-w-full mx-auto object-contain rounded-15"
                        height={60000}
                        width={60000}
                        style={{ height: 60, width: 60 }}
                      /> */}
                      <span className="icn flex items-center justify-center mx-auto">
                        {item.icn}
                      </span>
                      <span className="block text-xs mt-1 font-semibold text-center">
                        {item.head}
                      </span>
                    </button>
                  </li>
                ))}
              </DashboardLink>
            </div>
          </div>
          <div className="pt-5" />
        </div>
      </DashboardMain>
    </>
  );
};

const DashboardMain = styled.div`
  overflow: auto;
  max-height: calc(100vh - 100px);
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const DashboardLink = styled.ul`
  li {
    width: 16.666%;
    flex-shrink: 0;
    button {
      transition: 0.4s;
      img {
        transition: 0.4s;
        padding: 3px;
      }
      span.icn {
        width: 50px;
        height: 50px;
        background: linear-gradient(180deg, #e2682b 0%, #6b3419 100%);
        border: 1px solid #d46229;
        border-radius: 10px;
        transition: 0.4s;
        svg {
          height: 50%;
          width: 50%;
          path {
            fill: #fff;
          }
        }
      }
      &:hover {
        span.icn,
        img {
          // background: #dddddd78;
          transform: translateY(-10px);
        }
      }
    }
  }
  @media (max-width: 575px) {
    li {
      width: 29.9%;
    }
  }
`;

export default Dashboard;

const umbrelicn = (
  <svg
    width={96}
    viewBox="0 0 96 51"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_d_17_614)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M47.1782 12.0277C56.7533 11.8437 64.2913 14.4199 70.1383 19.4912C74.386 23.1753 77.9382 28.3479 80.6853 35.1793C78.5921 34.6636 76.3796 34.4108 74.0632 34.4108C69.1631 34.4108 64.7655 35.5443 61.1018 38.011C56.997 35.5062 52.5813 34.1897 47.904 34.1897C43.1203 34.1897 38.5282 35.566 34.1699 38.1494C29.9632 35.5031 25.2231 34.1897 20.0514 34.1897C18.1839 34.1897 16.397 34.363 14.7113 34.7253C17.1816 28.4424 20.4497 23.599 24.4176 20.0493C30.0874 14.9771 37.5584 12.2125 47.1782 12.0277ZM10.7066 45.9573C10.8527 45.8248 10.9895 45.6811 11.1154 45.5272C12.8654 43.4968 15.6049 42.2083 20.0514 42.2083C24.2453 42.2083 27.8429 43.3737 30.9889 45.6768L31.1131 45.7692C32.8225 47.0417 35.1497 47.0942 36.9148 45.9C40.6741 43.3565 44.3167 42.2083 47.904 42.2083C51.4278 42.2083 54.8471 43.3149 58.2366 45.7212L58.3073 45.7718C60.1887 47.1178 62.7469 47.0011 64.4981 45.4895C66.7368 43.557 69.8005 42.4293 74.0632 42.4293C78.5486 42.4293 82.026 43.681 84.7721 45.9997C84.8958 46.1084 85.0259 46.2092 85.1615 46.3016C85.5346 46.5569 85.939 46.7412 86.3571 46.856C86.9776 47.0273 87.6473 47.0513 88.3157 46.898C88.6528 46.8211 88.9811 46.7006 89.2916 46.537C90.3478 45.9813 91.0888 44.9851 91.3388 43.8464C91.4447 43.3639 91.4624 42.8559 91.3785 42.345C91.3555 42.2028 91.3247 42.0617 91.2864 41.9224C88.1056 29.5988 82.9054 19.95 75.3922 13.4336C67.7992 6.84799 58.2278 3.79536 47.0242 4.01063C35.8654 4.22503 26.4318 7.48848 19.0713 14.0732C11.7753 20.6001 6.88932 30.0561 4.12211 42.0079C4.08028 42.1742 4.04933 42.3424 4.02919 42.5114C3.88893 43.6668 4.26156 44.7895 4.98699 45.6236C5.36192 46.0546 5.83108 46.4086 6.37237 46.6501C6.72194 46.8067 7.08804 46.9101 7.45906 46.9612C8.66917 47.1306 9.8494 46.7348 10.7066 45.9573Z"
        fill="#5351FB"
      ></path>
    </g>
    <defs>
      <filter
        id="filter0_d_17_614"
        x="0"
        y="0"
        width="95.4314"
        height="51"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        ></feColorMatrix>
        <feOffset></feOffset>
        <feGaussianBlur stdDeviation="2"></feGaussianBlur>
        <feComposite in2="hardAlpha" operator="out"></feComposite>
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        ></feColorMatrix>
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_17_614"
        ></feBlend>
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_17_614"
          result="shape"
        ></feBlend>
      </filter>
    </defs>
  </svg>
);

const icn11 = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_52_8)">
      <path
        d="M27 54C41.9117 54 54 41.9117 54 27C54 12.0883 41.9117 0 27 0C12.0883 0 0 12.0883 0 27C0 41.9117 12.0883 54 27 54Z"
        fill="#FC8148"
      />
    </g>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M26.9984 15.625C27.2568 15.6247 27.5086 15.7066 27.7174 15.8588C27.9263 16.0109 28.0813 16.2256 28.1602 16.4716L33.5 33.1587L35.5898 26.6295C35.6683 26.3834 35.823 26.1686 36.0315 26.0161C36.2401 25.8637 36.4917 25.7814 36.75 25.7813H38.7812C39.1045 25.7813 39.4145 25.9097 39.643 26.1382C39.8716 26.3668 40 26.6768 40 27C40 27.3232 39.8716 27.6332 39.643 27.8618C39.4145 28.0903 39.1045 28.2188 38.7812 28.2188H37.6389L34.6602 37.5284C34.5813 37.774 34.4264 37.9882 34.2179 38.1402C34.0094 38.2922 33.758 38.3741 33.5 38.3741C33.242 38.3741 32.9906 38.2922 32.7821 38.1402C32.5736 37.9882 32.4187 37.774 32.3398 37.5284L27.0081 20.8673L23.2869 32.6485C23.2101 32.8913 23.0592 33.1039 22.8554 33.2565C22.6516 33.4092 22.4051 33.4941 22.1506 33.4995C21.896 33.5049 21.6462 33.4304 21.4361 33.2865C21.2261 33.1426 21.0663 32.9366 20.9794 32.6972L18.9254 27.0488L18.8116 27.3868C18.7308 27.6293 18.5758 27.8404 18.3684 27.99C18.1611 28.1396 17.9119 28.2202 17.6562 28.2204H15.2188C14.8955 28.2204 14.5855 28.092 14.357 27.8634C14.1284 27.6349 14 27.3249 14 27.0016C14 26.6784 14.1284 26.3684 14.357 26.1398C14.5855 25.9113 14.8955 25.7829 15.2188 25.7829H16.7788L17.718 22.9603C17.7976 22.7198 17.9502 22.5102 18.1544 22.3605C18.3587 22.2107 18.6045 22.1284 18.8578 22.1248C19.111 22.1212 19.359 22.1966 19.5674 22.3405C19.7758 22.4844 19.9342 22.6897 20.0206 22.9278L22.0437 28.4934L25.8381 16.4781C25.9158 16.2311 26.0701 16.0153 26.2788 15.8619C26.4874 15.7085 26.7394 15.6255 26.9984 15.625Z"
      fill="black"
    />
    <defs>
      <clipPath id="clip0_52_8">
        <rect width="54" height="54" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const icn22 = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="27" cy="27" r="27" fill="#fc8148" />
    <path
      d="M18.75 19.6875C18.75 19.17 19.17 18.75 19.6875 18.75H21.75V24.0533L19.6335 22.9073C19.3662 22.7624 19.143 22.548 18.9875 22.2867C18.8319 22.0255 18.7499 21.727 18.75 21.423V19.6875ZM23.25 24.8655V18.75H30.75V24.8655L27.09 26.8485C27.0624 26.8636 27.0315 26.8715 27 26.8715C26.9685 26.8715 26.9376 26.8636 26.91 26.8485L23.25 24.8655ZM32.25 24.0533V18.75H34.3125C34.83 18.75 35.25 19.17 35.25 19.6875V21.423C35.2501 21.727 35.1681 22.0255 35.0125 22.2867C34.857 22.548 34.6338 22.7624 34.3665 22.9073L32.25 24.0533ZM19.6875 17.25C19.041 17.25 18.421 17.5068 17.9639 17.9639C17.5068 18.421 17.25 19.041 17.25 19.6875V21.423C17.25 21.9972 17.4052 22.5608 17.699 23.0541C17.9929 23.5475 18.4146 23.9523 18.9195 24.2257L24.9083 27.4703C23.9086 27.945 23.1002 28.7458 22.616 29.7409C22.1318 30.736 22.0006 31.8662 22.2439 32.9458C22.4873 34.0254 23.0907 34.99 23.955 35.6812C24.8192 36.3723 25.893 36.7489 26.9996 36.7489C28.1063 36.7489 29.18 36.3723 30.0443 35.6812C30.9086 34.99 31.512 34.0254 31.7553 32.9458C31.9987 31.8662 31.8674 30.736 31.3832 29.7409C30.899 28.7458 30.0906 27.945 29.091 27.4703L35.0805 24.2257C35.5854 23.9523 36.0071 23.5475 36.301 23.0541C36.5948 22.5608 36.75 21.9972 36.75 21.423V19.6875C36.75 19.041 36.4932 18.421 36.0361 17.9639C35.579 17.5068 34.959 17.25 34.3125 17.25H19.6875ZM23.625 31.875C23.625 30.9799 23.9806 30.1215 24.6135 29.4885C25.2465 28.8556 26.1049 28.5 27 28.5C27.8951 28.5 28.7535 28.8556 29.3865 29.4885C30.0194 30.1215 30.375 30.9799 30.375 31.875C30.375 32.7701 30.0194 33.6285 29.3865 34.2615C28.7535 34.8944 27.8951 35.25 27 35.25C26.1049 35.25 25.2465 34.8944 24.6135 34.2615C23.9806 33.6285 23.625 32.7701 23.625 31.875Z"
      fill="black"
    />
  </svg>
);

const icn33 = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="27" cy="27" r="27" fill="#fc8148" />
    <path
      d="M27 26C27.55 26 28.021 25.8043 28.413 25.413C28.805 25.0217 29.0007 24.5507 29 24C28.9993 23.4493 28.8037 22.9787 28.413 22.588C28.0223 22.1973 27.5513 22.0013 27 22C26.4487 21.9987 25.978 22.1947 25.588 22.588C25.198 22.9813 25.002 23.452 25 24C24.998 24.548 25.194 25.019 25.588 25.413C25.982 25.807 26.4527 26.0027 27 26ZM22 36V34H26V30.9C25.1833 30.7167 24.4543 30.371 23.813 29.863C23.1717 29.355 22.7007 28.7173 22.4 27.95C21.15 27.8 20.1043 27.2543 19.263 26.313C18.4217 25.3717 18.0007 24.2673 18 23V20H22V18H32V20H36V23C36 24.2667 35.579 25.371 34.737 26.313C33.895 27.255 32.8493 27.8007 31.6 27.95C31.3 28.7167 30.8293 29.3543 30.188 29.863C29.5467 30.3717 28.8173 30.7173 28 30.9V34H32V36H22ZM22 25.8V22H20V23C20 23.6333 20.1833 24.2043 20.55 24.713C20.9167 25.2217 21.4 25.584 22 25.8ZM32 25.8C32.6 25.5833 33.0833 25.2207 33.45 24.712C33.8167 24.2033 34 23.6327 34 23V22H32V25.8Z"
      fill="black"
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

const icn1 = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M26.6589 20.4108C26.4109 20.182 26.1017 20.0306 25.769 19.975C25.4363 19.9195 25.0946 19.9622 24.7858 20.0979C24.4771 20.2337 24.2146 20.4566 24.0306 20.7393C23.8466 21.022 23.7491 21.3522 23.75 21.6895V22.5327H21.6487C22.6363 21.705 23.4292 20.6697 23.9711 19.5007C24.513 18.3316 24.7906 17.0574 24.784 15.7689C24.7774 14.4804 24.4869 13.2091 23.9332 12.0456C23.3794 10.8821 22.5759 9.85502 21.58 9.03738C21.9058 8.94723 22.1932 8.75305 22.3984 8.48441C22.6036 8.21578 22.7154 7.88742 22.7167 7.54938V4.44938C22.7167 4.03829 22.5534 3.64404 22.2627 3.35336C21.972 3.06268 21.5778 2.89938 21.1667 2.89938H8.25003V2.05618C8.25105 1.71883 8.15361 1.38852 7.96966 1.10573C7.78572 0.822947 7.52325 0.599983 7.21445 0.464176C6.90564 0.328368 6.56392 0.285618 6.23118 0.341169C5.89844 0.396719 5.58913 0.548155 5.34119 0.776909L1.05854 4.72011C0.882447 4.88343 0.741966 5.08136 0.645898 5.30148C0.549831 5.52161 0.500244 5.7592 0.500244 5.99938C0.500244 6.23955 0.549831 6.47714 0.645898 6.69727C0.741966 6.9174 0.882447 7.11532 1.05854 7.27864L5.34223 11.2218C5.65887 11.5171 6.07542 11.6817 6.50834 11.6827C6.75038 11.6822 6.98967 11.6313 7.21101 11.5334C7.52172 11.4002 7.78612 11.1781 7.97099 10.895C8.15586 10.612 8.25293 10.2806 8.25003 9.94258V9.09938H10.3518C9.36434 9.92713 8.57144 10.9624 8.02954 12.1314C7.48765 13.3004 7.21008 14.5745 7.21659 15.8631C7.2231 17.1516 7.51353 18.4228 8.06722 19.5863C8.6209 20.7498 9.42423 21.777 10.42 22.5947C10.0942 22.6849 9.80682 22.879 9.60161 23.1477C9.3964 23.4163 9.28464 23.7447 9.28336 24.0827V27.1827C9.28336 27.5938 9.44666 27.988 9.73734 28.2787C10.028 28.5694 10.4223 28.7327 10.8334 28.7327H23.75V29.5754C23.7469 29.9135 23.8438 30.245 24.0284 30.5282C24.2131 30.8114 24.4774 31.0337 24.788 31.1672C25.0094 31.2651 25.2486 31.316 25.4907 31.3166C25.9245 31.3146 26.3415 31.1485 26.6578 30.8516L30.9405 26.9094C31.1166 26.746 31.2571 26.5481 31.3531 26.3279C31.4492 26.1077 31.4988 25.8701 31.4988 25.6299C31.4988 25.3897 31.4492 25.152 31.3531 24.9319C31.2571 24.7117 31.1166 24.5137 30.9405 24.3503L26.6589 20.4108ZM7.73336 8.06604C7.59633 8.06604 7.46491 8.12048 7.36802 8.21737C7.27113 8.31427 7.21669 8.44568 7.21669 8.58271V9.94206C7.21694 10.0781 7.17753 10.2113 7.10328 10.3253C7.02904 10.4394 6.92317 10.5293 6.79864 10.5841C6.6741 10.6389 6.53629 10.6562 6.40206 10.634C6.26783 10.6117 6.143 10.5508 6.04283 10.4587L1.75811 6.51604C1.68709 6.44959 1.63047 6.36926 1.59177 6.28003C1.55306 6.1908 1.53309 6.09457 1.53309 5.99731C1.53309 5.90005 1.55306 5.80382 1.59177 5.71459C1.63047 5.62536 1.68709 5.54503 1.75811 5.47858L6.04076 1.53486C6.14099 1.44285 6.26585 1.38201 6.40009 1.35978C6.53433 1.33755 6.67213 1.35489 6.79667 1.40969C6.92122 1.46448 7.02711 1.55435 7.10142 1.66833C7.17574 1.78231 7.21525 1.91546 7.21514 2.05153V3.41604C7.21514 3.55307 7.26958 3.68449 7.36647 3.78138C7.46336 3.87827 7.59478 3.93271 7.73181 3.93271H21.1667C21.3037 3.93271 21.4351 3.98714 21.532 4.08404C21.6289 4.18093 21.6834 4.31235 21.6834 4.44938V7.54938C21.6834 7.6864 21.6289 7.81782 21.532 7.91471C21.4351 8.01161 21.3037 8.06604 21.1667 8.06604H20.1261C18.8567 7.38732 17.4395 7.03222 16 7.03222C14.5606 7.03222 13.1433 7.38732 11.8739 8.06604H7.73336ZM8.25003 15.816C8.25003 14.2832 8.70456 12.7849 9.55614 11.5104C10.4077 10.2359 11.6181 9.24256 13.0342 8.65598C14.4504 8.0694 16.0086 7.91592 17.512 8.21496C19.0153 8.51399 20.3962 9.25211 21.4801 10.336C22.564 11.4198 23.3021 12.8007 23.6011 14.3041C23.9001 15.8074 23.7467 17.3657 23.1601 18.7818C22.5735 20.198 21.5802 21.4084 20.3057 22.2599C19.0312 23.1115 17.5328 23.566 16 23.566C13.9453 23.5637 11.9754 22.7465 10.5225 21.2936C9.06961 19.8407 8.25235 17.8708 8.25003 15.816ZM30.2414 26.152L25.9583 30.0952C25.858 30.188 25.7329 30.2494 25.5981 30.2719C25.4634 30.2944 25.325 30.277 25.2001 30.2218C25.0752 30.1666 24.9691 30.076 24.8951 29.9612C24.821 29.8464 24.7822 29.7125 24.7834 29.5759V28.216C24.7834 28.079 24.7289 27.9476 24.632 27.8507C24.5351 27.7538 24.4037 27.6994 24.2667 27.6994H10.8334C10.6963 27.6994 10.5649 27.6449 10.468 27.548C10.3711 27.4512 10.3167 27.3197 10.3167 27.1827V24.0827C10.3167 23.9457 10.3711 23.8143 10.468 23.7174C10.5649 23.6205 10.6963 23.566 10.8334 23.566H11.8744C13.1437 24.2448 14.5607 24.5999 16 24.5999C17.4393 24.5999 18.8564 24.2448 20.1256 23.566H24.2667C24.4037 23.566 24.5351 23.5116 24.632 23.4147C24.7289 23.3178 24.7834 23.1864 24.7834 23.0494V21.6895C24.7824 21.5531 24.8213 21.4194 24.8953 21.3049C24.9693 21.1903 25.0752 21.0999 25.1999 21.0447C25.3246 20.9895 25.4628 20.972 25.5973 20.9943C25.7319 21.0166 25.857 21.0778 25.9572 21.1703L30.2419 25.116C30.313 25.1825 30.3696 25.2629 30.4083 25.3522C30.447 25.4415 30.467 25.5377 30.467 25.635C30.467 25.7323 30.447 25.8286 30.4083 25.9179C30.3696 26.0072 30.313 26.0875 30.2419 26.154L30.2414 26.152Z"
      fill="#E2682B"
    />
    <path
      d="M13.9332 18.3991C13.9332 18.2621 13.8788 18.1307 13.7819 18.0338C13.685 17.9369 13.5536 17.8825 13.4166 17.8825C13.2795 17.8825 13.1481 17.9369 13.0512 18.0338C12.9543 18.1307 12.8999 18.2621 12.8999 18.3991C12.9013 19.131 13.1613 19.8389 13.634 20.3976C14.1067 20.9564 14.7617 21.33 15.4832 21.4526V22.0158C15.4832 22.1528 15.5377 22.2842 15.6346 22.3811C15.7315 22.478 15.8629 22.5325 15.9999 22.5325C16.1369 22.5325 16.2683 22.478 16.3652 22.3811C16.4621 22.2842 16.5166 22.1528 16.5166 22.0158V21.4526C17.2386 21.3312 17.8943 20.9578 18.3671 20.3988C18.84 19.8398 19.0994 19.1313 19.0994 18.3991C19.0994 17.6669 18.84 16.9585 18.3671 16.3994C17.8943 15.8404 17.2386 15.4671 16.5166 15.3456V11.2392C16.9589 11.3534 17.3509 11.6109 17.6314 11.9716C17.9118 12.3322 18.0649 12.7756 18.0666 13.2325C18.0666 13.3695 18.121 13.5009 18.2179 13.5978C18.3148 13.6947 18.4462 13.7491 18.5832 13.7491C18.7203 13.7491 18.8517 13.6947 18.9486 13.5978C19.0455 13.5009 19.0999 13.3695 19.0999 13.2325C19.0985 12.5006 18.8385 11.7927 18.3658 11.234C17.8931 10.6752 17.2381 10.3015 16.5166 10.179V9.61579C16.5166 9.47876 16.4621 9.34734 16.3652 9.25045C16.2683 9.15356 16.1369 9.09912 15.9999 9.09912C15.8629 9.09912 15.7315 9.15356 15.6346 9.25045C15.5377 9.34734 15.4832 9.47876 15.4832 9.61579V10.179C14.7612 10.3004 14.1056 10.6738 13.6327 11.2328C13.1599 11.7918 12.9004 12.5003 12.9004 13.2325C12.9004 13.9646 13.1599 14.6731 13.6327 15.2321C14.1056 15.7912 14.7612 16.1645 15.4832 16.286V20.3924C15.0409 20.2782 14.6489 20.0207 14.3684 19.66C14.088 19.2994 13.9349 18.856 13.9332 18.3991ZM18.0666 18.3991C18.0649 18.856 17.9118 19.2994 17.6314 19.66C17.3509 20.0207 16.9589 20.2782 16.5166 20.3924V16.4058C16.9589 16.52 17.3509 16.7776 17.6314 17.1382C17.9118 17.4989 18.0649 17.9423 18.0666 18.3991ZM13.9332 13.2325C13.9349 12.7756 14.088 12.3322 14.3684 11.9716C14.6489 11.6109 15.0409 11.3534 15.4832 11.2392V15.2258C15.0409 15.1115 14.6489 14.854 14.3684 14.4933C14.088 14.1327 13.9349 13.6893 13.9332 13.2325Z"
      fill="#E2682B"
    />
  </svg>
);

const icn2 = (
  <svg
    width="22"
    height="32"
    viewBox="0 0 22 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.7769 21.382C21.7692 21.3087 21.7472 21.2376 21.712 21.1729C21.6768 21.1081 21.6293 21.0509 21.572 21.0045C21.5148 20.9582 21.4489 20.9235 21.3783 20.9026C21.3076 20.8816 21.2335 20.8748 21.1603 20.8825C21.087 20.8902 21.0159 20.9123 20.9512 20.9474C20.8864 20.9826 20.8292 21.0302 20.7828 21.0874C20.6892 21.2031 20.6453 21.3512 20.6608 21.4992C20.833 23.189 20.9373 25.3377 19.8167 26.7712C16.2065 32.3949 1.73699 31.9288 1.2412 23.8172C1.12398 14.8592 6.23617 11.8026 9.29396 10.7773C13.0612 9.53165 18.879 13.0555 20.3024 19.3247C20.3363 19.4696 20.4263 19.5951 20.5526 19.6736C20.679 19.7522 20.8314 19.7773 20.9763 19.7434C21.1212 19.7096 21.2467 19.6196 21.3252 19.4932C21.4037 19.3668 21.4288 19.2144 21.395 19.0696C21.0357 17.3088 20.2994 15.6468 19.2368 14.1977C18.1741 12.7485 16.8103 11.5467 15.239 10.6747C16.0566 10.1412 16.7535 9.44247 17.2847 8.62344C17.816 7.80442 18.1699 6.88324 18.3237 5.91918C18.8083 3.53611 17.1207 2.17099 15.1605 2.21866C15.1577 1.96057 15.1416 1.7028 15.1123 1.44636C15.075 1.2021 14.9715 0.972732 14.8129 0.783187C14.6544 0.593642 14.447 0.451174 14.2132 0.37127C13.9794 0.291366 13.7281 0.277083 13.4868 0.329973C13.2454 0.382864 13.0231 0.500903 12.8442 0.671262C12.6937 0.802487 12.5287 0.915965 12.3523 1.00946C11.9317 1.24348 11.4593 1.36854 10.978 1.37324C10.4967 1.37794 10.0219 1.26214 9.59682 1.03638C9.42449 0.946673 9.26601 0.832579 9.12626 0.697622C8.94972 0.530103 8.72977 0.415403 8.49136 0.366531C8.25295 0.31766 8.00561 0.336571 7.7774 0.42112C7.0023 0.681357 6.81946 1.47945 6.85311 2.21866C4.92433 2.16818 3.20475 3.52377 3.68316 5.87095C3.8314 6.84114 4.18198 7.76931 4.71214 8.59524C5.24231 9.42117 5.94022 10.1264 6.76057 10.6651C3.60857 12.392 0.0179716 16.0645 0.120047 23.8318C0.322516 28.539 4.77963 31.6142 11.317 31.6978C16.7146 31.4544 19.4123 29.2412 20.7259 27.4274C22.0242 25.7695 21.9928 23.3595 21.7769 21.382ZM17.2115 5.78346C17.202 5.89114 16.9491 8.38863 14.0663 10.0987C13.6786 9.92737 13.2806 9.78069 12.8745 9.65953C14.0253 7.71961 14.7834 5.57229 15.1055 3.33981C16.4953 3.31289 17.5699 4.02798 17.2115 5.78346ZM4.7959 5.73747C4.44256 4.02854 5.54913 3.30111 6.9092 3.33925C7.00903 3.86645 6.91537 4.97695 7.73983 4.85524C7.8119 4.83998 7.88027 4.81066 7.94101 4.76897C8.00176 4.72727 8.05369 4.67402 8.09385 4.61224C8.134 4.55047 8.1616 4.48139 8.17505 4.40896C8.1885 4.33652 8.18755 4.26214 8.17225 4.19007C7.99357 3.35842 7.93783 2.50507 8.00679 1.65725C8.01282 1.616 8.03017 1.57724 8.0569 1.54526C8.08363 1.51328 8.1187 1.48934 8.15822 1.47609C8.1898 1.46235 8.22465 1.45795 8.25865 1.46342C8.29265 1.46889 8.32436 1.48399 8.35004 1.50694C8.96239 2.05069 9.72919 2.38975 10.5435 2.47682C11.3578 2.56389 12.1789 2.39463 12.8924 1.99264C13.1468 1.85634 13.3846 1.6909 13.6008 1.49964C14.2407 1.04479 13.9995 2.54957 14.0136 2.88496C13.9154 4.76999 13.1106 6.96125 11.7219 9.42453C11.2453 9.37169 10.7644 9.37131 10.2878 9.42341C9.71838 8.43888 9.22615 7.41167 8.81555 6.35104C8.76175 6.21343 8.65583 6.1026 8.52079 6.04264C8.38575 5.98268 8.2325 5.97843 8.09435 6.03081C7.95619 6.08319 7.84429 6.18797 7.78294 6.32239C7.7216 6.45681 7.71578 6.61 7.76675 6.74869C8.15284 7.7492 8.60921 8.72116 9.13243 9.65728C8.72574 9.77837 8.3268 9.92409 7.93781 10.0936C5.06286 8.38358 4.81048 5.89058 4.7959 5.73747Z"
      fill="#E2682B"
    />
    <path
      d="M10.9968 23.6977C10.8494 23.6972 10.7077 23.6411 10.5998 23.5407C10.4919 23.4403 10.4258 23.3029 10.4146 23.1559C10.4018 23.0085 10.3322 22.8718 10.2206 22.7747C10.109 22.6775 9.96402 22.6274 9.81622 22.6349C8.64178 22.8873 9.67881 24.5665 10.436 24.7179C10.4443 24.8588 10.5061 24.9913 10.6086 25.0883C10.7112 25.1853 10.8468 25.2396 10.988 25.2402C11.1291 25.2408 11.2652 25.1876 11.3686 25.0914C11.4719 24.9952 11.5347 24.8633 11.5442 24.7224C11.7902 24.6414 12.0144 24.505 12.1993 24.3236C12.4346 24.0843 12.5944 23.7811 12.659 23.4517C12.7235 23.1222 12.6899 22.7811 12.5623 22.4707C12.4347 22.1602 12.2188 21.894 11.9413 21.7052C11.6638 21.5163 11.3369 21.4131 11.0013 21.4083C10.8886 21.4078 10.7785 21.3746 10.6842 21.3129C10.5899 21.2512 10.5155 21.1634 10.47 21.0603C10.4245 20.9572 10.4097 20.8432 10.4276 20.7319C10.4455 20.6206 10.4952 20.5169 10.5707 20.4332C10.6462 20.3496 10.7443 20.2896 10.8532 20.2605C10.9621 20.2313 11.0771 20.2343 11.1843 20.2691C11.2915 20.3039 11.3863 20.369 11.4573 20.4565C11.5284 20.544 11.5726 20.6502 11.5846 20.7622C11.5916 20.8358 11.6131 20.9072 11.6481 20.9722C11.683 21.0373 11.7305 21.0948 11.7879 21.1413C11.8453 21.1878 11.9114 21.2223 11.9823 21.243C12.0533 21.2636 12.1276 21.2698 12.201 21.2614C13.3462 20.9765 12.3008 19.3657 11.5605 19.2171C11.5525 19.0753 11.4906 18.942 11.3874 18.8445C11.2841 18.747 11.1475 18.6928 11.0055 18.6929C10.8636 18.6931 10.727 18.7476 10.624 18.8453C10.521 18.943 10.4593 19.0764 10.4517 19.2182C10.1808 19.3138 9.93828 19.476 9.74653 19.6899C9.55478 19.9039 9.41993 20.1626 9.3544 20.4423C9.28887 20.722 9.29477 21.0137 9.37156 21.2905C9.44834 21.5673 9.59354 21.8204 9.79378 22.0264C9.9512 22.186 10.1388 22.3127 10.3456 22.3991C10.5524 22.4856 10.7743 22.5301 10.9985 22.53C11.1533 22.5303 11.3018 22.592 11.4111 22.7016C11.5204 22.8113 11.5817 22.9599 11.5815 23.1147C11.5813 23.2696 11.5196 23.418 11.4099 23.5273C11.3003 23.6367 11.1517 23.698 10.9968 23.6977Z"
      fill="#E2682B"
    />
    <path
      d="M6.3378 23.2059C6.30345 23.0634 6.21472 22.9401 6.0906 22.8622C5.96648 22.7844 5.81682 22.7582 5.67364 22.7893C5.53045 22.8203 5.40511 22.9062 5.32442 23.0285C5.24373 23.1508 5.21411 23.2998 5.24188 23.4437C5.53078 24.7438 6.25311 25.9071 7.29029 26.7426C8.32747 27.5781 9.61788 28.0361 10.9497 28.0416C17.2784 27.9485 19.0232 19.4257 13.266 16.848V15.7084C13.2604 15.4942 13.2085 15.2837 13.1139 15.0914C13.0194 14.8991 12.8844 14.7295 12.7182 14.5943C12.552 14.459 12.3586 14.3612 12.1511 14.3076C11.9437 14.254 11.7271 14.2459 11.5162 14.2838C11.4864 14.1338 11.4882 13.9793 11.5214 13.8301C11.5546 13.6809 11.6184 13.5401 11.7089 13.4169C11.7993 13.2937 11.9144 13.1906 12.0469 13.1142C12.1793 13.0378 12.3261 12.9898 12.4781 12.9732C12.6301 12.9566 12.7839 12.9718 12.9297 13.0178C13.0754 13.0639 13.2101 13.1397 13.325 13.2405C13.4399 13.3413 13.5326 13.465 13.5972 13.6035C13.6618 13.7421 13.6968 13.8926 13.7001 14.0454C13.7009 14.5918 13.9183 15.1157 14.3047 15.502C14.691 15.8884 15.2149 16.1058 15.7613 16.1066C15.8471 16.1291 15.9369 16.1317 16.0239 16.1141C16.1109 16.0965 16.1926 16.0591 16.2629 16.005C16.3331 15.9508 16.39 15.8812 16.4292 15.8016C16.4683 15.722 16.4887 15.6344 16.4887 15.5457C16.4887 15.457 16.4683 15.3694 16.4292 15.2898C16.39 15.2102 16.3331 15.1406 16.2629 15.0864C16.1926 15.0323 16.1109 14.9949 16.0239 14.9773C15.9369 14.9597 15.8471 14.9623 15.7613 14.9849C15.5123 14.9844 15.2736 14.8853 15.0975 14.7092C14.9214 14.5331 14.8223 14.2944 14.8219 14.0454C14.8213 13.4586 14.5879 12.896 14.173 12.481C13.7581 12.066 13.1955 11.8325 12.6087 11.8317C12.2981 11.8342 11.9914 11.9013 11.7081 12.0286C11.4248 12.1559 11.171 12.3406 10.9629 12.5712C10.7548 12.8017 10.5968 13.073 10.4991 13.3678C10.4013 13.6626 10.3659 13.9746 10.395 14.2838C10.183 14.2438 9.96476 14.2503 9.75546 14.3028C9.54616 14.3554 9.35077 14.4527 9.18278 14.5882C9.0148 14.7236 8.87822 14.894 8.78249 15.0874C8.68676 15.2808 8.63416 15.4926 8.62833 15.7084V16.8598C7.77973 17.2276 7.03037 17.7913 6.44164 18.5046C5.85291 19.218 5.44157 20.0606 5.24132 20.9636C5.21001 21.109 5.23777 21.261 5.3185 21.386C5.39923 21.511 5.5263 21.5988 5.67178 21.6301C5.81726 21.6615 5.96921 21.6337 6.09422 21.553C6.21923 21.4722 6.30704 21.3452 6.33836 21.1997C6.58675 20.0631 7.24628 19.0584 8.19029 18.3784C9.13429 17.6985 10.2962 17.3913 11.4529 17.5158C12.6096 17.6402 13.6796 18.1877 14.4573 19.0529C15.235 19.9182 15.6656 21.0402 15.6665 22.2036C15.5179 27.843 7.68553 28.6692 6.3378 23.2059ZM9.74948 16.4936V15.7084C9.75037 15.6272 9.78341 15.5498 9.84135 15.493C9.89928 15.4362 9.97739 15.4047 10.0585 15.4055H11.8353C11.9163 15.4049 11.9943 15.4364 12.0521 15.4932C12.1099 15.55 12.1429 15.6273 12.1438 15.7084V16.4952C11.3543 16.3308 10.5395 16.3308 9.75004 16.4952L9.74948 16.4936Z"
      fill="#E2682B"
    />
    <path
      d="M17.376 17.9983C17.5166 17.9615 17.6375 17.8715 17.7131 17.7473C17.7886 17.6231 17.813 17.4744 17.7811 17.3326C17.7492 17.1907 17.6634 17.0668 17.5419 16.987C17.4204 16.9072 17.2726 16.8776 17.1298 16.9047C16.8267 16.9663 16.5115 16.9151 16.2436 16.7605C16.12 16.6777 15.9685 16.6473 15.8225 16.6761C15.6765 16.7049 15.548 16.7906 15.4651 16.9142C15.3823 17.0378 15.3519 17.1893 15.3807 17.3353C15.4096 17.4812 15.4952 17.6098 15.6188 17.6927C15.995 17.9286 16.43 18.054 16.874 18.0544C17.0429 18.0543 17.2112 18.0355 17.376 17.9983Z"
      fill="#E2682B"
    />
  </svg>
);

const icn3 = (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.1494 16.3582H9.57703V15.4303H10.5764V16.3582H12.004V15.4303H12.2895C13.8599 15.4303 15.0734 14.1454 15.0734 12.6464C15.0734 11.7184 14.6451 10.9332 13.9313 10.3622C14.3596 9.8625 14.6451 9.29145 14.6451 8.57763C14.6451 7.15 13.4316 5.93651 12.004 5.93651V5.07993H10.5764V6.00789H9.57703V5.07993H8.1494V6.00789H7.22144V15.4303H8.22078V16.3582H8.1494ZM8.64907 7.43553H12.004C12.6464 7.43553 13.2175 8.00658 13.2175 8.64901C13.2175 9.29145 12.6464 9.8625 12.004 9.8625H8.64907V7.43553ZM12.004 11.2901H12.2895C13.0747 11.2901 13.6458 11.9326 13.6458 12.6464C13.6458 13.3602 13.0033 14.0026 12.2895 14.0026H8.64907V11.2901H12.004Z"
      fill="#E2682B"
    />
    <path
      d="M10.7191 19.9273C15.7872 19.9273 19.856 15.7872 19.856 10.7905C19.856 5.79375 15.7872 1.58224 10.7191 1.58224C5.65103 1.58224 1.58228 5.72237 1.58228 10.7191C1.58228 15.7158 5.72241 19.9273 10.7191 19.9273ZM10.7191 3.00987C15.002 3.00987 18.4283 6.50757 18.4283 10.7191C18.4283 15.002 14.9306 18.4283 10.7191 18.4283C6.5076 18.4283 3.00991 15.002 3.00991 10.7191C3.00991 6.50757 6.5076 3.00987 10.7191 3.00987ZM28.4931 24.924C28.9214 24.4243 29.2069 23.8533 29.2069 23.1395C29.2069 21.6405 27.9935 20.4984 26.5658 20.4984V19.5704H25.1382V20.4984H24.1389V19.5704H22.7112V20.4984H21.7119V29.9921H22.7112V30.9201H24.1389V29.9921H25.1382V30.9201H26.5658V29.9921H26.8514C28.4217 29.9921 29.6352 28.7072 29.6352 27.2082C29.6352 26.2803 29.1356 25.4951 28.4931 24.924ZM23.1395 21.926H26.4944C27.1369 21.926 27.7079 22.497 27.7079 23.1395C27.7079 23.7819 27.2083 24.4243 26.4944 24.4243H23.1395V21.926ZM26.8514 28.5645H23.2109V25.852H26.8514C27.6366 25.852 28.2076 26.4944 28.2076 27.2082C28.2076 27.9934 27.5652 28.5645 26.8514 28.5645Z"
      fill="#E2682B"
    />
    <path
      d="M25.281 16.0727C20.2129 16.0727 16.1441 20.2128 16.1441 25.2095C16.1441 30.2062 20.2129 34.4178 25.281 34.4178C30.3491 34.4178 34.4178 30.2776 34.4178 25.2809C34.4178 20.2842 30.2777 16.0727 25.281 16.0727ZM25.281 32.9901C20.9981 32.9901 17.5717 29.4924 17.5717 25.2809C17.5717 20.998 21.0694 17.5717 25.281 17.5717C29.4925 17.5717 32.9902 20.998 32.9902 25.2809C32.9902 29.4924 29.4925 32.9901 25.281 32.9901ZM30.2063 13.7171L28.9214 12.4322C28.6359 12.1467 28.2076 12.1467 27.9221 12.4322C27.6366 12.7178 27.6366 13.1461 27.9221 13.4316L31.0629 16.5724L34.2037 13.4316C34.4892 13.1461 34.4892 12.7178 34.2037 12.4322C33.9181 12.1467 33.4898 12.1467 33.2043 12.4322L31.6339 14.0026C30.9201 8.57763 26.2803 4.4375 20.6412 4.4375V5.86513C25.4237 5.79375 29.3497 9.22007 30.2063 13.7171ZM5.79379 22.2829L7.07866 23.5678C7.2928 23.7105 7.43556 23.7819 7.64971 23.7819C7.86385 23.7819 8.00662 23.7105 8.14938 23.5678C8.43491 23.2822 8.43491 22.8539 8.14938 22.5684L4.93721 19.4276L1.79642 22.5684C1.51089 22.8539 1.51089 23.2822 1.79642 23.5678C2.08195 23.8533 2.51024 23.8533 2.79576 23.5678L4.36616 21.9974C5.07997 27.4224 9.71977 31.5625 15.3589 31.5625V30.1349C10.5764 30.2063 6.65037 26.7799 5.79379 22.2829Z"
      fill="#E2682B"
    />
  </svg>
);

const icn4 = (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M31.4607 16.1305H29.9651C29.6676 16.1305 29.3823 16.0123 29.172 15.8019C28.9616 15.5916 28.8434 15.3063 28.8434 15.0088C28.8434 14.7113 28.9616 14.426 29.172 14.2156C29.3823 14.0052 29.6676 13.8871 29.9651 13.8871H31.4607C31.5595 13.8859 31.654 13.8461 31.7238 13.7763C31.7937 13.7064 31.8335 13.612 31.8346 13.5132V4.53947C31.8335 4.44067 31.7937 4.34624 31.7238 4.27637C31.654 4.2065 31.5595 4.16673 31.4607 4.16557H4.53969C4.44088 4.16673 4.34646 4.2065 4.27659 4.27637C4.20672 4.34624 4.16695 4.44067 4.16578 4.53947V13.5132C4.16695 13.612 4.20672 13.7064 4.27659 13.7763C4.34646 13.8461 4.44088 13.8859 4.53969 13.8871H9.02653C9.32403 13.8871 9.60934 14.0052 9.8197 14.2156C10.0301 14.426 10.1482 14.7113 10.1482 15.0088C10.1482 15.3063 10.0301 15.5916 9.8197 15.8019C9.60934 16.0123 9.32403 16.1305 9.02653 16.1305H4.53969C3.84577 16.1297 3.18051 15.8537 2.68983 15.363C2.19916 14.8723 1.92315 14.2071 1.92236 13.5132V4.53947C1.92315 3.84556 2.19916 3.18029 2.68983 2.68962C3.18051 2.19895 3.84577 1.92294 4.53969 1.92215H31.4607C32.1547 1.92294 32.8199 2.19895 33.3106 2.68962C33.8013 3.18029 34.0773 3.84556 34.0781 4.53947V13.5132C34.0773 14.2071 33.8013 14.8723 33.3106 15.363C32.8199 15.8537 32.1547 16.1297 31.4607 16.1305Z"
      fill="#E2682B"
    />
    <path
      d="M25.4783 34.0779H10.5221C9.8282 34.0771 9.16293 33.8011 8.67226 33.3104C8.18158 32.8197 7.90558 32.1544 7.90479 31.4605V13.5132C7.90479 13.2157 8.02296 12.9304 8.23333 12.72C8.44369 12.5096 8.729 12.3914 9.0265 12.3914C9.32399 12.3914 9.6093 12.5096 9.81966 12.72C10.03 12.9304 10.1482 13.2157 10.1482 13.5132V31.4605C10.1482 31.5597 10.1876 31.6548 10.2577 31.7249C10.3278 31.795 10.4229 31.8344 10.5221 31.8344H25.4783C25.5774 31.8344 25.6725 31.795 25.7426 31.7249C25.8128 31.6548 25.8522 31.5597 25.8522 31.4605V10.148H9.0265C8.729 10.148 8.44369 10.0298 8.23333 9.81948C8.02296 9.60912 7.90479 9.32381 7.90479 9.02632C7.90479 8.72882 8.02296 8.44351 8.23333 8.23315C8.44369 8.02278 8.729 7.9046 9.0265 7.9046H26.9739C27.2714 7.9046 27.5567 8.02278 27.767 8.23315C27.9774 8.44351 28.0956 8.72882 28.0956 9.02632V31.4605C28.0948 32.1544 27.8188 32.8197 27.3281 33.3104C26.8374 33.8011 26.1722 34.0771 25.4783 34.0779Z"
      fill="#E2682B"
    />
    <path
      d="M18.0001 22.1129C17.3346 22.1129 16.684 21.9156 16.1306 21.5458C15.5772 21.176 15.1459 20.6505 14.8912 20.0356C14.6365 19.4207 14.5698 18.7441 14.6997 18.0913C14.8295 17.4385 15.15 16.8389 15.6206 16.3683C16.0913 15.8977 16.6909 15.5772 17.3436 15.4473C17.9964 15.3175 18.673 15.3841 19.2879 15.6388C19.9028 15.8935 20.4284 16.3248 20.7981 16.8782C21.1679 17.4316 21.3653 18.0822 21.3653 18.7478C21.3653 19.0453 21.2471 19.3306 21.0367 19.541C20.8264 19.7513 20.5411 19.8695 20.2436 19.8695C19.9461 19.8695 19.6608 19.7513 19.4504 19.541C19.24 19.3306 19.1219 19.0453 19.1219 18.7478C19.1219 18.526 19.0561 18.3091 18.9328 18.1246C18.8096 17.9402 18.6344 17.7964 18.4294 17.7115C18.2244 17.6266 17.9989 17.6044 17.7813 17.6476C17.5637 17.6909 17.3638 17.7978 17.207 17.9546C17.0501 18.1115 16.9433 18.3114 16.9 18.529C16.8567 18.7466 16.8789 18.9721 16.9638 19.1771C17.0487 19.382 17.1925 19.5572 17.377 19.6805C17.5614 19.8037 17.7783 19.8695 18.0001 19.8695C18.2976 19.8695 18.583 19.9877 18.7933 20.1981C19.0037 20.4084 19.1219 20.6937 19.1219 20.9912C19.1219 21.2887 19.0037 21.574 18.7933 21.7844C18.583 21.9948 18.2976 22.1129 18.0001 22.1129Z"
      fill="#E2682B"
    />
    <path
      d="M18.0001 26.5998C17.108 26.5986 16.2528 26.2437 15.6219 25.6128C14.9911 24.982 14.6362 24.1268 14.635 23.2346C14.635 22.9372 14.7532 22.6518 14.9636 22.4415C15.1739 22.2311 15.4592 22.1129 15.7567 22.1129C16.0542 22.1129 16.3395 22.2311 16.5499 22.4415C16.7603 22.6518 16.8784 22.9372 16.8784 23.2346C16.8784 23.4565 16.9442 23.6734 17.0675 23.8578C17.1907 24.0423 17.3659 24.1861 17.5709 24.271C17.7758 24.3559 18.0014 24.3781 18.219 24.3348C18.4366 24.2915 18.6364 24.1847 18.7933 24.0278C18.9502 23.8709 19.057 23.6711 19.1003 23.4535C19.1436 23.2359 19.1214 23.0104 19.0365 22.8054C18.9516 22.6004 18.8078 22.4252 18.6233 22.302C18.4389 22.1787 18.222 22.1129 18.0001 22.1129C17.7026 22.1129 17.4173 21.9948 17.207 21.7844C16.9966 21.574 16.8784 21.2887 16.8784 20.9912C16.8784 20.6937 16.9966 20.4084 17.207 20.1981C17.4173 19.9877 17.7026 19.8695 18.0001 19.8695C18.8926 19.8695 19.7486 20.2241 20.3796 20.8551C21.0107 21.4862 21.3653 22.3422 21.3653 23.2346C21.3653 24.1271 21.0107 24.9831 20.3796 25.6142C19.7486 26.2452 18.8926 26.5998 18.0001 26.5998ZM18.0001 17.6261C17.7026 17.6261 17.4173 17.5079 17.207 17.2976C16.9966 17.0872 16.8784 16.8019 16.8784 16.5044V15.0088C16.8784 14.7113 16.9966 14.426 17.207 14.2156C17.4173 14.0052 17.7026 13.8871 18.0001 13.8871C18.2976 13.8871 18.5829 14.0052 18.7933 14.2156C19.0037 14.426 19.1219 14.7113 19.1219 15.0088V16.5044C19.1219 16.8019 19.0037 17.0872 18.7933 17.2976C18.5829 17.5079 18.2976 17.6261 18.0001 17.6261Z"
      fill="#E2682B"
    />
    <path
      d="M18.0002 28.0954C17.7027 28.0954 17.4174 27.9772 17.207 27.7669C16.9967 27.5565 16.8785 27.2712 16.8785 26.9737V25.4781C16.8785 25.1806 16.9967 24.8953 17.207 24.6849C17.4174 24.4745 17.7027 24.3564 18.0002 24.3564C18.2977 24.3564 18.583 24.4745 18.7934 24.6849C19.0037 24.8953 19.1219 25.1806 19.1219 25.4781V26.9737C19.1219 27.2712 19.0037 27.5565 18.7934 27.7669C18.583 27.9772 18.2977 28.0954 18.0002 28.0954ZM28.4695 10.148H7.53089C7.23339 10.148 6.94808 10.0298 6.73772 9.81948C6.52736 9.60912 6.40918 9.32381 6.40918 9.02631C6.40918 8.72882 6.52736 8.44351 6.73772 8.23315C6.94808 8.02278 7.23339 7.9046 7.53089 7.9046H28.4695C28.767 7.9046 29.0523 8.02278 29.2627 8.23315C29.473 8.44351 29.5912 8.72882 29.5912 9.02631C29.5912 9.32381 29.473 9.60912 29.2627 9.81948C29.0523 10.0298 28.767 10.148 28.4695 10.148Z"
      fill="#E2682B"
    />
  </svg>
);

const icn5 = (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_6_2202)">
      <path
        d="M33.3837 23.127H34.6656V24.4089H33.3837V23.127ZM34.6656 15.5482C34.6656 14.5877 34.5379 13.6309 34.2862 12.7036L33.0491 13.0398C33.2709 13.8575 33.3834 14.701 33.3837 15.5482V21.8451H34.6656V15.5482ZM11.5912 15.5482C11.5943 13.3173 12.3706 11.1566 13.7879 9.4338L12.798 8.61851C11.1923 10.5713 10.3129 13.0201 10.3093 15.5482V17.9994H11.5912V15.5482Z"
        fill="#E2682B"
      />
      <path
        d="M26.8929 0.75768C26.7223 0.537416 26.5034 0.35929 26.253 0.237045C26.0027 0.1148 25.7276 0.0517061 25.449 0.0526304C25.0525 0.0536547 24.6668 0.182132 24.3489 0.419096L22.4875 1.81526L20.6288 0.419096C20.3105 0.181237 19.9238 0.052687 19.5264 0.0526304C19.248 0.0527275 18.9732 0.116262 18.723 0.238409C18.4728 0.360556 18.2538 0.538105 18.0824 0.757574C17.9111 0.977044 17.792 1.23267 17.7343 1.50503C17.6765 1.77739 17.6816 2.05934 17.749 2.32946L18.4619 5.18027H18.0009C17.8309 5.18027 17.6679 5.2478 17.5477 5.368C17.4275 5.4882 17.36 5.65123 17.36 5.82122V8.05551L16.3666 8.76969C15.2868 9.5406 14.4066 10.558 13.799 11.7375C13.1914 12.9169 12.8741 14.2243 12.8733 15.551V24.4974C12.3486 24.4396 11.8212 24.4101 11.2934 24.4089H9.66852C9.66852 24.2389 9.60099 24.0759 9.48079 23.9557C9.36058 23.8355 9.19755 23.7679 9.02756 23.7679H0.0541992V25.0499H8.38661V32.7413H0.0541992V34.0232H9.02756C9.19755 34.0232 9.36058 33.9557 9.48079 33.8355C9.60099 33.7153 9.66852 33.5523 9.66852 33.3823V33.1381L14.4537 35.1251C17.0627 36.1897 19.9789 36.2217 22.6106 35.2147L32.5116 31.4397C32.802 31.3294 33.0674 31.1621 33.2923 30.9478C33.5171 30.7335 33.6969 30.4764 33.821 30.1916C33.9497 29.9029 34.0193 29.5913 34.0258 29.2753C34.0323 28.9593 33.9756 28.6451 33.8589 28.3513C33.6983 27.929 33.4168 27.5634 33.0496 27.3002C32.6824 27.037 32.2458 26.8878 31.7943 26.8713C31.9946 26.2848 32.0985 25.6696 32.1019 25.0499V15.551C32.1013 14.2244 31.7841 12.9171 31.1769 11.7377C30.5696 10.5583 29.6896 9.54078 28.6102 8.76969L27.6152 8.05551V5.82122C27.6152 5.65123 27.5477 5.4882 27.4275 5.368C27.3073 5.2478 27.1443 5.18027 26.9743 5.18027H26.5136L27.2262 2.32946C27.2945 2.05944 27.3 1.77735 27.2422 1.50488C27.1844 1.23241 27.0649 0.976741 26.8929 0.75768ZM26.3333 7.74408H18.6419V6.46218H26.3333V7.74408ZM32.6652 28.822C32.7195 28.958 32.7459 29.1035 32.7429 29.2499C32.7399 29.3963 32.7077 29.5406 32.648 29.6743C32.5921 29.8037 32.5109 29.9207 32.4091 30.0182C32.3073 30.1158 32.187 30.192 32.0553 30.2423L22.1537 34.0175C19.827 34.9085 17.2485 34.8805 14.9417 33.9393L9.66852 31.7492V25.6908H11.2934C13.4188 25.6936 15.5148 26.1885 17.4169 27.1367C18.045 27.4497 18.737 27.613 19.4387 27.6137H24.4105C24.646 27.615 24.8728 27.7028 25.0479 27.8604C25.223 28.0179 25.3342 28.2342 25.3604 28.4683C25.3865 28.7024 25.3259 28.9379 25.1899 29.1302C25.0539 29.3225 24.852 29.4582 24.6226 29.5115C24.5387 29.5193 24.4558 29.5365 24.3707 29.5365H16.719V30.8184H24.4105C24.4233 30.8184 24.4355 30.8147 24.4489 30.8147C24.9576 30.8063 25.4599 30.7001 25.9283 30.5017L31.2866 28.2264C31.4131 28.1722 31.5493 28.1443 31.6869 28.1443C31.8245 28.1443 31.9607 28.1722 32.0872 28.2264C32.2187 28.2816 32.3377 28.3628 32.4371 28.4652C32.5364 28.5675 32.614 28.6889 32.6652 28.822ZM30.82 15.5511V25.0499C30.8178 25.8386 30.6066 26.6126 30.2079 27.2932L26.63 28.8123C26.6422 28.7337 26.6504 28.6546 26.6538 28.5751C26.6538 27.3361 25.6495 26.3318 24.4105 26.3318H19.4387C18.9359 26.3311 18.44 26.2141 17.99 25.99C16.7761 25.3866 15.4861 24.9502 14.1552 24.6928V15.551C14.1555 14.428 14.4239 13.3213 14.938 12.3228C15.4521 11.3244 16.1971 10.4631 17.1111 9.8106L18.2065 9.02599H26.7686L27.8653 9.81116C28.779 10.4638 29.5237 11.325 30.0376 12.3233C30.5515 13.3216 30.8197 14.4282 30.82 15.551V15.5511ZM19.7836 5.18027L18.9924 2.01836C18.9717 1.93736 18.9698 1.85272 18.9869 1.77088C19.0039 1.68904 19.0394 1.61217 19.0906 1.54613C19.1816 1.43414 19.3119 1.36121 19.4549 1.34235C19.5979 1.32349 19.7428 1.36011 19.8596 1.4447L22.103 3.12905C22.2139 3.2124 22.3489 3.25746 22.4876 3.25746C22.6264 3.25746 22.7613 3.2124 22.8723 3.12905L25.1156 1.4447C25.2324 1.36014 25.3772 1.32352 25.5202 1.34239C25.6632 1.36125 25.7936 1.43416 25.8845 1.54613C25.9363 1.61192 25.9722 1.68869 25.9897 1.77055C26.0072 1.8524 26.0057 1.93718 25.9853 2.01836L25.192 5.18027H19.7836Z"
        fill="#E2682B"
      />
      <path
        d="M5.82251 30.1775H7.10442V31.4594H5.82251V30.1775ZM25.2671 17.7008C25.4598 17.4355 25.5915 17.131 25.6528 16.8089C25.714 16.4868 25.7033 16.1552 25.6214 15.8377C25.5396 15.5203 25.3886 15.2248 25.1792 14.9726C24.9698 14.7203 24.7072 14.5175 24.4102 14.3787V13.5127H23.1283V14.1536H21.8464V13.5127H20.5645V14.1536H19.2826V15.4355H19.9235V20.5632H19.2826V21.8451H20.5645V22.486H21.8464V21.8451H23.1283V22.486H24.4102V21.8126C24.8656 21.7492 25.2903 21.5466 25.6261 21.2326C25.962 20.9186 26.1926 20.5085 26.2864 20.0583C26.3803 19.6082 26.3327 19.1401 26.1502 18.7181C25.9677 18.296 25.6593 17.9407 25.2671 17.7008ZM21.2054 15.4355H23.4488C23.9799 15.4355 24.4102 15.8659 24.4102 16.397C24.4102 16.9281 23.9799 17.3584 23.4488 17.3584H21.2054V15.4355ZM24.0897 20.5632H21.2054V18.6403H24.0897C24.6208 18.6403 25.0511 19.0706 25.0511 19.6017C25.0511 20.1329 24.6208 20.5632 24.0897 20.5632ZM26.974 17.3584H28.2559V18.6403H26.974V17.3584ZM17.3597 17.3584H18.6416V18.6403H17.3597V17.3584Z"
        fill="#E2682B"
      />
    </g>
    <defs>
      <clipPath id="clip0_6_2202">
        <rect
          width="35.8947"
          height="35.8947"
          fill="white"
          transform="translate(0.0527344 0.0526314)"
        />
      </clipPath>
    </defs>
  </svg>
);

const icn6 = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.9825 31.7039H4.03518C3.04389 31.7028 2.09354 31.3084 1.39259 30.6075C0.691644 29.9065 0.29733 28.9562 0.296143 27.9649V4.03509C0.29733 3.0438 0.691644 2.09345 1.39259 1.3925C2.09354 0.691554 3.04389 0.297239 4.03518 0.296052H15.5963C16.0942 0.296385 16.5872 0.395726 17.0464 0.588296C17.5056 0.780866 17.9219 1.06282 18.2712 1.41776L24.656 7.95285C25.3408 8.65199 25.7235 9.59224 25.7216 10.5709V16.1421C25.7216 16.3404 25.6428 16.5306 25.5026 16.6709C25.3623 16.8111 25.1721 16.8899 24.9738 16.8899C24.7754 16.8899 24.5852 16.8111 24.445 16.6709C24.3048 16.5306 24.226 16.3404 24.226 16.1421V10.5709C24.2263 9.98386 23.9965 9.42008 23.5858 9.00053L17.2003 2.46469C16.9911 2.25157 16.7415 2.08229 16.466 1.96673C16.1906 1.85118 15.8949 1.79166 15.5963 1.79167H4.03518C3.44019 1.79167 2.86956 2.02803 2.44884 2.44875C2.02812 2.86947 1.79176 3.44009 1.79176 4.03509V27.9649C1.79176 28.5599 2.02812 29.1305 2.44884 29.5512C2.86956 29.972 3.44019 30.2083 4.03518 30.2083H21.9825C22.2647 30.2094 22.5442 30.1548 22.8051 30.0476C22.9886 29.9721 23.1945 29.9726 23.3776 30.049C23.5607 30.1253 23.7059 30.2713 23.7814 30.4547C23.8569 30.6382 23.8564 30.8441 23.78 31.0272C23.7036 31.2103 23.5577 31.3555 23.3742 31.431C22.9327 31.6123 22.4598 31.7051 21.9825 31.7039Z"
      fill="#E2682B"
    />
    <path
      d="M24.6671 10.0175H19.739C18.7478 10.0164 17.7974 9.62204 17.0965 8.92109C16.3955 8.22015 16.0012 7.2698 16 6.27851V1.27568C16 1.07735 16.0788 0.887141 16.219 0.7469C16.3593 0.606659 16.5495 0.527872 16.7478 0.527872C16.9461 0.527872 17.1364 0.606659 17.2766 0.7469C17.4168 0.887141 17.4956 1.07735 17.4956 1.27568V6.27851C17.4956 6.8735 17.732 7.44412 18.1527 7.86485C18.5734 8.28557 19.1441 8.52193 19.739 8.52193H24.6671C24.8654 8.52193 25.0556 8.60072 25.1959 8.74096C25.3361 8.8812 25.4149 9.07141 25.4149 9.26974C25.4149 9.46807 25.3361 9.65827 25.1959 9.79852C25.0556 9.93876 24.8654 10.0175 24.6671 10.0175ZM23.4781 31.5948C23.1832 31.5951 22.8948 31.5079 22.6495 31.3443L20.2476 29.7424C18.7098 28.72 17.449 27.333 16.5774 25.705C15.7058 24.077 15.2505 22.2587 15.2522 20.4121V19.1318C15.2537 18.7954 15.368 18.4691 15.577 18.2054C15.7859 17.9417 16.0774 17.7557 16.4046 17.6773C18.6255 17.0634 20.7383 16.1102 22.6682 14.8514C22.9097 14.6958 23.1908 14.6131 23.4781 14.6131C23.7653 14.6131 24.0465 14.6958 24.288 14.8514C26.2178 16.1104 28.3306 17.0636 30.5516 17.6773C30.8788 17.7557 31.1702 17.9417 31.3792 18.2054C31.5881 18.4691 31.7025 18.7954 31.704 19.1318V20.4121C31.7061 22.2592 31.2511 24.0781 30.3795 25.7067C29.5079 27.3352 28.2468 28.7227 26.7086 29.7454L24.3074 31.3465C24.0616 31.5095 23.773 31.5959 23.4781 31.5948ZM23.4781 16.1077C21.4105 17.4565 19.1461 18.4762 16.7658 19.1303L16.7478 20.4121C16.746 22.0129 17.1403 23.5893 17.8957 25.0007C18.651 26.4121 19.7439 27.6146 21.0769 28.5011L23.4781 30.0992L25.8793 28.4981C27.2118 27.6119 28.3044 26.4098 29.0598 24.999C29.8151 23.5882 30.2097 22.0124 30.2083 20.4121V19.1318C27.8221 18.478 25.5517 17.4581 23.4781 16.1084V16.1077Z"
      fill="#E2682B"
    />
    <path
      d="M22.7303 24.9737C22.532 24.9736 22.3418 24.8948 22.2016 24.7546L20.706 23.259C20.5698 23.1179 20.4944 22.929 20.4961 22.733C20.4978 22.5369 20.5765 22.3493 20.7151 22.2107C20.8538 22.072 21.0413 21.9934 21.2374 21.9917C21.4335 21.99 21.6224 22.0653 21.7634 22.2016L22.7303 23.1685L25.1929 20.7059C25.3339 20.5697 25.5228 20.4944 25.7189 20.4961C25.9149 20.4978 26.1025 20.5764 26.2411 20.7151C26.3798 20.8537 26.4584 21.0413 26.4601 21.2373C26.4618 21.4334 26.3865 21.6223 26.2503 21.7634L23.259 24.7546C23.1188 24.8948 22.9286 24.9736 22.7303 24.9737ZM11.5132 7.77412H5.53077C5.33244 7.77412 5.14223 7.69534 5.00199 7.55509C4.86175 7.41485 4.78296 7.22465 4.78296 7.02632C4.78296 6.82798 4.86175 6.63778 5.00199 6.49754C5.14223 6.35729 5.33244 6.27851 5.53077 6.27851H11.5132C11.7116 6.27851 11.9018 6.35729 12.042 6.49754C12.1822 6.63778 12.261 6.82798 12.261 7.02632C12.261 7.22465 12.1822 7.41485 12.042 7.55509C11.9018 7.69534 11.7116 7.77412 11.5132 7.77412ZM16.0001 12.261H5.53077C5.33244 12.261 5.14223 12.1822 5.00199 12.0419C4.86175 11.9017 4.78296 11.7115 4.78296 11.5132C4.78296 11.3148 4.86175 11.1246 5.00199 10.9844C5.14223 10.8441 5.33244 10.7654 5.53077 10.7654H16.0001C16.1984 10.7654 16.3886 10.8441 16.5288 10.9844C16.6691 11.1246 16.7479 11.3148 16.7479 11.5132C16.7479 11.7115 16.6691 11.9017 16.5288 12.0419C16.3886 12.1822 16.1984 12.261 16.0001 12.261ZM17.4957 16.7478H5.53077C5.33244 16.7478 5.14223 16.669 5.00199 16.5288C4.86175 16.3885 4.78296 16.1983 4.78296 16C4.78296 15.8017 4.86175 15.6115 5.00199 15.4712C5.14223 15.331 5.33244 15.2522 5.53077 15.2522H17.4957C17.694 15.2522 17.8842 15.331 18.0245 15.4712C18.1647 15.6115 18.2435 15.8017 18.2435 16C18.2435 16.1983 18.1647 16.3885 18.0245 16.5288C17.8842 16.669 17.694 16.7478 17.4957 16.7478ZM13.0088 21.2346H5.53077C5.33244 21.2346 5.14223 21.1559 5.00199 21.0156C4.86175 20.8754 4.78296 20.6852 4.78296 20.4868C4.78296 20.2885 4.86175 20.0983 5.00199 19.9581C5.14223 19.8178 5.33244 19.739 5.53077 19.739H13.0088C13.2072 19.739 13.3974 19.8178 13.5376 19.9581C13.6779 20.0983 13.7566 20.2885 13.7566 20.4868C13.7566 20.6852 13.6779 20.8754 13.5376 21.0156C13.3974 21.1559 13.2072 21.2346 13.0088 21.2346ZM13.0088 25.7215H5.53077C5.33244 25.7215 5.14223 25.6427 5.00199 25.5025C4.86175 25.3622 4.78296 25.172 4.78296 24.9737C4.78296 24.7754 4.86175 24.5851 5.00199 24.4449C5.14223 24.3047 5.33244 24.2259 5.53077 24.2259H13.0088C13.2072 24.2259 13.3974 24.3047 13.5376 24.4449C13.6779 24.5851 13.7566 24.7754 13.7566 24.9737C13.7566 25.172 13.6779 25.3622 13.5376 25.5025C13.3974 25.6427 13.2072 25.7215 13.0088 25.7215Z"
      fill="#E2682B"
    />
  </svg>
);

const icn7 = (
  <svg
    width="50"
    height="50"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_2_48)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.85107 13.7109C4.23993 11.3782 4.45859 7.80603 7.28909 5.85107C9.57489 4.27232 11.8739 5.18319 12.9769 5.7509L11.5477 6.73804C11.4386 6.81341 11.3639 6.92903 11.34 7.05947C11.3162 7.18991 11.3451 7.32449 11.4204 7.4336C11.4958 7.54272 11.6114 7.61742 11.7419 7.64129C11.8723 7.66516 12.0069 7.63622 12.116 7.56086L14.5845 5.85596C14.6936 5.78059 14.7683 5.66497 14.7922 5.53453C14.816 5.40409 14.7871 5.26951 14.7117 5.1604L13.0068 2.69194C12.9315 2.58282 12.8158 2.50812 12.6854 2.48425C12.555 2.46039 12.4204 2.48932 12.3113 2.56468C12.2021 2.64004 12.1274 2.75566 12.1036 2.8861C12.0797 3.01654 12.1086 3.15113 12.184 3.26024L13.2143 4.75201C11.9292 4.13015 9.32584 3.229 6.72079 5.02825C3.37767 7.33726 3.14433 11.5516 5.02825 14.2792C6.91217 17.0069 10.9361 18.2808 14.2792 15.9718C15.8788 14.867 16.7725 13.3139 17.0543 11.6949C17.2022 10.8344 17.183 9.95349 16.9978 9.10027C16.9838 9.03612 16.9573 8.97534 16.9199 8.92143C16.8824 8.86751 16.8347 8.8215 16.7794 8.78602C16.7242 8.75055 16.6625 8.7263 16.5978 8.71467C16.5332 8.70304 16.4669 8.70426 16.4028 8.71824C16.3386 8.73223 16.2779 8.75872 16.2239 8.79619C16.17 8.83366 16.124 8.88139 16.0885 8.93664C16.0531 8.9919 16.0288 9.0536 16.0172 9.11822C16.0056 9.18284 16.0068 9.24913 16.0208 9.31328C16.1785 10.04 16.1949 10.7903 16.0693 11.5233C15.833 12.8897 15.0809 14.2027 13.7109 15.1489C10.8804 17.1039 7.46221 16.0436 5.85107 13.7109Z"
        fill="white"
      />
    </g>
    <path
      d="M7.54688 10.9219L9.51562 12.8906L13.4531 8.67188"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <clipPath id="clip0_2_48">
        <rect
          width="15"
          height="15"
          fill="white"
          transform="translate(0.0665894 8.59112) rotate(-34.6319)"
        />
      </clipPath>
    </defs>
  </svg>
);
