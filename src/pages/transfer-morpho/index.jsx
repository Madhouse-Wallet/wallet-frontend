import React, { useEffect, useState } from "react";
import { getProvider, getAccount } from "../../lib/zeroDevWallet";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { BackBtn } from "@/components/common";
import DepositSwap from "./DepositSwap";
import WithdrawalSwap from "./WithdrawalSwap";

const TransferMorpho = () => {
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
      <section className="relative curve pt-12">
        <div className="container relative">
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 lg:px-4 pt-3">
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div
                  className={`sectionHeadercontrast-more:bg-black pb-3 border-b border-gray-900`}
                >
                  <div className="flex align-items-center gap-2 pb-3">
                    <BackBtn />
                    <h4 className="m-0 text-[18px] sm:text-[20px] font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Transfer Morpho
                    </h4>
                  </div>
                  <TabNav className="list-none pl-0 mb-0 flex items-center gap-3 ">
                    {tabData.map((item, index) => (
                      <li key={index} className="">
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
                  </TabNav>
                </div>
              </div>
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12 ">
                <div className="tabContent">
                  <div className="">{tabData[activeTab].component}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
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
