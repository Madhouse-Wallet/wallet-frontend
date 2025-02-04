import React, { useState } from "react";
import InstallFirstApp from "./InstallFirstApp";
import Link from "next/link";
import logo from "@/Assets/Images/logow.png";
import Image, { StaticImageData } from "next/image";
import CounterList from "@/components/CounterList";
import { useRouter } from "next/router";
import pi1 from "@/Assets/Images/sendReceive.png";
import pi2 from "@/Assets/Images/BitcoinLoan.png";
import pi3 from "@/Assets/Images/BuyBitcoin.png";
import pi4 from "@/Assets/Images/WithdrawDeposit.png";
import pi5 from "@/Assets/Images/SellBitcoin.png";
import pi6 from "@/Assets/Images/BuySmartContract.png";
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

interface CardMetrics {
  head: string;
  value: string;
  icn: React.ReactNode;
}

interface CardData {
  head: string;
  icn: string | StaticImageData; // For string paths or imported static images
  onClick: () => void;
}

const Dashboard = () => {
  const router = useRouter();
  const userAuth = useSelector((state: any) => state.Auth);
  const [buy, setBuy] = useState(false);
  const [withdrawDep, setWithdrawDep] = useState(false);
  const [buySell, setBuySell] = useState(false);
  const [buycoverage, setBuyCoverage] = useState(false);
  const cardMetrics: CardMetrics[] = [
    { head: "Total Deposit", value: "$234234", icn: icn11 },
    { head: "BTC Balance", value: "$234234", icn: icn22 },
    { head: "USD Balance", value: "$234234", icn: icn33 },
    { head: "Loan Health", value: "$234234", icn: icn11 },
  ];
  const cardData: CardData[] = [
    {
      head: "Send & Receive Bitcoin",
      icn: pi1,
      onClick: () => {
        router.push("/btc-exchange");
      },
    },
    {
      head: "Bitcoin Loan",
      icn: pi2,
      onClick: () => {
        router.push("/debt-position");
      },
    },
    {
      head: "Buy/Sell Bitcoin",
      icn: pi3,
      onClick: () => {
        setBuySell(!buySell);
      },
    },
    {
      head: "Withdraw/Deposit Dollars",
      icn: pi4,
      onClick: () => {
        // router.push("/identity");
        setWithdrawDep(!withdrawDep);
      },
    },
    {
      head: "Earn",
      icn: pi5,
      onClick: () => {
        if (userAuth.login) {
          router.push("/swap");
        } else {
          toast.error("Please Login!");
        }
      },
    },
    {
      head: "Bitcoin Debit Card",
      icn: pi6,
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
  const handleCopy = async (text: any) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied Successfully!");
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  return (
    <>
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

      <DashboardMain className="relative flex w-full flex-col items-center">
        <div
          className="flex h-full w-full select-none flex-col items-center container"
          style={{ opacity: 1, transform: "none" }}
        >
          <div className="pt-6 md:pt-8 sm:block hidden" />
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
          <div className="pt-6 md:pt-8" />
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
          <div className="w-full pt-10 mt-5 my-2">
            <div
              className="text-center pb-3 pb-lg-4 px-5 py-8 min-w-0 rounded-xl md:max-w-[var(--apps-max-w)] mx-auto bg-neutral-900/70 shadow-widget
                  backdrop-blur-md backdrop-saturate-250 backdrop-brightness-[1.25] contrast-more:backdrop-blur-none contrast-more:bg-neutral-900 backdrop-saturate-[300%]  ring-white/25"
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {userAuth.login && (
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
                )}

                <div
                  className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[42px] pl-5 pr-1 py-4 text-14 backdrop-blur-md"
                  style={{ border: " 1px solid #565656a3", marginTop: 0 }}
                >
                  <p className="m-0">
                    Health Factor: <span className="text-[#00FF0A]">1.27</span>
                  </p>
                  <div
                    className="rounded-20 p-2 pe-3 flex items-center gap-1 
                    bg-[#5858583d]
                  backdrop-blur-[17.5px]
"
                    style={{ borderRadius: 20 }}
                  >
                    <span className="icn rounded-10 bg-[#00FF0A] h-2 w-2"></span>
                    <span className=" text-xs">Risk Factor</span>
                  </div>
                </div>
              </div>
              <DashboardLink className="list-none text-center pl-0 mb-0 flex items-start justify-evenly gap-3 pt-10 flex-wrap">
                {cardData.map((item, key) => (
                  <li
                    onClick={item.onClick}
                    key={key}
                    className="mx-auto"
                    style={{ maxWidth: 135 }}
                  >
                    <button className="border-0 p-0 bg-transparent">
                      <Image
                        src={item.icn}
                        alt={""}
                        className="max-w-full mx-auto object-contain rounded-15"
                        height={60000}
                        width={60000}
                        style={{ height: 60, width: 60 }}
                      />
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
      &:hover {
        img {
          background: #dddddd78;
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
