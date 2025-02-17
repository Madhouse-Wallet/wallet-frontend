// import React, { useEffect, useState } from "react";
// import TableLayout from "@/components/TableLayout/index";
// import { fetchWalletHistory } from "../../lib/utils";
// import { useSelector } from "react-redux";
// import img from "@/Assets/Images/noData.png";
// import Image from "next/image";
// import { fetchTransactions } from "../../utils/fetchTransactions";
// import { createPortal } from "react-dom";
// import TransactionDetail from "@/components/Modals/TransactionDetailPop"

// const RecentTransaction = () => {
//   const userAuth = useSelector((state) => state.Auth);
//   const [transactions, setTransactions] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [detail, setDetail ] = useState(false);

//   const columns = [
//     {
//       head: "Transaction Hash",
//       accessor: "transactionHash",
//       component: (item) => {
//         const explorerUrl = `https://etherscan.io/tx/${item.transactionHash}`;
//         return (
//           <a
//             href={explorerUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-500 underline"
//           >
//             {item.transactionHash.slice(0, 30)}...
//           </a>
//         );
//       },
//     },
//     {
//       head: "From",
//       accessor: "from",
//       component: (item) =>
//         item.from ? (
//           <span>
//             {item.from.slice(0, 6)}...{item.from.slice(-4)}
//           </span>
//         ) : (
//           "-"
//         ),
//     },
//     {
//       head: "To",
//       accessor: "to",
//       component: (item) =>
//         item.to ? (
//           <span>
//             {item.to.slice(0, 6)}...{item.to.slice(-4)}
//           </span>
//         ) : (
//           "-"
//         ),
//     },
//     {
//       head: "Date",
//       accessor: "date",
//     },
//   ];

//   // useEffect(() => {
//   //   if (userAuth?.walletAddress) {
//   //     const fetchData = async () => {
//   //       try {
//   //         const balance = await fetchTokenTransfers(
//   //           [
//   //             process.env.NEXT_PUBLIC_THRESHOLD_TBTC_CONTRACT_ADDRESS,
//   //             process.env.NEXT_PUBLIC_THUSD_CONTRACT_ADDRESS,
//   //           ],
//   //           userAuth.walletAddress
//   //         );

//   //         if (balance?.result?.length) {
//   //           const latestTransactions = balance.result
//   //             .slice(0, 10)
//   //             .map((tx) => ({
//   //               transactionHash: tx.transaction_hash,
//   //               transaction: `${parseFloat(tx.value_decimal).toFixed(2)} ${
//   //                 tx.token_symbol
//   //               }`,
//   //               date: new Date(tx.block_timestamp).toLocaleString(),
//   //             }));

//   //           setTransactions(latestTransactions);
//   //         }
//   //       } catch (error) {
//   //         console.error("Error fetching transactions:", error);
//   //       }
//   //     };

//   //     fetchData();
//   //   }
//   // }, [userAuth?.walletAddress]);

//   // Function to fetch and process recent transactions
//   const fetchRecentTransactions = async () => {
//     try {
//       // const balance = await fetchWalletHistory(userAuth?.walletAddress);
//       const balance = await fetchWalletHistory(
//         "0xcB1C1FdE09f811B294172696404e88E658659905"
//       );
//       console.log("data", balance);

//       if (balance?.result?.length) {
//         const latestTransactions = balance.result
//           .slice(0, 10) // Get only the first 10 transactions
//           .map((tx) => ({
//             transactionHash: tx.hash,
//             from: tx?.from_address ? tx?.from_address : "",
//             to: tx?.to_address ? tx?.to_address : "",
//             date: new Date(tx.block_timestamp).toLocaleString(),
//           }));

//         setTransactions(latestTransactions);
//       }
//     } catch (error) {
//       console.error("Error fetching transactions:", error);
//     }
//   };

//   useEffect(() => {
//     if (userAuth?.walletAddress) {
//       // fetchRecentTransactions(userAuth.walletAddress);
//       fetchRecentTransactions();
//     }
//   }, [userAuth?.walletAddress]);

//   const fetchWalletInternalTransactions = async () => {
//     try {
//       console.log("line-72");
//       const data = await fetchTransactions(userAuth?.walletAddress);
//       console.log("line-71", data);

//       if (data?.length) {
//         const latestTransactions = data.slice(0, 10).map((tx) => ({
//           transactionHash: tx.txHash,
//           from: tx.from,
//           to: tx.to,
//           transaction: `${parseFloat(tx.amount).toFixed(2)} TBTC`,
//           date: new Date(parseInt(tx.timestamp) * 1000).toLocaleString(), // Convert UNIX timestamp to readable date
//         }));

//         setTransactions(latestTransactions);
//       }
//     } catch (err) {
//       console.error("Error fetching transactions:", err);
//     }
//   };

//   console.log("transaction data",transactions)

