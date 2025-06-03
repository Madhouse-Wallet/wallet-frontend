import React, { useEffect, useState } from "react";
import Image from "next/image";
import moment from "moment";
import { toast } from "react-toastify";
import styled from "styled-components";

const SideShiftTransaction = ({ userData, dateRange, applyTrue }) => {
  const [sideshiftTransactions, setSideshiftTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Function to fetch SideShift data
  const fetchSideShiftData = async (ids) => {
    try {
      const response = await fetch(
        `https://sideshift.ai/api/v2/shifts?ids=${ids.join(",")}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching SideShift data:", error);
      throw error;
    }
  };

  // Format SideShift data to match your transaction format
  const formatSideShiftTransactions = (apiData, sideshiftIds) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((shift, index) => {
      // Find the corresponding metadata from sideshiftIds
      const metadata = sideshiftIds.find((item) => item.id === shift.id) || {};

      // Determine transaction type and details
      const isDeposit = shift.depositCoin && shift.depositAmount;
      const isGold = shift.settleCoin === "XAUT" || shift.depositCoin === "XAUT";

      return {
        id: shift.id || `sideshift_${index}`,
        amount: `${shift.depositAmount || shift.settleAmount || "0"} ${shift.depositCoin || shift.settleCoin || "UNKNOWN"}`,
        category: shift.depositCoin || shift.settleCoin || "SIDESHIFT",
        date: moment(shift.createdAt).format("MMMM D, YYYY h:mm A"),
        from: shift.depositAddress || "",
        to: shift.settleAddress || "",
        status: shift.status || "pending",
        type: isDeposit ? "receive" : "send",
        transactionHash: shift.txHashOut || shift.txHashIn || shift.id,
        summary: `${shift.depositAmount || shift.settleAmount || "0"} ${shift.depositCoin || shift.settleCoin} ${isDeposit ? "Deposit" : "Withdrawal"}`,
        rawData: shift,
        isDeposit: isDeposit,
        isGold: isGold,
        depositCoin: shift.depositCoin,
        settleCoin: shift.settleCoin,
        depositAmount: shift.depositAmount,
        settleAmount: shift.settleAmount,
        depositNetwork: shift.depositNetwork,
        settleNetwork: shift.settleNetwork,
        rate: shift.rate,
        expiresAt: shift.expiresAt,
        quoteId: shift.quoteId,
      };
    });
  };

  // Check if date filter is active
  const isDateFilterActive = () => {
    return applyTrue === true;
  };

  // Filter transactions by date range
  const filterTransactionsByDate = (transactions) => {
    if (!isDateFilterActive() || !dateRange?.startDate || !dateRange?.endDate) {
      return transactions;
    }

    const startDate = moment(dateRange.startDate).startOf("day");
    const endDate = moment(dateRange.endDate).endOf("day");

    return transactions.filter((tx) => {
      const txDate = moment(tx.date, "MMMM D, YYYY h:mm A");
      return txDate.isBetween(startDate, endDate, null, "[]");
    });
  };

  useEffect(() => {
    console.log("line-83", userData);
    const fetchTransactions = async () => {
      if (!userData?.userId?.sideshiftIds || userData?.userId?.sideshiftIds.length === 0) {
        setSideshiftTransactions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Extract IDs from userData
        const ids = userData?.userId?.sideshiftIds.map((item) => item.id);

        console.log("Fetching SideShift data for IDs:", ids);

        // Fetch data from SideShift API
        const apiData = await fetchSideShiftData(ids);

        // Format the data
        const formattedTransactions = formatSideShiftTransactions(
          apiData,
          userData?.userId?.sideshiftIds
        );

        // Apply date filtering if needed
        const filteredTransactions = filterTransactionsByDate(
          formattedTransactions
        );

        setSideshiftTransactions(filteredTransactions);
      } catch (err) {
        console.error("Failed to fetch SideShift transactions:", err);
        setError(
          "Failed to load SideShift transactions. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userData, dateRange, applyTrue]);

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

  const groupTransactionsByDate = (txs) => {
    const groups = {};

    txs.forEach((tx) => {
      if (tx?.date && typeof tx.date === "string") {
        const txDate = moment(tx.date, "MMMM D, YYYY h:mm A");

        if (txDate.isValid()) {
          const dateKey = txDate.format("YYYY-MM-DD");

          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }

          groups[dateKey].push(tx);
        } else {
          console.error("Invalid date format:", tx.date);
        }
      }
    });

    const sortedGroups = {};
    Object.keys(groups)
      .sort(
        (a, b) =>
          moment(b, "YYYY-MM-DD").valueOf() - moment(a, "YYYY-MM-DD").valueOf()
      )
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  };

  const handleTransactionClick = (tx) => {
    setSelectedTransaction(tx);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedTransaction(null);
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

  const transactionsByDate = groupTransactionsByDate(sideshiftTransactions);

  const sendSvg = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 15L12 20L17 15"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4V20"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const receiveSvg = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 9L12 4L17 9"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 20V4"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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
      padding-bottom: 40px !important;

      input {
        color: var(--textColor);
      }
    }
  `;

  // SideShift Transaction Detail Modal
  const SideShiftTransactionDetail = () => {
    if (!selectedTransaction) return null;

    const tx = selectedTransaction;
    const explorerUrl = tx.depositNetwork === "ethereum" || tx.settleNetwork === "ethereum"
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
                  <li className="py-2 border-b border-dashed border-white/50">
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
                  </li>
                  <li className="py-2 border-b border-dashed border-white/50">
                    <div className="flex items-center justify-between">
                      <h6 className={`m-0 font-semibold text-base capitalize ${getStatusColor(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </h6>
                      <span
                        className="text-blue-500 text-xs font-medium cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(tx.id);
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
                      <span className="text-white font-medium">
                        {tx.rate}
                      </span>
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
                      <span className="text-white font-medium">
                        {tx.quoteId}
                      </span>
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

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
        </div>
      ) : sideshiftTransactions.length > 0 ? (
        <div className="bg-black/5 lg:p-4 rounded-lg p-3">
          {Object.entries(transactionsByDate).map(([date, txs]) => {
            return (
              <div key={date} className="py-3">
                <p className="m-0 text-white text-xs font-semibold pb-2">
                  {date}
                </p>
                <div className="grid gap-3 grid-cols-12">
                  {txs.map((tx, key) => (
                    <div key={key} className="md:col-span-6 col-span-12">
                      <div
                        onClick={() => handleTransactionClick(tx)}
                        className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60"
                      >
                        <div className="left flex items-start gap-2">
                          <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                            {tx.type === "send" ? sendSvg : receiveSvg}
                          </div>
                          <div className="content">
                            <h4 className="m-0 font-bold md:text-base">
                              {tx.depositCoin} → {tx.settleCoin}
                              {tx.isGold && " (Gold)"}
                            </h4>
                            <p
                              className={`m-0 ${getStatusColor(
                                tx.status
                              )} font-medium text-xs`}
                            >
                              {getStatusText(tx.status)}
                            </p>
                          </div>
                        </div>
                        <div className="right">
                          <p className="m-0 text-xs font-medium">
                            {tx.status === "failed"
                              ? "Transaction Failed"
                              : `${tx.depositAmount} ${tx.depositCoin}`}
                          </p>
                          <p className="m-0 text-xs font-medium opacity-70">
                            → {tx.settleAmount} {tx.settleCoin}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <Image
            src={process.env.NEXT_PUBLIC_IMAGE_URL + "noData.png"}
            alt=""
            height={10000}
            width={10000}
            style={{ maxHeight: 400 }}
            className="max-w-full h-auto w-auto mx-auto"
          />
        </>
      )}

      {/* Transaction Detail Modal */}
      {showDetail && <SideShiftTransactionDetail />}
    </>
  );
};

export default SideShiftTransaction;