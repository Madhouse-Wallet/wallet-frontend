import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import styled from "styled-components";
import { fetchUserData } from "../../utils/fetchUserData";
import { useSelector } from "react-redux";

const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - parseInt(timestamp);
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m ago`;
};

const formatAmount = (amount) => {
  if (!amount) return "0";
  return (parseFloat(amount) / 100000000).toFixed(7);
};

const InternalTab = () => {
  const userAuth = useSelector((state) => state.Auth);

  const [expandedRow, setExpandedRow] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [activeView, setActiveView] = useState("depositor");

  const deposits = data?.deposits || [];
  const redemptions = data?.redemptions || [];

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const userDatata = async () => {
    const userData = await fetchUserData(
      "0x8c6cab694f252933c89422c336dd01eae4e5f25b"
      // "0xc96b4e2729556b7e24bd6d1de7df8f98a3f23605"
      // userAuth?.walletAddress
    );
    setData(userData);
  };

  useEffect(() => {
    if(!userAuth?.walletAddress){
      return
    }
    userDatata();
  }, [userAuth?.walletAddress]);

  const formatReceivedAmount = (amount, treasuryFee) => {
    if (!amount || !treasuryFee) return "0";
    const total = parseFloat(amount) - parseFloat(treasuryFee);
    return formatAmount(total.toString());
  };

  const getStatus = (item) => {
    if (activeView === "redeemer") {
      return item.completedTxHash ? "COMPLETED" : item.status;
    }
    return item.status;
  };

  const TxLink = ({ hash }) => {
    if (!hash) return "--";
    return (
      <a 
        href={`https://blockstream.info/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 underline"
        onClick={(e) => e.stopPropagation()}
      >
        {formatAddress(hash)}
      </a>
    );
  };

  const EtherscanLink = ({ address }) => {
    if (!address) return "--";
    return (
      <a 
        href={`https://etherscan.io/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 underline"
        onClick={(e) => e.stopPropagation()}
      >
        {formatAddress(address)}
      </a>
    );
  };


  const getExpandedContent = (item) => {
    if (activeView === "redeemer") {
      return (
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-5">
            <TimeLine className="list-none pl-0 mb-0">
              {item.transactions.map((tx, idx) => (
                <li
                  key={tx.txHash}
                  className="py-1 flex items-start relative gap-2"
                >
                  <span>{formatTimestamp(tx.timestamp)}</span>
                  <div className="line relative">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        idx === 0 ? "bg-[#6050dc]" : "bg-[#f1c40f]"
                      } flex-shrink-0`}
                    ></div>
                  </div>
                  <div>
                    <h6 className="font-bold themeClr">{tx.description}</h6>
                    by{" "}
                     <EtherscanLink address={tx.from} />
                  </div>
                </li>
              ))}
            </TimeLine>
          </div>
          <div className="col-span-3">
            <ul className="list-none pl-0 mb-0">
              <li className="py-1">Redeem key</li>
              <li className="py-1">Wallet Pub KeyHash</li>
              <li className="py-1">Output Script</li>
              <li className="py-1">Redemption txHash</li>
              <li className="py-1">TreasuryFee</li>
              <li className="py-1">TxMaxFee</li>
              <li className="py-1">Redeem Timestamp</li>
            </ul>
          </div>
          <div className="col-span-4">
            <ul className="list-none pl-0 mb-0">
              <li className="py-1">{formatAddress(item.id)}</li>
              <li className="py-1">{formatAddress(item.walletPubKeyHash)}</li>
              <li className="py-1">
                {formatAddress(item.redeemerOutputScript)}
              </li>
              <li className="py-1">
                <TxLink hash={item.completedTxHash} />
              </li>
              <li className="py-1">{formatAmount(item.treasuryFee)}</li>
              <li className="py-1">{formatAmount(item.txMaxFee)} BTC</li>
              <li className="py-1">
                {formatTimestamp(item.redemptionTimestamp)}
              </li>
            </ul>
          </div>
        </div>
      );
    }

    // Original deposit expanded content
    return (
      <div className="grid gap-3 grid-cols-12">
        <div className="col-span-5">
          <TimeLine className="list-none pl-0 mb-0">
            {item.transactions.map((tx, idx) => (
              <li
                key={tx.txHash}
                className="py-1 flex items-start relative gap-2"
              >
                <span>{formatTimestamp(tx.timestamp)}</span>
                <div className="line relative">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      idx === 0
                        ? "bg-[#6050dc]"
                        : idx === 1
                        ? "bg-[#f1c40f]"
                        : "bg-[#3498db]"
                    } flex-shrink-0`}
                  ></div>
                </div>
                <div>
                  <h6 className="font-bold themeClr">{tx.description}</h6>
                  by{" "}
                  <EtherscanLink address={tx.from} />
                </div>
              </li>
            ))}
          </TimeLine>
        </div>
        <div className="col-span-3">
          <ul className="list-none pl-0 mb-0">
            <li className="py-1">Deposit key</li>
            <li className="py-1">Wallet Pub KeyHash</li>
            <li className="py-1">Funding TxHash</li>
            <li className="py-1">Funding Output Index</li>
            <li className="py-1">Blinding Factor</li>
            <li className="py-1">Refund Pub KeyHash</li>
            <li className="py-1">Refund Locktime</li>
            <li className="py-1">Vault</li>
          </ul>
        </div>
        <div className="col-span-4">
          <ul className="list-none pl-0 mb-0">
            <li className="py-1">{formatAddress(item.id)}</li>
            <li className="py-1">{formatAddress(item.walletPubKeyHash)}</li>
            <li className="py-1">
              <TxLink hash={item.fundingTxHash} />
            </li>
            <li className="py-1">{item.fundingOutputIndex}</li>
            <li className="py-1">{item.blindingFactor}</li>
            <li className="py-1">{formatAddress(item.refundPubKeyHash)}</li>
            <li className="py-1">{item.refundLocktime}</li>
            <li className="py-1">{formatAddress(item.vault)}</li>
          </ul>
        </div>
      </div>
    );
  };

  const activeData = activeView === "depositor" ? deposits : redemptions;

  return (
    <>
       <TabNav className="list-none pl-0 mb-0 flex items-center gap-3 mb-3">
        {/* {tabData.map((item, index) => ( */}
        <li className="">
          <button
            onClick={() => setActiveView("depositor")}
            className={` ${
              activeView === "depositor"
                ? "bg-[#ffad84] border-[#ffad84]"
                : "bg-white border-white"
            }  flex w-full h-[42px]  border-2 text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50
             // Highlight active tab
              `}
          >
            Deposit
          </button>
        </li>
        <li className="">
          <button
            onClick={() => setActiveView("redeemer")}
            className={` ${
              activeView === "redeemer"
                ? "bg-[#ffad84] border-[#ffad84]"
                : "bg-white border-white"
            }  flex w-full h-[42px]  border-2 text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50
           // Highlight active tab
            `}
          >
            Redeem
          </button>
        </li>
      </TabNav>
      <div className="overflow-auto">
        <TableC className="divide-white/6 bg-white/5 w-full caption-bottom text-sm divide-y rounded-12">
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="bg-black/5 px-4 text-left font-semibold border-0">
                Updated
              </TableHead>
              <TableHead className="bg-black/5 px-4 text-left font-semibold border-0">
                {activeView === "depositor" ? "Depositor" : "Redeemer"}
              </TableHead>
              <TableHead className="bg-black/5 px-4 text-left font-semibold border-0">
                Amount Request
              </TableHead>
              <TableHead className="bg-black/5 px-4 text-left font-semibold border-0">
                Amount Received
              </TableHead>
              <TableHead className="bg-black/5 px-4 text-left font-semibold border-0">
                Current State
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeData.length > 0 ? (
              activeData.map((item) => (
                <React.Fragment key={item.id}>
                  <TableRow
                    className={`${
                      expandedRow === item.id ? "bg-white/5" : ""
                    } border-0 cursor-pointer`}
                    onClick={() => toggleRow(item.id)}
                  >
                    <TableCell className="h-10 p-2 px-4 text-left align-middle font-normal">
                      {formatTimestamp(item.updateTimestamp)}
                    </TableCell>
                    <TableCell className="h-10 p-2 px-4 text-left align-middle font-normal">
                      {formatAddress(item.user.id)}
                    </TableCell>
                    <TableCell className="h-10 p-2 px-4 text-left align-middle font-normal">
                      {formatAmount(item.amount)}
                    </TableCell>
                    <TableCell className="h-10 p-2 px-4 text-left align-middle font-normal">
                      {formatReceivedAmount(item.amount, item.treasuryFee)}
                    </TableCell>
                    <TableCell
                      className={`h-10 p-2 px-4 text-left align-middle font-normal ${
                        getStatus(item) === "COMPLETED" ? "text-green-500" : ""
                      }`}
                    >
                      {getStatus(item)}
                    </TableCell>
                  </TableRow>

                  {expandedRow === item.id && (
                    <TableRow className="border-0 bg-black/5 border-t border-black/10">
                      <TableCell colSpan={5} className="p-4">
                        {getExpandedContent(item)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p className="text-lg font-medium">
                      No {activeView} data available
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableC>
      </div>
    </>
  )
}


const TabNav = styled.div`
  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 8px;
    li {
      width: 48%;
      button {
        font-size: 10px;
        height: 35px;
      }
    }
  }
`;
const TimeLine = styled.ul`
  li:not(:last-child) {
    .line {
      height: 70px;
      z-index: 9;
      &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        margin: 0 auto;
        background: #878787;
        width: 1px;
        height: calc(100% - 20px);
        top: 63%;
        transform: translateY(-50%);
        z-index: -1;
      }
    }
  }
`;

const TableC = styled(Table)`
  th,
  td {
    padding: 10px 15px;
    font-size: 12px;
    line-height: 20px;
    max-width: 200px;
    min-width: 120px;
    vertical-align: middle;
    border: 0;
    box-shadow: unset !important;
  }
  thead {
    tr > th:first-child {
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
    tr > th:last-child {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }
    tr {
      border-bottom: 0 !important;
    }
    th {
      font-weight: 400;
      white-space: nowrap;
      color: var(--textColor);
    }
  }
  tbody {
    tr {
      transition: 0.4s;
    }
    td {
      padding: 20px 15px;
      font-weight: 400;
      border: 0;
    }
  }
`;


export default InternalTab