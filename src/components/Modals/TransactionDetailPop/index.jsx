import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTheme } from "@/ContextApi/ThemeContext";

const TransactionDetailPop = ({ detail, setDetail, transactionData }) => {
  const { theme, toggleTheme } = useTheme();
  console.log('transactionDatatransactionData',transactionData)
  
  // Function to truncate address
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleTransactionDetail = () => setDetail(!detail);
  
  // Default values if transactionData is not provided
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
    type = ""
  } = transactionData || {};

  // Get first letters of from address for avatar
  const getInitials = (address) => {
    if (!address) return "??";
    return address.substring(2, 4).toUpperCase();
  };

  console.log("datedate",date)
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <buttonbuy
          onClick={handleTransactionDetail}
          className="bg-black/50 h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </buttonbuy>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20 z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                {type ? (type.charAt(0).toUpperCase() + type.slice(1)) : "Transaction Details"}
              </h5>
            </div>
            <div className="modalBody">
              <div className="py-3">
                <ul className="list-none pl-0 mb-0">
                  <li className="py-2 border-b border-dashed border-white/50">
                    <div className="flex items-center justify-between">
                      <h6 className="m-0 font-semibold text-base">Status</h6>
                      <a 
                        href={`https://etherscan.io/tx/${transactionHash}`} 
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
                      <h6 className="m-0 font-semibold text-base capitalize">{status || "Pending"}</h6>
                      <span 
                        className="text-blue-500 text-xs font-medium cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(transactionHash);
                          toast.success("Transaction ID copied to clipboard!");
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
                            {truncateAddress(from)}
                          </span>
                        </div>
                      </div>
                      <div className="right text-right">
                        <h6 className="m-0 font-semibold text-base pb-1">To</h6>
                        <div className="rounded-20 px-2 py-1 bg-white/50">
                          <span className="text-xs font-medium">
                            {truncateAddress(to)}
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
                  {rawData?.nonce && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Nonce</span>
                      <span className="text-white font-medium">{rawData.nonce}</span>
                    </li>
                  )}
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white opacity-80">Amount</span>
                    <span className="text-white font-medium">{amount}</span>
                  </li>
                  {rawData?.gas_price && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Gas Price</span>
                      <span className="text-white font-medium">
                        {ethers.utils.formatUnits(rawData.gas_price, 'gwei')} Gwei
                      </span>
                    </li>
                  )}
                  {rawData?.gas_used && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Gas Used</span>
                      <span className="text-white font-medium">{rawData.gas_used}</span>
                    </li>
                  )}
                  {category && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Category</span>
                      <span className="text-white font-medium capitalize">{category}</span>
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

const Modal = styled.div`
  padding-bottom: 100px;

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 550px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default TransactionDetailPop;

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