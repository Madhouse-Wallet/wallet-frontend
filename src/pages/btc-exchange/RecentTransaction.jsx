import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { createPortal } from "react-dom";
import { fetchWalletHistory } from "../../lib/utils";
import TransactionDetail from "@/components/Modals/TransactionDetailPop";
import InternalTab from "./InternalTab";
import moment from "moment";

const RecentTransaction = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [transactions, setTransactions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  const [transactionType, setTransactionType] = useState("all");

  const formatWalletHistoryData = (txs) => {
    return txs.map((tx) => {
      let amount = "";
      let currency = "ETH";
      let isSend = false;

      if (tx.native_transfers && tx.native_transfers.length > 0) {
        const transfer = tx.native_transfers[0];
        const ethValue = parseFloat(transfer.value || tx.value) / 1e18;
        amount = ethValue.toFixed(4);
        isSend =
          tx.from_address.toLowerCase() ===
          userAuth?.walletAddress?.toLowerCase();
      } else if (tx.value) {
        const ethValue = parseFloat(tx.value) / 1e18;
        amount = ethValue.toFixed(4);
        isSend =
          tx.from_address.toLowerCase() ===
          userAuth?.walletAddress?.toLowerCase();
      }

      if (tx.erc20_transfers && tx.erc20_transfers.length > 0) {
        const transfer = tx.erc20_transfers[0];
        amount = parseFloat(transfer.value_formatted).toFixed(4);
        currency = transfer.token_symbol;
        isSend =
          transfer.from_address.toLowerCase() ===
          userAuth?.walletAddress?.toLowerCase();
      }

      return {
        id: tx.hash,
        transactionHash: tx.hash,
        from: tx.from_address,
        to: tx.to_address,
        date: moment(tx.block_timestamp).format("MMMM D, YYYY h:mm A"),
        status:
          tx.receipt_status === "1"
            ? "confirmed"
            : tx.receipt_status === "0"
              ? "rejected"
              : "pending",
        amount: amount ? `${amount} ${currency}` : "",
        type: tx?.category,
        summary:
          tx.summary || `${isSend ? "Sent" : "Received"} ${amount} ${currency}`,
        category: tx.category,
        rawData: tx,
      };
    });
  };

  const fetchRecentTransactions = async () => {
    try {
      setTransactionType("all");
      const data = await fetchWalletHistory(userAuth?.walletAddress);

      if (data?.result?.length) {
        const formattedTransactions = formatWalletHistoryData(
          data.result.slice(0, 10)
        );
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

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

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchRecentTransactions();
    }
  }, [userAuth?.walletAddress]);

  const handleTransactionClick = (tx) => {
    setDetail(!detail);
    setTransactionData(tx);
  };

  const transactionsByDate = groupTransactionsByDate(transactions);
  const tabs = [
    {
      title: "All",
      component: (
        <>
          {transactions.length > 0 ? (
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
                                {tx.type === "token send"
                                  ? sendSvg
                                  : receiveSvg}
                              </div>
                              <div className="content">
                                <h4 className="m-0 font-bold md:text-base">
                                  {tx.isRedemption
                                    ? "Redemption"
                                    : tx.isDeposit
                                      ? "Deposit"
                                      : tx.type === "token send"
                                        ? "Send"
                                        : "Receive"}{" "}
                                  {tx.amount?.split(" ")[1] || "ETH"}
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
                              <p className="m-0  text-xs font-medium">
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
      ),
    },
    { title: "Internal", component: <InternalTab /> },
  ];

  return (
    <>
      {detail &&
        createPortal(
          <TransactionDetail
            detail={detail}
            setDetail={setDetail}
            transactionData={transactionData}
          />,
          document.body
        )}
      {userAuth?.walletAddress ? (
        <>
          <div className="flex items-center gap-3 mb-3 justify-between relative z-[99]">
            <h4 className="m-0 text-xl">Recent Transaction</h4>
            <div className="relative inline-block text-left">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-black/50 text-white rounded-md"
              >
                Filters
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
                  {tabs.map((item, key) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      // href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="py-2">
            <div className="">{tabs[activeTab].component}</div>
          </div>
        </>
      ) : (
        <>
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
