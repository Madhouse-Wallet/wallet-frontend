import React from "react";
import moment from "moment";
import styled from "styled-components";

const SideShiftTransactionDetail = ({
  showDetail,
  setShowDetail,
  selectedTransaction,
}) => {
  if (!selectedTransaction) return null;

  const tx = selectedTransaction;

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getInitials = (address) => {
    if (!address) return "??";
    return address.substring(2, 4).toUpperCase();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "settled":
      case "complete":
      case "confirmed":
        return "text-green-500";
      case "failed":
      case "rejected":
        return "text-red-500";
      case "expired":
        return "text-orange-500";
      case "pending":
      case "waiting":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "settled":
      case "complete":
        return "Completed";
      case "confirmed":
        return "Confirmed";
      case "failed":
      case "rejected":
        return "Failed";
      case "expired":
        return "Expired";
      case "pending":
      case "waiting":
        return "Pending";
      default:
        return status || "Unknown";
    }
  };

  const explorerUrl =
    tx.depositNetwork === "ethereum" || tx.settleNetwork === "ethereum"
      ? `https://etherscan.io/tx/${tx.transactionHash}`
      : tx.depositNetwork === "base" || tx.settleNetwork === "base"
        ? `https://basescan.org/tx/${tx.transactionHash}`
        : `https://sideshift.ai/orders/${tx.id}`;

  return (
    <Modal className="fixed inset-0 flex items-center justify-center cstmModal z-[99999]">
      <button
        onClick={handleCloseDetail}
        className="bg-black/50 h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
        style={{ border: "1px solid #5f5f5f59" }}
      >
        {closeIcn}
      </button>
      <div className="absolute inset-0 backdrop-blur-xl"></div>
      <div className="modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20 z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full">
        <div className="relative rounded px-3">
          <div className="top pb-3">
            <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
              SideShift Transaction Details
            </h5>
          </div>
          <div className="modalBody">
            <div className="py-3">
              <ul className="list-none pl-0 mb-0">
                {/* <li className="py-2 border-b border-dashed border-white/50">
                  <div className="flex items-center justify-between">
                    <h6 className="m-0 font-semibold text-base">Status</h6>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-xs font-medium"
                    >
                      View on SideShift
                    </a>
                  </div>
                </li> */}
                <li className="py-2 border-b border-dashed border-white/50">
                  <div className="flex items-center justify-between">
                    <h6
                      className={`m-0 font-semibold text-base capitalize ${getStatusColor(tx.status)}`}
                    >
                      {getStatusText(tx.status)}
                    </h6>
                    <span
                      className="text-blue-500 text-xs font-medium cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(tx.id);
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
                        From ({tx.depositCoin})
                      </h6>
                      <div className="flex items-center gap-1">
                        <div className="flex-shrink-0 h-[30px] w-[30px] rounded-full text-xs font-medium bg-white/50 flex items-center justify-center">
                          {getInitials(tx.from)}
                        </div>
                        <span className="text-blue-500 text-xs font-medium">
                          {truncateAddress(tx.from)}
                        </span>
                      </div>
                    </div>
                    <div className="right text-right">
                      <h6 className="m-0 font-semibold text-base pb-1">
                        To ({tx.settleCoin})
                      </h6>
                      <div className="rounded-20 px-2 py-1 bg-white/50">
                        <span className="text-xs font-medium">
                          {truncateAddress(tx.to)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="py-2 border-b border-dashed border-white/50">
                  <div className="flex items-center justify-between">
                    <h6 className="m-0 font-semibold text-base">Date</h6>
                    <span className="text-white text-xs font-medium">
                      {tx.date}
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
                  <span className="text-white opacity-80">Deposit Amount</span>
                  <span className="text-white font-medium">
                    {tx.depositAmount} {tx.depositCoin}
                  </span>
                </li>
                <li className="py-2 flex items-center justify-between">
                  <span className="text-white opacity-80">Settle Amount</span>
                  <span className="text-white font-medium">
                    {tx.settleAmount} {tx.settleCoin}
                  </span>
                </li>
                {tx.rate && (
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white opacity-80">Exchange Rate</span>
                    <span className="text-white font-medium">{tx.rate}</span>
                  </li>
                )}
                <li className="py-2 flex items-center justify-between">
                  <span className="text-white opacity-80">Deposit Network</span>
                  <span className="text-white font-medium capitalize">
                    {tx.depositNetwork}
                  </span>
                </li>
                <li className="py-2 flex items-center justify-between">
                  <span className="text-white opacity-80">Settle Network</span>
                  <span className="text-white font-medium capitalize">
                    {tx.settleNetwork}
                  </span>
                </li>
                {tx.rawData?.type && (
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white opacity-80">Type</span>
                    <span className="text-white font-medium capitalize">
                      {tx.rawData.type}
                    </span>
                  </li>
                )}
                {tx.expiresAt && (
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white opacity-80">Expires At</span>
                    <span className="text-white font-medium">
                      {moment(tx.expiresAt).format("MMMM D, YYYY h:mm A")}
                    </span>
                  </li>
                )}
                {tx.quoteId && (
                  <li className="py-2 flex items-center justify-between">
                    <span className="text-white opacity-80">Quote ID</span>
                    <span className="text-white font-medium">{tx.quoteId}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SideShiftTransactionDetail;

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
