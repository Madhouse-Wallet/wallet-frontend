import React, { useEffect, useState } from "react";
import { getProvider, getAccount } from "../../lib/zeroDev";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { BackBtn } from "@/components/common";
import DepositSwap from "./DepositSwap";
import WithdrawalSwap from "./WithdrawalSwap";
import { useRouter } from "next/router";

const TransferMorpho = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const userAuth = useSelector((state) => state.Auth);
  const [providerr, setProviderr] = useState(null);

  const tabData = [
    {
      title: "Deposit",
      component: <DepositSwap />,
    },
    {
      title: "Withdraw",
      component: <WithdrawalSwap />,
    },
  ];

  useEffect(() => {
    const connectWallet = async () => {
      if (userAuth?.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          if (provider) {
            setProviderr(provider?.ethersProvider);
          }
        }
      }
    };

    connectWallet();
  }, []);
  return (
    <>
      <section className="relative curve h-full flex items-center py-[30px] sm:flex-row flex-col">
        <div className="absolute inset-0 backdrop-blur-xl h-full"></div>

        <div className="px-3 mx-auto relative w-full sm:min-w-[500px] sm:max-w-[max-content]">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <header className="siteHeader top-0 py-2 w-full z-[999]">
            <div className="container mx-auto">
              <Nav className=" px-3 py-3 rounded-[20px] shadow relative flex items-center justify-between flex-wrap gap-2">
                <div className="left w-full text-center">
                  <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                    Spark Lend
                  </h4>
                </div>
                <div className="right w-full">
                  <TabNav className="list-none pl-0 mb-0 flex items-center gap-3 ">
                    {tabData.map((item, index) => (
                      <li key={index} className="w-full">
                        <button
                          className={` ${
                            activeTab === index
                              ? "bg-[#ffad84] border-[#ffad84]"
                              : "bg-white border-white"
                          }  flex w-full h-[30px]  border-2 text-[10px] sm:h-[40px] sm:text-[12px] items-center rounded-full  px-3 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50
             // Highlight active tab
              `}
                          onClick={() => setActiveTab(index)}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </TabNav>
                </div>
              </Nav>
            </div>
          </header>
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="flex h-full flex-col justify-center">
              <div className="grid gap-3 grid-cols-12 lg:px-4 py-5">
                <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12 ">
                  <div className="tabContent">
                    <div className="">{tabData[activeTab].component}</div>
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

const TabNav = styled.div`
  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 8px;
    li {
      width: 48%;
      button {
        font-size: 10px;
        height: 35px;
      }
    }
  }
`;

export default TransferMorpho;

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);
