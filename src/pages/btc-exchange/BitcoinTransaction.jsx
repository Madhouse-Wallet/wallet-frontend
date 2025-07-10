import React from "react";
import {
  fetchBitcoinTransactions,
  formatBitcoinTransactions,
  getCurrentUserTimezone,
} from "../../utils/bitcoinTransaction";
import { useEffect, useState } from "react";
import BitcoinTransactionDetail from "./BitcoinTransactionDetail";
import { useSelector } from "react-redux";
import Image from "next/image";
import moment from "moment";
import { createPortal } from "react-dom";

// Bitcoin Transactions Component
const BitcoinTransactionsTab = ({
  setTransactions,
  dateRange,
  selectedItem,
}) => {
  const userAuth = useSelector((state) => state.Auth);
  const [btcTransactions, setBtcTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const btcWalletAddress = userAuth?.bitcoinWallet;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!btcWalletAddress) return;

      setLoading(true);
      try {
        const data = await fetchBitcoinTransactions(
          btcWalletAddress,
          selectedItem
        );
        const userTimezone = getCurrentUserTimezone();
        console.log(userTimezone);
        const formattedTransactions = formatBitcoinTransactions(
          data,
          btcWalletAddress,
          userTimezone
          // "America/New_York"
        );
        // setBtcTransactions(formattedTransactions);
        // setTransactions(formattedTransactions);

        // Sort transactions: pending/unconfirmed first, then by date (newest first)
        const sortedTransactions = formattedTransactions.sort((a, b) => {
          // Define priority order: unconfirmed = 0, pending = 1, confirmed = 2
          const getPriority = (status) => {
            if (status === "unconfirmed") return 0;
            if (status === "pending") return 1;
            return 2; // confirmed
          };

          const priorityA = getPriority(a.status);
          const priorityB = getPriority(b.status);

          // First sort by priority (lower number = higher priority)
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // If same priority, sort by date (newest first)
          const dateA = new Date(a.rawData.confirmed || a.rawData.received);
          const dateB = new Date(b.rawData.confirmed || b.rawData.received);
          return dateB - dateA;
        });

        setBtcTransactions(sortedTransactions);
        setTransactions(sortedTransactions);
      } catch (err) {
        console.error("Failed to fetch BTC transactions:", err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [btcWalletAddress, selectedItem]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Pending";
      default:
        return "Pending";
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
      } else if (tx?.date && moment.isMoment(tx.date)) {
        const dateKey = tx.date.format("YYYY-MM-DD");

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(tx);
      } else {
        console.error("Missing or invalid date:", tx?.date);
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
    setDetail(!detail);
    setTransactionData(tx);
  };

  const transactionsByDate = groupTransactionsByDate(btcTransactions);

  return (
    <>
      {detail &&
        createPortal(
          <BitcoinTransactionDetail
            detail={detail}
            setDetail={setDetail}
            transactionData={transactionData}
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
      ) : btcTransactions.length > 0 ? (
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
                            {tx.type === "token send" ? sendSvg : receiveSvg}
                          </div>
                          <div className="content">
                            <h4 className="m-0 font-bold md:text-base">
                              {tx.type === "token send" ? "Send" : "Receive"}{" "}
                              BTC
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
                            {tx.status === "rejected"
                              ? "Insufficient Balance"
                              : `${tx.type === "token send" ? "-" : "+"} ${
                                  tx.amount
                                }`}
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

export default BitcoinTransactionsTab;

const sendSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="icon-arrow-2-up-right"
    viewBox="0 0 512 512"
    height={20}
    width={20}
  >
    <path d="m137 107c0-12 10-22 22-22l225 0c12 0 21 10 21 22l0 225c0 12-9 21-21 21-12 0-21-9-21-21l0-174-241 241c-9 8-22 8-30 0-9-8-9-22 0-30l240-241-173 0c-12 0-22-10-22-21z" />
  </svg>
);

const receiveSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="icon-arrow-2-down-left"
    viewBox="0 0 512 512"
    height={20}
    width={20}
  >
    <path d="m375 405c0 12-10 22-22 22l-225 0c-12 0-21-10-21-22l0-225c0-12 9-21 21-21 12 0 21 9 21 21l0 174 241-241c9-8 22-8 30 0 9 8 9 22 0 30l-240 241 173 0c12 0 22 10 22 21z" />
  </svg>
);
