import React, { useEffect, useState } from "react";
import Image from "next/image";
import moment from "moment";
import styled from "styled-components";
import { createPortal } from "react-dom";
import SideShiftTransactionDetail from "./SideShiftTransactionDetail";
import { getCurrentUserTimezone } from "@/utils/bitcoinTransaction";
import { lambdaInvokeFunction } from "@/lib/apiCall";
import { useSelector } from "react-redux";

const SideShiftTransaction = ({
  userData,
  dateRange,
  applyTrue,
  setTransactions,
}) => {
  const userAuth = useSelector((state) => state.Auth);
  const userTimezone = getCurrentUserTimezone();
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
      const isGold =
        shift.settleCoin === "XAUT" || shift.depositCoin === "XAUT";

      return {
        id: shift.id || `sideshift_${index}`,
        amount: `${shift.depositAmount || shift.settleAmount || "0"} ${shift.depositCoin || shift.settleCoin || "UNKNOWN"}`,
        category: shift.depositCoin || shift.settleCoin || "SIDESHIFT",
        date:
          moment(shift.createdAt)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
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
        day:
          moment(shift.createdAt)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
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
    const fetchTransactions = async () => {
      const sideShiftIdsData = await lambdaInvokeFunction(
        {
          email: userAuth?.email,
          type: "sideShift",
          page: 1,
          limit: 100,
        },
        "madhouse-backend-production-getUserTrxn"
      );
      const transferIds = sideShiftIdsData?.data?.ids;
      if (!transferIds || transferIds.length === 0) {
        setSideshiftTransactions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const ids = transferIds.map((item) => item);
        console.log("line-131", ids.length);

        // Process IDs in batches of 10
        const batchSize = 10;
        const allApiData = [];

        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          const batchApiData = await fetchSideShiftData(batch);

          // Assuming fetchSideShiftData returns an array, merge results
          if (Array.isArray(batchApiData)) {
            allApiData.push(...batchApiData);
          } else {
            // If it returns an object, you might need to handle differently
            allApiData.push(batchApiData);
          }
        }

        const formattedTransactions = formatSideShiftTransactions(
          allApiData,
          transferIds
        );

        // Apply date filtering if needed
        const filteredTransactions = filterTransactionsByDate(
          formattedTransactions
        );

        setSideshiftTransactions(filteredTransactions);
        setTransactions(filteredTransactions);
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
  }, [userData, applyTrue]);

  console.log("line-174", applyTrue);

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
        // ADD THIS: Sort transactions within each date group by time (newest first)
        sortedGroups[key] = groups[key].sort((a, b) => {
          const timeA = moment(a.date, "MMMM D, YYYY h:mm A");
          const timeB = moment(b.date, "MMMM D, YYYY h:mm A");
          return timeB.valueOf() - timeA.valueOf(); // Newest first
        });
      });

    return sortedGroups;
  };

  const handleTransactionClick = (tx) => {
    setSelectedTransaction(tx);
    setShowDetail(true);
  };

  const transactionsByDate = groupTransactionsByDate(sideshiftTransactions);

  return (
    <>
      {showDetail &&
        createPortal(
          <SideShiftTransactionDetail
            showDetail={showDetail}
            setShowDetail={setShowDetail}
            selectedTransaction={selectedTransaction}
          />,
          document.body
        )}
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
                        <div className="right text-right">
                          <p className="m-0 text-xs font-medium py-1">
                            {tx.status === "failed"
                              ? "Transaction Failed"
                              : `${tx.depositAmount} ${tx.depositCoin}`}
                          </p>
                          <p className="m-0 text-xs font-medium opacity-70">
                            → {tx.settleAmount} {tx.settleCoin}
                          </p>
                          <p className="m-0 text-xs font-medium py-1">
                            {tx.day}
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
    </>
  );
};

export default SideShiftTransaction;

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