//   return (
//     <>
//     {detail &&
//         createPortal(<TransactionDetail detail={detail} setDetail={setDetail} />, document.body)}
//       {transactions.length > 0 ? (
//         <>
//           <div className="flex items-center gap-3 mb-3 justify-between relative z-[99]">
//             <h4 className="m-0 text-xl">Recent Transaction</h4>
//             <div className="relative inline-block text-left">
//               <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="px-4 py-2 bg-black/50 text-white rounded-md"
//               >
//                 Options
//               </button>

//               {isOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
//                   <a
//                     href="#"
//                     className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
//                     onClick={fetchRecentTransactions}
//                   >
//                     All
//                   </a>
//                   <a
//                     href="#"
//                     className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
//                     onClick={fetchWalletInternalTransactions}
//                   >
//                     Internal
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="bg-black/50 lg:p-4 rounded-lg p-3">
//             <div className="py-3">
//               <p className="m-0 text-white text-xs font-semibold pb-2">12 Jan 2025</p>
//               <div className="grid gap-3 grid-cols-12">
//                 {[1,3].map((item,key)=> (
//                 <div key={key} className="md:col-span-6 col-span-12">
//                   <div onClick={()=> setDetail(!detail)} className="bg-black/50 p-3 rounded-lg flex items-start gap-2 justify-between">
//                     <div className="left flex items-start gap-2">
//                       <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
//                         {sendSvg}
//                       </div>
//                       <div className="content">
//                         <h4 className="m-0 font-bold md:text-xl text-base">Send USDC</h4>
//                         <p className="m-0 text-green-500 font-medium md:text-base text-xs">Confirmed</p>
//                       </div>
//                     </div>
//                     <div className="right">
//                       <p className="m-0 md:text-base text-xs font-medium">-1 USDC</p>
//                     </div>
//                   </div>
//                 </div>
//                 ))}
//                 {[1,2].map((item,key)=> (
//                 <div key={key} className="md:col-span-6 col-span-12">
//                   <div onClick={()=> setDetail(!detail)} className="bg-black/50 p-3 rounded-lg flex items-start gap-2 justify-between">
//                     <div className="left flex items-start gap-2">
//                       <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
//                         {sendSvg}
//                       </div>
//                       <div className="content">
//                         <h4 className="m-0 font-bold md:text-xl text-base">Send USDC</h4>
//                         <p className="m-0 text-red-500 font-medium md:text-base text-xs">Rejected</p>
//                       </div>
//                     </div>
//                     <div className="right">
//                       <p className="m-0 md:text-base text-xs font-medium">Insufficient Balance</p>
//                     </div>
//                   </div>
//                 </div>
//                 ))}
//                  {[1,2].map((item,key)=> (
//                 <div key={key} className="md:col-span-6 col-span-12">
//                   <div onClick={()=> setDetail(!detail)} className="bg-black/50 p-3 rounded-lg flex items-start gap-2 justify-between">
//                     <div className="left flex items-start gap-2">
//                       <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
//                         {sendSvg}
//                       </div>
//                       <div className="content">
//                         <h4 className="m-0 font-bold md:text-xl text-base">Send USDC</h4>
//                         <p className="m-0 text-yellow-500 font-medium md:text-base text-xs">Pending</p>
//                       </div>
//                     </div>
//                     <div className="right">
//                       <p className="m-0 md:text-base text-xs font-medium">-0.4 USDC</p>
//                     </div>
//                   </div>
//                 </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* <TableLayout data={transactions} column={columns} /> */}
//         </>
//       ) : (
//         <>
//           <Image
//             src={img}
//             alt=""
//             height={10000}
//             width={10000}
//             style={{ maxHeight: 400 }}
//             className="max-w-full h-auto w-auto mx-auto"
//           />
//         </>
//       )}
//     </>
//   );
// };

// export default RecentTransaction;

// const sendSvg = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     id="icon-arrow-2-up-right"
//     viewBox="0 0 512 512"
//     height={20}
//     width={20}
//   >
//     <path d="m137 107c0-12 10-22 22-22l225 0c12 0 21 10 21 22l0 225c0 12-9 21-21 21-12 0-21-9-21-21l0-174-241 241c-9 8-22 8-30 0-9-8-9-22 0-30l240-241-173 0c-12 0-22-10-22-21z" />
//   </svg>
// );

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { createPortal } from "react-dom";
import { fetchWalletHistory } from "../../lib/utils";
import { fetchTransactions } from "../../utils/fetchTransactions";
import TransactionDetail from "@/components/Modals/TransactionDetailPop";
import img from "@/Assets/Images/noData.png";

