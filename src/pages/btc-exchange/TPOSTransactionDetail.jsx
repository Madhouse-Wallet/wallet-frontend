import React, { useState } from "react";
import styled from "styled-components";
import InvoicePop from "../../components/Modals/InvoicePop";
import { createPortal } from "react-dom";

const TposTransactionDetail = ({ detail, setDetail, transactionData }) => {
  const [invoiceePop, setInvoicePop] = useState(false);
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
    invoice = "",
  } = transactionData || {};

  const data = {
    claimPublicKey: transactionData?.claimPublicKey || "",
    refundPublicKey: transactionData?.refundPublicKey || "",
    preimage: transactionData?.preimage || "",
    blindingKey: transactionData?.blindingKey || "",
    address: transactionData?.to || "",
    tree: transactionData?.swapTree || "",
  };

  const handleDownload = () => {
    const jsonData = JSON.stringify(data, null, 2); // pretty print with 2-space indentation
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `boltz-refund-${transactionData?.swapId}.json`;
    a.click();

    URL.revokeObjectURL(url); // clean up memory
  };

  return (
    <>
      {invoiceePop &&
        createPortal(
          <InvoicePop
            invoiceePop={invoiceePop}
            setInvoicePop={setInvoicePop}
            qrCodee={invoice}
          />,
          document.body
        )}

      <Modal
        className={`fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
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
                Boltz Withdraw Details
              </h5>
            </div>
            <div className="modalBody">
              <div className="py-3">
                <ul className="list-none pl-0 mb-0">
                  <li className="py-2 border-b border-dashed border-white/50">
                    <div className="flex items-center justify-between">
                      <h6 className="m-0 font-semibold text-base capitalize">
                        {/* {status || "Pending"} */}
                        Transaction ID
                      </h6>
                      <span
                        className="text-blue-500 text-xs font-medium cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            transactionHash || rawData?.boltz_id
                          );
                        }}
                      >
                        Copy transaction ID
                      </span>
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
                <div className="flex items-center justify-between pb-5">
                  <h6 className="m-0 font-medium text-xl">
                    Transaction Details
                  </h6>
                  <button
                    onClick={handleDownload}
                    className="rounded-full text-xs bg-white/50 px-3 py-1"
                  >
                    Download Refund File
                  </button>
                </div>
                <ul className="list-unstyled ps-0 mb-0 text-xs">
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white opacity-80">Amount</span>
                    <span className="text-white font-medium">
                      {parseFloat(amount)}
                    </span>
                  </li>
                  {rawData?.fee !== undefined && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Fee</span>
                      <span className="text-white font-medium">
                        {(rawData.fee / 1000).toFixed(2)} sats
                      </span>
                    </li>
                  )}
                  {rawData?.memo && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Memo</span>
                      <span className="text-white font-medium">
                        {rawData.memo}
                      </span>
                    </li>
                  )}
                  {invoice && (
                    <>
                      <li className="py-2 flex items-center justify-between">
                        <span className="text-white opacity-80">
                          Payment Invoice
                        </span>
                        <span
                          className="text-blue-500 text-xs font-medium cursor-pointer"
                          onClick={() => {
                            setInvoicePop(!invoiceePop);
                          }}
                        >
                          View
                        </span>
                      </li>
                    </>
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
                  {rawData?.extra?.wallet_fiat_amount && (
                    <li className="py-2 flex items-center justify-between">
                      <span className="text-white opacity-80">Fiat Value</span>
                      <span className="text-white font-medium">
                        {rawData.extra.wallet_fiat_amount}{" "}
                        {rawData.extra.wallet_fiat_currency}
                      </span>
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

export default TposTransactionDetail;

const Modal = styled.div`
  ${"" /* padding-bottom: 100px; */}

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 550px !important;

    input {
      color: var(--textColor);
    }
  }
`;

const closeIcn = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 1L1 13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 1L13 13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
