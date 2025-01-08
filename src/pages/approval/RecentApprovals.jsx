import React from "react";
import TableLayout from "@/components/TableLayout/index";
import styled from "styled-components";
import img from "@/Assets/Images/user.png";

const RecentApprovals = () => {
  const column = [
    {
      head: "Transaction Type",
      accessor: "Type",
    },
    {
      head: "Amount",
      accessor: "Amount",
      isComponent: true,
      component: (item, ind) => (
        <p
          className={` d-inline-flex m-0 rounded-pill text-capitalize py-1 fw-sbold`}
        >
          {item.Amount}
        </p>
      ),
    },
    {
      head: "Status",
      accessor: "Status",
      isComponent: true,
      component: (item, ind) => (
        <p
          className={`${
            item.Status?.includes("Pending")
              ? "redStatus"
              : item.Status?.includes("Success")
              ? "greenStatus"
              : ""
          } status d-inline-flex m-0 rounded-pill px-3 text-capitalize fw-sbold`}
        >
          {item.Status}
        </p>
      ),
    },
  ];
  const data = [
    {
      Type: "Sign to Send",
      Amount: "0.012 BTC",
      Status: "Pending",
    },
    {
      Type: "Recieved",
      Amount: "0.012 BTC",
      Status: "Success",
    },
    {
      Type: "Sign to Send",
      Amount: "0.012 BTC",
      Status: "Pending",
    },
    {
      Type: "Recieved",
      Amount: "0.012 BTC",
      Status: "Success",
    },
  ];
  return (
    <>
      <div className="shadow-sm rounded">
        <TableLayout data={data} column={column} />
      </div>
    </>
  );
};

export default RecentApprovals;
