"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import BuyBitcoin from "../../components/Modals/buyBitcoinPop";
import { createPortal } from "react-dom";
import CounterList from "../../components/CounterList";

interface CardMetrics {
  head: string;
  value: string;
  icn: React.ReactNode;
}

const ThresholdWallet: React.FC = () => {
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [buy, setBuy] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const cardMetrics: CardMetrics[] = [
    { head: "Total Deposit", value: "$234234", icn: icn11 },
    { head: "BTC Balance", value: "$234234", icn: icn22 },
    { head: "USD Balance", value: "$234234", icn: icn33 },
    { head: "Loan Health", value: "$234234", icn: icn11 },
  ];

  return (
    <>
      {buy &&
        createPortal(<BuyBitcoin buy={buy} setBuy={setBuy} />, document.body)}
      <DashboardSec className="relative dashboard pt-5">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <h4 className="m-0 text-base text-center">
                Good Morning,{" "}
                <span className="text-xl font-semibold">Rock</span>
              </h4>
            </div>

            <div className="col-span-12 my-2">
              <CounterList data={cardMetrics} />
            </div>

            <div className="col-span-12 my-2">
              <div className="px-lg-4 text-center px-3 pb-3 pb-lg-4 pt-0 bg-[#21222f70] backdrop-blur-[17.5px] rounded-4 mt-5">
                <div
                  className="inline-flex py-2 px-3 align-items-center justify-center gap-3 rounded-4 bg-[#9999998f]
                  backdrop-blur-[17.5px] mb-4"
                  style={{ marginTop: -20 }}
                >
                  <p className="m-0 text-white">
                    Health Factor: <span className="text-[#00FF0A]">1.27</span>
                  </p>
                  <div
                    className="rounded-20 p-2 pe-3 flex items-center gap-1 
                    bg-[rgba(255, 255, 255, 0.12)]
                  backdrop-blur-[17.5px]
"
                  >
                    <span className="icn rounded-20 bg-[#00FF0A] h-2 w-2"></span>
                    <span className="text-white text-xs">Risk Factor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardSec>
    </>
  );
};

const DashboardSec = styled.section`
  padding-bottom: 90px;
  @media (max-width: 767px) {
    padding-bottom: 70px;
  }
`;

export default ThresholdWallet;

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
