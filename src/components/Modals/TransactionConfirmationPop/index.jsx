import React, { useState } from "react";
import styled from "styled-components";
import { splitAddress } from "../../../utils/globals";

const TransactionConfirmationPop = ({
  trxnApproval,
  settrxnApproval,
  amount,
  symbol,
  fromAddress,
  toAddress,
  handleSend,
  description,
}) => {
  const [loading, setLoading] = useState(false);

  const handleTrxn = () => {
    settrxnApproval(!trxnApproval);
  };

  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <button
          onClick={handleTrxn}
          className="bg-[#0d1017] h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </button>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          {" "}
          <div className={`relative rounded px-3`}>
            <div className="modalBody">
              <div className="top text-center mb-3">
                <p className="m-0">Amount</p>
                <h4 className="m-0 font-bold text-xl">
                  {amount} {symbol}
                </h4>
                {description && (
                  <h2 className="m-0 font-bold text-sm">
                    Memo : {description?.description}
                  </h2>
                )}
              </div>
              <div className="py-3"></div>
              <div className="py-3">
                <div className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="left">
                      <h6 className="m-0 font-semibold text-base pb-1">From</h6>
                      <div className="flex items-center gap-1">
                        <div className="rounded-20 px-2 py-1 bg-white/50">
                          <span className="text-white text-xs font-medium">
                            {splitAddress(fromAddress)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {rightIcn}
                    <div className="right text-right">
                      <h6 className="m-0 font-semibold text-base pb-1">To</h6>
                      <div className="rounded-20 px-2 py-1 bg-white/50">
                        <span className="text-xs font-medium">
                          {splitAddress(toAddress)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-3">
                  <p className="m-0 text-xs font-medium text-center">
                    Powered by Madhouse Wallet
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  disabled={loading}
                  onClick={handleTrxn}
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={(e) => {
                    settrxnApproval(!trxnApproval);
                    handleSend(e);
                  }}
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  padding-bottom: 100px;

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 500px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default TransactionConfirmationPop;

const closeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 15"
    fill="none"
  >
    <g clip-path="url(#clip0_0_6282)">
      <path
        d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
        fill="var(--textColor)"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="var(--textColor)"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="var(--textColor)"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);

const rightIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.5 5L15.5 12L8.5 19"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
