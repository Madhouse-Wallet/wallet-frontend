"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { BackBtn } from "@/components/common";
import SendTbtcWall from "@/components/Modals/SendTbtcWallet";
import DepositPopup from "@/components/Modals/DepositPop";
import WithdrawPopup from "@/components/Modals/WithdrawPop";

import { createPortal } from "react-dom";
const BTCDebitCard: React.FC = () => {
  const [depositPop, setDepositPop] = useState(false);
  const [withdrawPop, setWithdrawPop] = useState(false);
  const [btcWall, setTbtcWall] = useState(false);

  return (
    <>
      {depositPop &&
        createPortal(
          <DepositPopup
            depositPop={depositPop}
            setDepositPop={setDepositPop}
          />,
          document.body
        )}
      {withdrawPop &&
        createPortal(
          <WithdrawPopup
            withdrawPop={withdrawPop}
            setWithdrawPop={setWithdrawPop}
          />,
          document.body
        )}
      {btcWall &&
        createPortal(
          <SendTbtcWall btcWall={btcWall} setTbtcWall={setTbtcWall} />,
          document.body
        )}
      <section className="relative dashboard pt-12">
        <div className="container relative">
          <div className="pageCard  bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 px-2 pt-3">
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div className="sectionHeader ">
                  <div className="flex align-items-center gap-2">
                    <BackBtn />
                    <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Bitcoin Debt Card
                    </h4>
                  </div>
                </div>
              </div>
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div className="max-w-[500px] bg-black/50 mx-auto rounded-xl mt-10 p-6">
                  <div className="grid gap-3 grid-cols-12">
                    <div className="col-span-6">
                      <button
                        onClick={() => setWithdrawPop(!withdrawPop)}
                        className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Withdraw
                      </button>
                    </div>
                    <div className="col-span-6">
                      <button
                        onClick={() => setDepositPop(!depositPop)}
                        className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Deposit
                      </button>
                    </div>
                    <div className="col-span-6">
                      <button
                        className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Create Card
                      </button>
                    </div>
                    <div className="col-span-6">
                      <button
                        className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Delete Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </section>
    </>
  );
};

export const ContentWrp = styled.div`
  h2 {
    background: linear-gradient(90.5deg, #e2682b 0.43%, #ffb38c 128%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
`;
export default BTCDebitCard;
