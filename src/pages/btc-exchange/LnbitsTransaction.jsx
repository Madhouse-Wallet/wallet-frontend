import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import LnbitsTransactionDetail from "./LnbitsTransactionDetail";
import Image from "next/image";
import moment from "moment";
import { createPortal } from "react-dom";
import { getUser, lambdaInvokeFunction } from "@/lib/apiCall";
import { getCurrentUserTimezone } from "@/utils/bitcoinTransaction";

// Bitcoin Transaction Component
const LnbitsTransaction = ({
  usd,
  setTransactions,
  walletIdd,
  dateRange,
  applyTrue,
}) => {
  const userTimezone = getCurrentUserTimezone();
  const userAuth = useSelector((state) => state.Auth);
  const [btcTransactions, setBtcTransactions] = useState([]);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatDateForApi = (date) => {
    if (!date) return null;
    return moment(date).format("YYYY-MM-DD");
  };

  // Check if date filter is active
  const isDateFilterActive = () => {
    if (applyTrue === true) return true;
  };

  const formatBitcoinTransactionData = (txs) => {
    return txs.map((tx) => {
      const amount = tx.amount;
      const isSend = amount < 0;

      return {
        id: tx.checking_id,
        transactionHash: tx.checking_id,
        from: isSend ? userAuth?.walletAddress : "External",
        to: isSend ? "External" : userAuth?.walletAddress,
        date:
          moment
            .utc(tx.time)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
        status: tx.status,
        amount: `${amount.toFixed(2)} sats`,
        type: isSend ? "send" : "receive",
        summary:
          tx.memo ||
          (isSend
            ? `Sent ${amount.toFixed(2)} sats`
            : `Received ${amount.toFixed(2)} sats`),
        category: "payment",
        rawData: tx,
        day:
          moment
            .utc(tx.time)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
      };
    });
  };

  const formatTposTransactionData = (txs) => {
    return txs.map((tx) => {
      const amount = tx.amount;
      const isSend = amount < 0;

      return {
        id: tx.id,
        transactionHash: tx.checking_id,
        from: isSend ? userAuth?.walletAddress : "External",
        to: isSend ? "External" : userAuth?.walletAddress,
        date:
          moment
            .utc(tx.time)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
        status: tx.status,
        amount: `${onchainAmount.toFixed(2)} sats`,
        type: isSend ? "send" : "receive",
        summary:
          tx.memo ||
          (isSend
            ? `Sent ${amount.toFixed(2)} sats`
            : `Received ${amount.toFixed(2)} sats`),
        category: "payment",
        rawData: tx,
        day:
          moment
            .utc(tx.time)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
      };
    });
  };

  const fetchBitcoinTransactions = async () => {
    setLoading(true);
    try {
      const startDate = isDateFilterActive()
        ? formatDateForApi(dateRange?.startDate)
        : null;
      const endDate = isDateFilterActive()
        ? formatDateForApi(dateRange?.endDate)
        : null;
      const checkUser = await getUser(userAuth?.email);

      if (usd === 0) {
        const response = await fetch("/api/lnbits-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletId: walletIdd,
            // walletId: "47472a63d2364de2836f0f71c73bf034",
            fromDate: startDate,
            toDate: endDate,
            tag: "tpos",
            apiKey: checkUser?.userId?.lnbitAdminKey,
          }),
        });

        const { status, data } = await response.json();
        if (status === "success" && data) {
          const formattedTransactions = formatBitcoinTransactionData(data);
          setBtcTransactions(formattedTransactions);
          setTransactions(formattedTransactions);
        } else {
          setBtcTransactions([]);
        }
      } else if (usd === 1) {
        const response = await fetch("/api/lnbits-transaction-bitcoin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletId: walletIdd,
            // walletId: "47472a63d2364de2836f0f71c73bf034",
            fromDate: startDate,
            toDate: endDate,
            tag: "tpos",
            apiKey: checkUser?.userId?.lnbitAdminKey_2,
          }),
        });

        const { status, data } = await response.json();

        if (status === "success" && data) {
          const formattedTransactions = formatBitcoinTransactionData(data);
          setBtcTransactions(formattedTransactions);
          setTransactions(formattedTransactions);
        } else {
          setBtcTransactions([]);
        }
      } else if (usd === 2) {
        const response = await fetch("/api/spend-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletId: walletIdd,
            // walletId: "ccd505c23ebf4a988b190e6aaefff7a5",
            fromDate: startDate,
            toDate: endDate,
            apiKey: checkUser?.userId?.lnbitAdminKey_3,
          }),
        });

        const { status, data } = await response.json();

        if (status === "success" && data) {
          const formattedTransactions = formatBitcoinTransactionData(data);
          setBtcTransactions(formattedTransactions);
          setTransactions(formattedTransactions);
        } else {
          setBtcTransactions([]);
        }
      } else if (usd === 4) {
        const response = await fetch("/api/deposit-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userAuth?.email,
          }),
        });

        const { status, data } = await response.json();

        if (status === "success" && data) {
          const formattedTransactions = formatBitcoinTransactionData(data);
          setBtcTransactions(formattedTransactions);
          setTransactions(formattedTransactions);
        } else {
          setBtcTransactions([]);
        }
      } else if (usd === 6) {
        const response = await fetch("/api/withdraw-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userAuth?.email,
            tpos: true,
            type: "bitcoin",
          }),
        });

        const { status, data } = await response.json();

        if (status === "success" && data) {
          const formattedTransactions = formatBitcoinTransactionData(data);
          setBtcTransactions(formattedTransactions);
          setTransactions(formattedTransactions);
        } else {
          setBtcTransactions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching Bitcoin transactions:", error);
      setTransactions([]);
      setBtcTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinTransactions();
  }, [usd, applyTrue]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      case "complete":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Confirmed";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      case "complete":
        return "Confirmed";
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

  return (
    <>
      {detail &&
        createPortal(
          <LnbitsTransactionDetail
            detail={detail}
            setDetail={setDetail}
            transactionData={transactionData}
            usd={usd}
          />,
          document.body
        )}
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
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
                            {tx.type === "send" ? sendSvg : receiveSvg}
                          </div>
                          <div className="content">
                            <h4 className="m-0 font-bold md:text-base">
                              {tx.type === "send" ? "Send" : "Receive"} SATS
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
                            {/* {tx.status === "failed"
                              ? "Failed Transaction"
                              : `${tx.type === "send" ? "-" : "+"} ${
                                  tx.amount
                                }`} */}
                            {parseFloat(tx.amount) / 1000}
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

export default LnbitsTransaction;

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
