import React, { useState } from "react";
import Sidebar from "./Sidebar";
import AddBankDetail from "./AddBankDetail";
import TransferHistory from "./TransferHistory";

const TabbedComponent = ({ customerId, step, setStep }) => {
  const [tab, setTab] = useState(0);

  const tabData = [
    {
      icn: bankIcn,
      title: "My Accounts",
      components: (
        <>
          <AddBankDetail
            step={step}
            setStep={setStep}
            customerId={customerId}
          />
        </>
      ),
    },
    {
      icn: transferIcn,
      title: "Transfer History",
      components: (
        <>
          <TransferHistory
            step={step}
            setStep={setStep}
            customerId={customerId}
          />
        </>
      ),
    },
  ];
  return (
    <>
      <div className="px-3">
        <div className="grid gap-3 grid-cols-12 pr-3 bg-black/50 rounded-20">
          <div className="md:col-span-4 col-span-12 md:sticky top-0">
            <Sidebar tabData={tabData} tab={tab} setTab={setTab} />
          </div>
          <div className="md:col-span-8 col-span-12 ">
            <div
              className="formWrpper h-[calc(100vh-200px)] overflow-auto  p-5 md:p-8"
              style={{ scrollbarWidth: "none" }}
            >
              {tabData[tab].components}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TabbedComponent;

const bankIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 8V12.001H3V18H2V21H18L21 21.001L22 21V18H21V12.001H22V8L12 2L2 8ZM6 18V12.001H8V18H6ZM11 18V12.001H13V18H11ZM18 18H16V12.001H18V18ZM14 8C13.9999 8.26271 13.9481 8.52283 13.8475 8.76552C13.7469 9.00821 13.5995 9.2287 13.4137 9.41442C13.2279 9.60014 13.0073 9.74744 12.7646 9.84791C12.5219 9.94839 12.2617 10.0001 11.999 10C11.7363 9.99993 11.4762 9.94812 11.2335 9.84753C10.9908 9.74693 10.7703 9.59952 10.5846 9.41371C10.3989 9.2279 10.2516 9.00733 10.1511 8.7646C10.0506 8.52186 9.99893 8.26171 9.999 7.999C9.99913 7.46843 10.21 6.95965 10.5853 6.58458C10.9605 6.20951 11.4694 5.99887 12 5.999C12.5306 5.99913 13.0393 6.21003 13.4144 6.58529C13.7895 6.96055 14.0001 7.46943 14 8Z"
      fill="currentColor"
    />
  </svg>
);

const transferIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 10H4L9.5 4M4 14H20L14.5 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
