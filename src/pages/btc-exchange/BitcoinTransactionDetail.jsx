import React from "react";
import styled from "styled-components";

// Bitcoin Transaction Detail Component
const BitcoinTransactionDetail = ({ detail, setDetail, transactionData }) => {
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const handleTransactionDetail = () => setDetail(!detail);

  const {
    amount = "",
    category = "",
    date = "",
    from = "",
    id = "",
    rawData = {},
    status = "",
    summary = "",
    to = "",
    transactionHash = "",
    type = "",
  } = transactionData || {};

  const getInitials = (address) => {
    if (!address) return "??";
    return address.substring(2, 4).toUpperCase();
  };

  const closeIcn = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 6L6 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6L18 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const Modal = styled.div`
    padding-bottom: 100px;

    .modalDialog {
      max-height: calc(100vh - 160px);
      max-width: 550px !important;

      input {
        color: var(--textColor);
      }
    }
  `;

  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20 z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          <button
            onClick={handleTransactionDetail}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
            // style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                {type
                  ? type.charAt(0).toUpperCase() +
                    type.slice(1).replace("token ", "")
                  : "Bitcoin Transaction Details"}
              </h5>
            </div>
            <div className="modalBody">
              <div className="py-3">
                <ul className="list-none pl-0 mb-0">
                  <li className="py-2 border-b border-dashed border-white/50">
                    <div className="flex items-center justify-between">
                      <h6 className="m-0 font-semibold text-base">Status</h6>
                      <a
                        href={`${process.env.NEXT_PUBLIC_BITCOIN_EXPLORER_URL}/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs font-medium"
                      >
                        View on block explorer
                      </a>
                    </div>
                  </li>
                  <li className="py-2 border-b border-dashed border-white/50">
                    <div className="flex items-center justify-between">
                      <h6 className="m-0 font-semibold text-base capitalize">
                        {status || "Pending"}
                      </h6>
                      <span
                        className="text-blue-500 text-xs font-medium cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(transactionHash);
                        }}
                      >
                        Copy transaction ID
                      </span>
                    </div>
                  </li>
                  <li className="py-2 border-b border-dashed border-white/50">
                    <div className="flex items-center justify-between">
                      <div className="left">
                        <h6 className="m-0 font-semibold text-base pb-1">
                          From
                        </h6>
                        <div className="flex items-center gap-1">
                          <div className="flex-shrink-0 h-[30px] w-[30px] rounded-full text-xs font-medium bg-white/50 flex items-center justify-center">
                            {getInitials(from)}
                          </div>
                          <span className="text-blue-500 text-xs font-medium">
                            {from === "Unknown"
                              ? "Unknown"
                              : truncateAddress(from)}
                          </span>
                        </div>
                      </div>
                      <div className="right text-right">
                        <h6 className="m-0 font-semibold text-base pb-1">To</h6>
                        <div className="rounded-20 px-2 py-1 bg-white/50">
                          <span className="text-xs font-medium">
                            {to === "Unknown" ? "Unknown" : truncateAddress(to)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="py-2 border-b border-dashed border-white/50">
                    <div className="flex items-center justify-between">
                      <h6 className="m-0 font-semibold text-base">Date</h6>
                      <span className="text-white text-xs font-medium">
                        {date}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="py-3">
                <h6 className="m-0 font-medium text-xl pb-5">
                  Transaction Details
                </h6>
                <ul className="list-unstyled ps-0 mb-0 text-xs">
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white opacity-80">Amount</span>
                    <span className="text-white font-medium">{amount}</span>
                  </li>
                  {rawData?.fees && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Fees</span>
                      <span className="text-white font-medium">
                        {(rawData.fees / 100000000).toFixed(8)} BTC
                      </span>
                    </li>
                  )}
                  {rawData?.confirmations && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">
                        Confirmations
                      </span>
                      <span className="text-white font-medium">
                        {rawData.confirmations}
                      </span>
                    </li>
                  )}
                  {rawData?.block_height && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">
                        Block Height
                      </span>
                      <span className="text-white font-medium">
                        {rawData.block_height}
                      </span>
                    </li>
                  )}
                  {category && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Category</span>
                      <span className="text-white font-medium capitalize">
                        {category}
                      </span>
                    </li>
                  )}
                  {summary && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Summary</span>
                      <span className="text-white font-medium">{summary}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BitcoinTransactionDetail;
