import React from "react";
import TableLayout from "@/components/TableLayout/index";
import styled from "styled-components";

const RecentTransaction = () => {
  const column = [
    {
      head: "Transaction ID",
      accessor: "ID",
    },
    {
      head: "Transaction",
      accessor: "Transaction",
      isComponent: true,
      component: (item, ind) => (
        <p className={`  inline-flex m-0 rounded-20 text-capitalize`}>
          {item.Transaction}
        </p>
      ),
    },
    {
      head: "Date",
      accessor: "Date",
    },
  ];
  const data = [
    {
      ID: "txHarshxqdfsdfq345324",
      Transaction: "Sent 0.012 BTC",
      Date: "Oct 21, 2023",
    },
    {
      ID: "txHarshxqdfsdfq345324",
      Transaction: "Recived 0.012 BTC",
      Date: "Oct 21, 2023",
    },
  ];
  return (
    <>
      <TableLayout data={data} column={column} />
    </>
  );
};

export default RecentTransaction;
