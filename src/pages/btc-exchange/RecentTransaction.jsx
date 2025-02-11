import React, { useEffect, useState } from "react";
import TableLayout from "@/components/TableLayout/index";
import { fetchTokenTransfers } from "../../lib/utils";
import { useSelector } from "react-redux";
import img from "@/Assets/Images/noData.png";
import Image from "next/image";

const RecentTransaction = () => {
  const userAuth = useSelector((state) => state.Auth);
  const [transactions, setTransactions] = useState([]);

  const columns = [
    {
      head: "Transaction Hash",
      accessor: "transactionHash",
      component: (item) => {
        const explorerUrl = `https://sepolia.etherscan.io/tx/${item.transactionHash}`;
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
      head: "Transaction",
      accessor: "transaction",
    },
    {
      head: "Date",
      accessor: "date",
    },
  ];

  useEffect(() => {
    if (userAuth?.walletAddress) {
      const fetchData = async () => {
        try {
          const balance = await fetchTokenTransfers(
            [
              process.env.NEXT_PUBLIC_THRESHOLD_TBTC_CONTRACT_ADDRESS,
              process.env.NEXT_PUBLIC_THUSD_CONTRACT_ADDRESS,
            ],
            userAuth.walletAddress
          );

          if (balance?.result?.length) {
            const latestTransactions = balance.result
              .slice(0, 10)
              .map((tx) => ({
                transactionHash: tx.transaction_hash,
                transaction: `${parseFloat(tx.value_decimal).toFixed(2)} ${
                  tx.token_symbol
                }`,
                date: new Date(tx.block_timestamp).toLocaleString(),
              }));

            setTransactions(latestTransactions);
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      };

      fetchData();
    }
  }, [userAuth?.walletAddress]);

  return (
    <>
      {transactions.length > 0 ? (
        <TableLayout data={transactions} column={columns} />
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