const RecentTransaction = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [transactions, setTransactions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  const [transactionType, setTransactionType] = useState("all");

  // Format transactions from fetchWalletHistory
  const formatWalletHistoryData = (txs) => {
    return txs.map((tx) => {
      // Get the amount and currency from native transfers or value
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

      // Check for ERC20 transfers
      if (tx.erc20_transfers && tx.erc20_transfers.length > 0) {
        const transfer = tx.erc20_transfers[0];
        amount = parseFloat(transfer.value_decimal).toFixed(4);
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
        date: new Date(tx.block_timestamp).toLocaleString(),
        status:
          tx.receipt_status === "1"
            ? "confirmed"
            : tx.receipt_status === "0"
            ? "rejected"
            : "pending",
        amount: amount ? `${amount} ${currency}` : "",
        // type: isSend ? "send" : "receive",
        type: tx?.category,
        summary:
          tx.summary || `${isSend ? "Sent" : "Received"} ${amount} ${currency}`,
        category: tx.category,
        rawData: tx,
      };
    });
  };

  // Format transactions from fetchWalletInternalTransactions
  const formatInternalTransactionsData = (txs) => {
    return txs.map((tx) => {
      // Determine if this is a deposit or redemption transaction
      const isDeposit = tx.deposits && tx.deposits.length > 0;
      const isRedemption = tx.redemptions && tx.redemptions.length > 0;

      // Get the transaction details based on type
      let amount = "";
      let status = "pending";
      let type = "";
      let summary = "";
      let transactionDetails = null;

      if (isDeposit) {
        const deposit = tx.deposits[0];
        amount = (parseFloat(tx.amount) / 1e8).toFixed(8); // Assuming amount is in satoshis
        status = mapDepositStatus(deposit.status);
        type = "receive";
        summary = `Deposit ${amount} TBTC`;
        transactionDetails = deposit;
      } else if (isRedemption) {
        const redemption = tx.redemptions[0];
        amount = (parseFloat(tx.amount) / 1e8).toFixed(8); // Assuming amount is in satoshis
        status = mapRedemptionStatus(redemption.status);
        type = "send";
        summary = `Redemption ${amount} TBTC`;
        transactionDetails = redemption;
      }

      return {
        id: tx.txHash,
        transactionHash: tx.txHash,
        from: tx.from,
        to: tx.to,
        date: new Date(parseInt(tx.timestamp) * 1000).toLocaleString(),
        status: status,
        amount: `${amount} TBTC`,
        type: type,
        summary: summary,
        isDeposit: isDeposit,
        isRedemption: isRedemption,
        transactionDetails: transactionDetails,
        rawData: tx,
      };
    });
  };

  // Map deposit status to display status
  const mapDepositStatus = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "confirmed";
      case "REQUESTED":
        return "pending";
      default:
        return "pending";
    }
  };

  // Map redemption status to display status
  const mapRedemptionStatus = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "confirmed";
      case "REQUESTED":
        return "pending";
      case "FAILED":
        return "rejected";
      default:
        return "pending";
    }
  };

  // Function to fetch and process recent transactions
  const fetchRecentTransactions = async () => {
    try {
      setTransactionType("all");
      // const data = await fetchWalletHistory(userAuth?.walletAddress);
      const data = await fetchWalletHistory(
        "0xcB1C1FdE09f811B294172696404e88E658659905"
      );
      console.log("Wallet history data:", data);

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

  // Function to fetch internal transactions
  const fetchWalletInternalTransactions = async () => {
    try {
      setTransactionType("internal");
      const data = await fetchTransactions(userAuth?.walletAddress);
      console.log("Internal transactions:", data);

      if (data?.length) {
        const formattedTransactions = formatInternalTransactionsData(
          data.slice(0, 10)
        );
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error("Error fetching internal transactions:", err);
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

  // Group transactions by date
  const groupTransactionsByDate = (txs) => {
    const groups = {};

    txs.forEach((tx) => {
      const date = new Date(tx.date).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });

    return groups;
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

      <div className="flex items-center gap-3 mb-3 justify-between relative z-[99]">
        <h4 className="m-0 text-xl">Recent Transaction</h4>
        <div className="relative inline-block text-left">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-black/50 text-white rounded-md"
          >
            Options
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={fetchRecentTransactions}
              >
                All
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={fetchWalletInternalTransactions}
              >
                Internal
              </a>
            </div>
          )}
        </div>
      </div>

      {transactions.length > 0 ? (
        <div className="bg-black/50 lg:p-4 rounded-lg p-3">
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
                      className="bg-black/50 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60"
                    >
                      <div className="left flex items-start gap-2">
                        <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                          {tx.type === "send" ? sendSvg : receiveSvg}
                        </div>
                        <div className="content">
                          <h4 className="m-0 font-bold md:text-xl text-base">
                            {tx.isRedemption
                              ? "Redemption"
                              : tx.isDeposit
                              ? "Deposit"
                              : tx.type === "send"
                              ? "Send"
                              : "Receive"}{" "}
                            {tx.amount?.split(" ")[1] || "ETH"}
                          </h4>
                          <p
                            className={`m-0 ${getStatusColor(
                              tx.status
                            )} font-medium md:text-base text-xs`}
                          >
                            {getStatusText(tx.status)}
                          </p>
                        </div>
                      </div>
                      <div className="right">
                        <p className="m-0 md:text-base text-xs font-medium">
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
            src={img}
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
