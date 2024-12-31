import React from "react";
import styled from "styled-components";
import TableLayout from "../../components/TableLayout";

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
        <p
          className={`${
            item.Transaction?.includes("Received")
              ? "themeClr"
              : item.Transaction?.includes("Sent")
              ? "text-danger"
              : ""
          } status d-inline-flex m-0 rounded-pill px-3 text-capitalize py-1 fw-sbold`}
        >
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
      {/* <TableLayout data={data} column={column} /> */}
    </>
  );
};

export default RecentTransaction;
