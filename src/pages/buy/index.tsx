"use client";
import React, { useEffect, useState } from "react";
import StripePaymentPage from "../stripePaymentPage";
import { useSelector } from "react-redux";
import { getAccount } from "@/lib/zeroDev";
import Swap from "../../pages/swapUsdc";
import SellBitcoin from "./SellBitcoin";
import { useRouter } from "next/router";
import styled from "styled-components";

const BuyCoin: React.FC = () => {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");
  const tabData = [
    { title: "Buy", component: <Swap /> },
    {
      title: "Stripe",
      component: (
        <>
          <StripePaymentPage walletAddress={walletAddress} />
        </>
      ),
    },
    {
      title: "Sell",
      component: (
        <>
          <SellBitcoin />{" "}
        </>
      ),
    },
  ];

  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const userAuth = useSelector((state: any) => state.Auth);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async () => {
    try {
      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        if (account) {
          setWalletAddress(account.address!);
        }
      }
    } catch (error) {
      console.log("error rec-->", error);
    }
  };
  return (
    <>
      <section className="relative dashboard h-full flex items-center sm:pt-[40px]">
        <div className="absolute inset-0 backdrop-blur-xl h-full"></div>
        <header className="siteHeader fixed top-0 py-2 w-full z-[999]">
          <div className="container mx-auto">
            <Nav className=" px-3 py-3 rounded-[30px] shadow relative flex items-center justify-between flex-wrap gap-2">
              {/* <div className="sectionHeader text-center w-full">
                <div className="flex align-items-center justify-center gap-3">
                  <BackBtn />
                  <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                    Send & Recieve
                  </h4>
                </div>
              </div> */}
              <div className="left">
                <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                  Bitcoin
                </h4>
              </div>
              <div className="right">
                <ul className="list-none pl-0 mb-0 flex items-center flex-wrap gap-x-3 gap-y-[5px] ">
                  {tabData.map((item, index) => (
                    <li key={index} className="">
                      <button
                        className={` ${
                          activeTab === index
                            ? "bg-[#ffad84] border-[#ffad84]"
                            : "bg-white border-white"
                        }  flex w-full h-[30px]  border-2 text-[10px] items-center rounded-full  px-3 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50
             // Highlight active tab
              `}
                        onClick={() => setActiveTab(index)}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Nav>
          </div>
        </header>
        <div className="px-3 mx-auto relative w-full sm:min-w-[500px] sm:max-w-[max-content]">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <div
            className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 datbackg
          a-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]"
          >
            <div className="flex h-full flex-col justify-center">
              <div className="grid gap-3 grid-cols-12">
                <div className="col-span-12">
                  <div className="grid gap-3 md:gap-4 grid-cols-12">
                    <div className=" col-span-12">
                      <div className="tabContent py-5">
                        <div className="">{tabData[activeTab].component}</div>
                      </div>
                    </div>
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

const Nav = styled.nav`
  // background: var(--cardBg);
  background: #5c2a28a3;
  backdrop-filter: blur(12.8px);
`;

export default BuyCoin;

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
