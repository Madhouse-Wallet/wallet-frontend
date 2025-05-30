import React from "react";
import {
  fetchBitcoinTransactionsByAddress,
  formatBitcoinTransactions,
} from "../../utils/bitquery-api";
import { useEffect, useState } from "react";
import BitcoinTransactionDetail from "./BitcoinTransactionDetail";
import { useSelector } from "react-redux";
import Image from "next/image";
import moment from "moment";
import { createPortal } from "react-dom";

// Bitcoin Transactions Component
const BitcoinTransactionsTab = ({ setTransactions, dateRange, applyTrue }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [btcTransactions, setBtcTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  // Get wallet address from user auth
  const btcWalletAddress = userAuth?.bitcoinWallet;
  // const btcWalletAddress = "bc1p0fxxzxvzyr4qdpq8pw6gn0tyl0np8wn89t3zn3fdd4j8vvvf6s2qcl7a73";

  const formatDateForApi = (date) => {
    if (!date) return null;
    return moment(date).format("YYYY-MM-DD");
  };

  // Check if date filter is active
  const isDateFilterActive = () => {
    if (applyTrue === true) return true;
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!btcWalletAddress) return;

      setLoading(true);
      setError(null);

      try {
        // Use date filters only if active
        const startDate = isDateFilterActive()
          ? formatDateForApi(dateRange?.startDate)
          : null;
        const endDate = isDateFilterActive()
          ? formatDateForApi(dateRange?.endDate)
          : null;

        console.log("startDate", startDate, endDate, dateRange, applyTrue);
        // BitQuery API token
        const accessToken = process.env.NEXT_PUBLIC_BITQUERY_ACCESS_TOKEN;

        // Fetch transactions using the API
        const data = await fetchBitcoinTransactionsByAddress(
          btcWalletAddress,
          accessToken,
          startDate,
          endDate
        );

        // Set raw transactions data for parent component
        setTransactions(data);

        // Format transactions for display
        const formattedTransactions = formatBitcoinTransactions(
          data,
          btcWalletAddress
        );

        setBtcTransactions(formattedTransactions);
      } catch (err) {
        console.error("Failed to fetch BTC transactions:", err);
        setError(
          "Failed to load transactions. Please check your connection and wallet address."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [btcWalletAddress, dateRange, applyTrue]);

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
        return "Unknown";
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
                  {/* {txs.map((tx, key) => ( */}
                  {txs
                    .filter((tx) => {
                      const amount = parseFloat(tx.amount?.split(" ")[0] || 0);
                      return amount >= 0.00000001;
                    })
                    .map((tx, key) => (
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
                          <div className="right">
                            <p className="m-0 text-xs font-medium">
                              {tx.status === "rejected"
                                ? "Insufficient Balance"
                                : `${tx.type === "token send" ? "-" : "+"} ${
                                    tx.amount
                                  }`}
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
