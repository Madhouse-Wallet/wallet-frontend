import React, { useEffect, useState } from "react";
import TableLayout from "@/components/TableLayout/index";
import { useSelector } from "react-redux";
import img from "@/Assets/Images/noData.png";
import Image from "next/image";

const RecentTransaction = ({transactions}) => {
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


  return (
    <>
      {transactions.length > 0 ? (
        <>
          <div className="flex items-center gap-3 mb-3 justify-between relative z-[99]">
            <h4 className="m-0 text-xl">Recent Transaction</h4>
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
