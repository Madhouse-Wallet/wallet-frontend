import React, { useEffect, useState } from "react";
import TableLayout from "@/components/TableLayout/index";
import { fetchWalletHistory } from "../../lib/utils";
import { useSelector } from "react-redux";
import img from "@/Assets/Images/noData.png";
import Image from "next/image";
import { fetchTransactions } from "../../utils/fetchTransactions";

const RecentTransaction = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [transactions, setTransactions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const columns = [
    {
      head: "Transaction Hash",
      accessor: "transactionHash",
      component: (item) => {
        const explorerUrl = `https://etherscan.io/tx/${item.transactionHash}`;
        return (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {item.transactionHash.slice(0, 30)}...
          </a>
        );
      },
    },
    {
      head: "From",
      accessor: "from",
      component: (item) =>
        item.from ? (
          <span>
            {item.from.slice(0, 6)}...{item.from.slice(-4)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      head: "To",
      accessor: "to",
      component: (item) =>
        item.to ? (
          <span>
            {item.to.slice(0, 6)}...{item.to.slice(-4)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      head: "Date",
      accessor: "date",
    },
  ];

  // useEffect(() => {
  //   if (userAuth?.walletAddress) {
  //     const fetchData = async () => {
  //       try {
  //         const balance = await fetchTokenTransfers(
  //           [
  //             process.env.NEXT_PUBLIC_THRESHOLD_TBTC_CONTRACT_ADDRESS,
  //             process.env.NEXT_PUBLIC_THUSD_CONTRACT_ADDRESS,
  //           ],
  //           userAuth.walletAddress
  //         );

  //         if (balance?.result?.length) {
  //           const latestTransactions = balance.result
  //             .slice(0, 10)
  //             .map((tx) => ({
  //               transactionHash: tx.transaction_hash,
  //               transaction: `${parseFloat(tx.value_decimal).toFixed(2)} ${
  //                 tx.token_symbol
  //               }`,
  //               date: new Date(tx.block_timestamp).toLocaleString(),
  //             }));

  //           setTransactions(latestTransactions);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching transactions:", error);
  //       }
  //     };

  //     fetchData();
  //   }
  // }, [userAuth?.walletAddress]);

  // Function to fetch and process recent transactions
  const fetchRecentTransactions = async () => {
    try {
      // const balance = await fetchWalletHistory(userAuth?.walletAddress);
      const balance = await fetchWalletHistory("0xcB1C1FdE09f811B294172696404e88E658659905");
      console.log("data", balance);

      if (balance?.result?.length) {
        const latestTransactions = balance.result
          .slice(0, 10) // Get only the first 10 transactions
          .map((tx) => ({
            transactionHash: tx.hash,
            from: tx?.from_address ? tx?.from_address : "",
            to: tx?.to_address ? tx?.to_address : "",
            date: new Date(tx.block_timestamp).toLocaleString(),
          }));

        setTransactions(latestTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (userAuth?.walletAddress) {
      // fetchRecentTransactions(userAuth.walletAddress);
      fetchRecentTransactions();
    }
  }, [userAuth?.walletAddress]);

  const fetchWalletInternalTransactions = async () => {
    try {
      console.log("line-72");
      const data = await fetchTransactions(userAuth?.walletAddress);
      console.log("line-71", data);

      if (data?.length) {
        const latestTransactions = data.slice(0, 10).map((tx) => ({
          transactionHash: tx.txHash,
          from: tx.from,
          to: tx.to,
          transaction: `${parseFloat(tx.amount).toFixed(2)} TBTC`,
          date: new Date(parseInt(tx.timestamp) * 1000).toLocaleString(), // Convert UNIX timestamp to readable date
        }));

        setTransactions(latestTransactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  return (
    <>
      {transactions.length > 0 ? (
        <>
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
          <TableLayout data={transactions} column={columns} />
        </>
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
