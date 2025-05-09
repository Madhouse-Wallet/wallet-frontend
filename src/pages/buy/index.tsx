"use client";
import React, { useEffect, useState } from "react";
import StripePaymentPage from "../stripePaymentPage";
import { initializetbtc } from "../../lib/thresholdReceiveFunc";
import { useSelector } from "react-redux";
import { getAccount, getProvider } from "@/lib/zeroDevWallet";
import { BackBtn } from "@/components/common";
import Swap from "../swapUsdc";

const BuyCoin: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const tabData = [
    { title: "Buy with USDC", component: <Swap /> },
    {
      title: "Buy with Debit/Credit Card",
      component: (
        <>
          <StripePaymentPage walletAddress={walletAddress} />
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
          let provider = await getProvider(account.kernelClient);
          if (provider) {
            const sdk = await initializetbtc(provider);
            if (sdk) {
              setWalletAddress(sdk.address!);
            }
          }
        }
      }
    } catch (error) {
      console.log("error rec-->", error);
    }
  };
  return (
    <>
      <section className="relative dashboard pt-12">
        <div className="container relative">
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12">
              <div className=" col-span-12  z-10">
                <div
                  className={`sectionHeader  px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
                >
                  <div className="flex align-items-center gap-3 pb-3">
                    <BackBtn />
                    <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Buy Bitcoin
                    </h4>
                  </div>
                  <ul className="list-none pl-0 mb-0 flex items-center gap-3 ">
                    {tabData.map((item, index) => (
                      <li key={index} className="py-1">
                        <button
                          className={` ${
                            activeTab === index
                              ? "bg-[#ffad84] border-[#ffad84]"
                              : "bg-white border-white"
                          }  flex w-full h-[42px]  border-2 text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50
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
              </div>
              <div className="col-span-12">
                <div className="grid gap-3 md:gap-4 grid-cols-12">
                  <div className=" col-span-12">
                    <div className="tabContent">
                      <div className="">{tabData[activeTab].component}</div>
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

export default BuyCoin;
