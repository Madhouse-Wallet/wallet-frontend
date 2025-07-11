import React, { useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import TransactionDetailPop from "../TransactionDetailPop";
import moment from "moment";

const RecentTransaction = ({ transactions, data }) => {
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
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
          try {
            const fallbackDate = moment(tx.date);
            if (fallbackDate.isValid()) {
              const dateKey = fallbackDate.format("YYYY-MM-DD");

              if (!groups[dateKey]) {
                groups[dateKey] = [];
              }
              groups[dateKey].push(tx);
            }
          } catch (error) {
            console.error("Error parsing date:", tx.date, error);
          }
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
  const transactionsByDate = groupTransactionsByDate(transactions);

  const hasLoanBalance = data.some((item) => item.head === "Loan Balance");

  if (hasLoanBalance) {
    return null;
  }

  return (
    <>
      {detail &&
        createPortal(
          <TransactionDetailPop
            detail={detail}
            setDetail={setDetail}
            transactionData={transactionData}
          />,
          document.body
        )}
      {transactions.length > 0 ? (
        <div className="bg-black/5 lg:p-4 rounded-lg p-3">
          {Object.entries(transactionsByDate).map(([date, txs]) => (
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
                            {tx.isRedemption
                              ? "Redemption"
                              : tx.isDeposit
                                ? "Deposit"
                                : tx.type === "send"
                                  ? "Send"
                                  : "Receive"}{" "}
                            {tx.amount?.split(" ")[1] || tx.category || "ETH"}
                          </h4>
                          <p
                            className={`m-0 ${getStatusColor(
                              tx.status
                            )} font-medium  text-xs`}
                          >
                            {getStatusText(tx.status)}
                          </p>
                        </div>
                      </div>
                      <div className="right">
                        <p className="m-0 font-medium">
                          {tx.status === "rejected"
                            ? "Insufficient Balance"
                            : `${tx.type === "send" ? "-" : "+"} ${tx.amount}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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

export default RecentTransaction;

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
