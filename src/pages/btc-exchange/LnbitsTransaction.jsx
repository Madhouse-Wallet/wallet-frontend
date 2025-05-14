import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getPayments } from "../api/lnbit";
import LnbitsTransactionDetail from "./LnbitsTransactionDetail";

// Bitcoin Transaction Component
const LnbitsTransaction = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [btcTransactions, setBtcTransactions] = useState([]);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatBitcoinTransactionData = (txs) => {
    return txs.map((tx) => {
      const isSend = tx.amount < 0;
      const amount = Math.abs(tx.amount) / 1000; // Converting from msats to sats

      return {
        id: tx.checking_id,
        transactionHash: tx.checking_id,
        from: isSend ? userAuth?.walletAddress : "External",
        to: isSend ? "External" : userAuth?.walletAddress,
        date: moment(tx.time).format("MMMM D, YYYY h:mm A"),
        status: tx.status === "success" ? "confirmed" : "pending",
        amount: `${amount.toFixed(2)} sats`,
        type: isSend ? "token send" : "token receive",
        summary:
          tx.memo ||
          (isSend
            ? `Sent ${amount.toFixed(2)} sats`
            : `Received ${amount.toFixed(2)} sats`),
        category: "payment",
        rawData: tx,
      };
    });
  };

  const fetchBitcoinTransactions = async () => {
    setLoading(true);
    try {
      // You'll need to store walletId and token in userAuth or elsewhere
      const { status, data } = await getPayments(
        userAuth?.btcWalletId,
        userAuth?.btcToken
      );

      if (status && data?.data?.length) {
        const formattedTransactions = formatBitcoinTransactionData(data.data);
        setBtcTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching Bitcoin transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAuth?.btcWalletId && userAuth?.btcToken) {
      fetchBitcoinTransactions();
    }
  }, [userAuth?.btcWalletId, userAuth?.btcToken]);

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
        d="M12 4L4 8L12 12L20 8L12 4Z"
        stroke="#FF5757"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16L12 20L20 16"
        stroke="#FF5757"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12L12 16L20 12"
        stroke="#FF5757"
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
        d="M12 4L4 8L12 12L20 8L12 4Z"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16L12 20L20 16"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12L12 16L20 12"
        stroke="#4CAF50"
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
          <LnbitsTransactionDetail
            detail={detail}
            setDetail={setDetail}
            transactionData={transactionData}
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
                              ? "Failed Transaction"
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

export default LnbitsTransaction;
