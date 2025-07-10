import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { createPortal } from "react-dom";
import { fetchTokenTransfers, fetchWalletHistory } from "../../lib/utils";
import TransactionDetail from "@/components/Modals/TransactionDetailPop";
import moment from "moment-timezone";
import BitcoinTransactionsTab from "./BitcoinTransaction";
import LnbitsTransaction from "./LnbitsTransaction";
import { getUser } from "../../lib/apiCall";
import { DateRange } from "react-date-range";
import SideShiftTransaction from "./SideShiftTransaction";
import styled from "styled-components";
import { getCurrentUserTimezone } from "@/utils/bitcoinTransaction";

const RecentTransaction = ({ setSetFilterType }) => {
  const userTimezone = getCurrentUserTimezone();
  // const userTimezone = "America/New_York";
  const userAuth = useSelector((state) => state.Auth);
  const [transactions, setTransactions] = useState([]);
  const [morphotransactions, setMorphoTransactions] = useState([]);
  const [useData, setUserData] = useState();

  const [transactionsPaxg, setTransactionsPaxg] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(5);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [btcTransactions, setBtcTransactions] = useState([]);
  const [lnbitsUsdTxs, setLnbitsUsdTxs] = useState([]);
  const [spendTxs, setSpendTxs] = useState([]);
  const [lnbitsBtcTxs, setLnbitsBtcTxs] = useState([]);
  const [lnbitWallet1, setLnbitWallet1] = useState("");
  const [lnbitWallet2, setLnbitWallet2] = useState("");
  const [spendWallet, setSpendWallet] = useState("");
  const [applyTrue, setApplyTrue] = useState(false);
  const [sideshiftTxs, setSideshiftTxs] = useState([]);
  const [selectedItem, setSelectedItem] = useState("10");
  const [error, setError] = useState("");
  const [withdrawBoltz, setWithdrawBoltz] = useState([]);
  const [depositBoltz, setDepositBoltz] = useState([]);
  const [boltzUSDC, setBoltzUSDC] = useState([]);
  const [boltzBitcoin, setBoltzBitcoin] = useState([]);

  const selectOptions = [
    { value: "", label: "Select an option" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [transactionType, setTransactionType] = useState("all");

  // Function to format dates for API requests
  const formatDateForApi = (date) => {
    if (!date) return null;
    return moment(date).format("YYYY-MM-DD");
  };

  // Check if date filter is active
  const isDateFilterActive = () => {
    return dateRange[0].startDate && dateRange[0].endDate;
  };

  // Clear date filter function
  const clearDateFilter = () => {
    setDateRange([
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ]);
    // Refetch transactions without date filter
    fetchRecentTransactions();
    fetchRecentTransactionsPaxg();
  };

  const formatWalletHistoryData = (txs) => {
    if (!txs?.length) return [];

    return txs.map((tx) => {
      // const amount = `${tx.value_decimal} ${tx.token_symbol}` || "";
      const decimals =
        tx.token_symbol === "USDC" ? 2 : tx.token_symbol === "XAUt" ? 6 : 2;

      const amount = `${parseFloat(tx.value_decimal).toFixed(decimals)} ${tx.token_symbol}`;
      const isSend =
        tx.from_address?.toLowerCase() ===
        userAuth?.walletAddress?.toLowerCase();
      return {
        amount,
        category: tx.token_symbol || "USDC",
        date:
          moment(tx.block_timestamp)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
        from: tx.from_address || "",
        id: tx.transaction_hash || "",
        rawData: tx,
        status: "confirmed", // You can modify this if you plan to add status checks later
        summary: `${amount || "0"} ${isSend ? "Transfer" : "Receive"}`,
        to: tx.to_address || "",
        transactionHash: tx.transaction_hash || "",
        type: isSend === true ? "send" : "receive",
        day:
          moment(tx.block_timestamp)
            .tz(userTimezone)
            .format("MMMM D, YYYY h:mm A z") || "",
      };
    });
  };

  const fetchRecentTransactions = async () => {
    try {
      setTransactionType("all");

      const startDate = isDateFilterActive()
        ? formatDateForApi(dateRange[0].startDate)
        : null;
      const endDate = isDateFilterActive()
        ? formatDateForApi(dateRange[0].endDate)
        : null;

      const data = await fetchTokenTransfers(
        process.env.NEXT_PUBLIC_ENV_CHAIN,
        [process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS],
        // "0xBf3473aa4728E6b71495b07f57Ec247446c7E0Ed",
        userAuth?.walletAddress,
        startDate,
        endDate
      );

      setTransactions(data?.result);
      if (data?.result?.length) {
        const formattedTransactions = formatWalletHistoryData(
          data.result.slice(0, 100)
        );
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchRecentMorphoTransactions = async () => {
    try {
      const startDate = isDateFilterActive()
        ? formatDateForApi(dateRange[0].startDate)
        : null;
      const endDate = isDateFilterActive()
        ? formatDateForApi(dateRange[0].endDate)
        : null;

      const data = await fetchTokenTransfers(
        process.env.NEXT_PUBLIC_ENV_CHAIN,
        [process.env.NEXT_PUBLIC_MORPHO_CONTRACT_ADDRESS],
        // "0xBf3473aa4728E6b71495b07f57Ec247446c7E0Ed",
        userAuth?.walletAddress,
        startDate,
        endDate
      );

      setMorphoTransactions(data?.result);
      if (data?.result?.length) {
        const formattedTransactions = formatWalletHistoryData(
          data.result.slice(0, 10)
        );
        setMorphoTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchRecentTransactionsPaxg = async () => {
    try {
      setTransactionType("all");

      const startDate = isDateFilterActive()
        ? formatDateForApi(dateRange[0].startDate)
        : null;
      const endDate = isDateFilterActive()
        ? formatDateForApi(dateRange[0].endDate)
        : null;

      const data = await fetchTokenTransfers(
        process.env.NEXT_PUBLIC_ENV_ETHERCHAIN_PAXG,
        [process.env.NEXT_PUBLIC_ENV_ETHERCHAIN_TETHER_GOLD_ADDRESS],
        // "0x0d8b79e9f0EC1ad55210E45CcC137CD1506B3Aab",
        userAuth?.walletAddress,
        startDate,
        endDate
      );

      setTransactionsPaxg(data?.result);
      if (data?.result?.length) {
        const formattedTransactions = formatWalletHistoryData(
          data.result.slice(0, 10)
        );
        setTransactionsPaxg(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
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

  const transactionsByDate = groupTransactionsByDate(transactions);
  const transactionsByDatePaxg = groupTransactionsByDate(transactionsPaxg);

  const transactionsByDateMorpho = groupTransactionsByDate(morphotransactions);

  // Handle date range selection
  const handleDateRangeChange = (item) => {
    setDateRange([item.selection]);
    // Don't close the date picker automatically - let user apply the filter
  };

  // Apply date filter button action
  const applyDateFilter = () => {
    setApplyTrue(true);
    if (isDateFilterActive()) {
      // Only fetch if on USDC or Gold tabs
      if (activeTab === 0) {
        fetchRecentTransactions();
      }
      if (activeTab === 2) {
        fetchRecentTransactionsPaxg();
      }
      if (activeTab === 6) {
        fetchRecentMorphoTransactions();
      }
      setIsDatePickerOpen(false);
    } else {
      setError("Please select both start and end dates.");
    }
  };

  useEffect(() => {
    const data = async () => {
      let userExist = await getUser(userAuth.email);
      setUserData(userExist);
      setLnbitWallet1(userExist?.userId?.lnbitWalletId || "");
      setLnbitWallet2(userExist?.userId?.lnbitWalletId_2 || "");
      setSpendWallet(userExist?.userId?.lnbitWalletId_3 || "");
    };
    data();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".filter-dropdown")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const tabs = [
    {
      title: "USDC",
      component: (
        <>
          {transactions.length > 0 ? (
            <div className="bg-black/5 lg:p-4 rounded-lg p-3 ">
              {Object.entries(transactionsByDate).map(([date, txs]) => {
                return (
                  <div key={date} className="py-3">
                    <p className="m-0 text-white text-xs font-semibold pb-2">
                      {date}
                    </p>
                    <div className="grid gap-3 grid-cols-12">
                      {/* {txs.map((tx, key) => ( */}
                      {txs
                        .filter((tx) => {
                          const amount = parseFloat(
                            tx.amount?.split(" ")[0] || 0
                          );
                          return amount >= 0.01;
                        })
                        .map((tx, key) => (
                          <div key={key} className="md:col-span-6 col-span-12">
                            <div
                              onClick={() => handleTransactionClick(tx)}
                              className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60"
                            >
                              <div className="left flex items-start gap-2">
                                <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                                  {tx.type === "send" ? sendSvg : receiveSvg}
                                </div>
                                <div className="content">
                                  <h4 className="m-0 font-bold md:text-base">
                                    {tx.isRedemption
                                      ? "Redemption"
                                      : tx.isDeposit
                                        ? "Deposit"
                                        : tx?.type === "send"
                                          ? "Send"
                                          : "Receive"}{" "}
                                    {tx.amount?.split(" ")[1] || "ETH"}
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
                              <div className="right text-right">
                                <p className="m-0  text-xs font-medium py-1">
                                  {tx.status === "rejected"
                                    ? "Insufficient Balance"
                                    : `${tx?.type === "send" ? "-" : "+"} ${parseFloat(
                                        tx.amount
                                      ).toFixed(2)}`}
                                </p>
                                <p className="m-0 text-xs font-medium py-1">
                                  {tx.day}
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
      ),
    },
    {
      title: "BTC",
      component: (
        <BitcoinTransactionsTab
          setTransactions={setBtcTransactions}
          dateRange={isDateFilterActive() ? dateRange[0] : null}
          applyTrue={applyTrue}
          selectedItem={selectedItem}
        />
      ),
    },
    {
      title: "Gold",
      component: (
        <>
          {transactionsPaxg.length > 0 ? (
            <div className="bg-black/5 lg:p-4 rounded-lg p-3">
              {Object.entries(transactionsByDatePaxg).map(([date, txs]) => {
                return (
                  <div key={date} className="py-3">
                    <p className="m-0 text-white text-xs font-semibold pb-2">
                      {date}
                    </p>
                    <div className="grid gap-3 grid-cols-12">
                      {/* {txs.map((tx, key) => ( */}
                      {txs
                        .filter((tx) => {
                          const amount = parseFloat(
                            tx.amount?.split(" ")[0] || 0
                          );
                          return amount >= 0.000001;
                        })
                        .map((tx, key) => (
                          <div key={key} className="md:col-span-6 col-span-12">
                            <div
                              onClick={() => handleTransactionClick(tx)}
                              className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60"
                            >
                              <div className="left flex items-start gap-2">
                                <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                                  {tx.type === "send" ? sendSvg : receiveSvg}
                                </div>
                                <div className="content">
                                  <h4 className="m-0 font-bold md:text-base">
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
                                    )} font-medium text-xs`}
                                  >
                                    {getStatusText(tx.status)}
                                  </p>
                                </div>
                              </div>
                              <div className="right text-right">
                                <p className="m-0  text-xs font-medium py-1">
                                  {tx.status === "rejected"
                                    ? "Insufficient Balance"
                                    : `${tx.type === "send" ? "-" : "+"} ${parseFloat(
                                        tx.amount
                                      ).toFixed(6)}`}
                                </p>
                                <p className="m-0 text-xs font-medium py-1">
                                  {tx.day}
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
      ),
    },
    {
      title: "Lightning TPOS USDC",
      component: (
        <LnbitsTransaction
          usd={0}
          setTransactions={setLnbitsUsdTxs}
          walletIdd={lnbitWallet1}
          dateRange={isDateFilterActive() ? dateRange[0] : null}
          applyTrue={applyTrue}
        />
      ),
    },
    {
      title: "Lightning TPOS Bitcoin",
      component: (
        <LnbitsTransaction
          usd={1}
          setTransactions={setLnbitsBtcTxs}
          walletIdd={lnbitWallet2}
          dateRange={isDateFilterActive() ? dateRange[0] : null}
          applyTrue={applyTrue}
        />
      ),
    },
    {
      title: "Lightning Spend",
      component: spendWallet ? (
        <LnbitsTransaction
          usd={2}
          setTransactions={setSpendTxs}
          walletIdd={spendWallet}
          dateRange={isDateFilterActive() ? dateRange[0] : null}
          applyTrue={applyTrue}
        />
      ) : (
        <div className="text-center py-4">
          <p>Loading wallet information...</p>
        </div>
      ),
    },
    {
      title: "Spark USDC",
      component: (
        <>
          {morphotransactions.length > 0 ? (
            <div className="bg-black/5 lg:p-4 rounded-lg p-3">
              {Object.entries(transactionsByDateMorpho).map(([date, txs]) => {
                return (
                  <div key={date} className="py-3">
                    <p className="m-0 text-white text-xs font-semibold pb-2">
                      {date}
                    </p>
                    <div className="grid gap-3 grid-cols-12">
                      {/* {txs.map((tx, key) => ( */}
                      {txs
                        .filter((tx) => {
                          const amount = parseFloat(
                            tx.amount?.split(" ")[0] || 0
                          );
                          return amount >= 0.01;
                        })
                        .map((tx, key) => (
                          <div key={key} className="md:col-span-6 col-span-12">
                            <div
                              onClick={() => handleTransactionClick(tx)}
                              className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60"
                            >
                              <div className="left flex items-start gap-2">
                                <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                                  {tx.type === "send" ? sendSvg : receiveSvg}
                                </div>
                                <div className="content">
                                  <h4 className="m-0 font-bold md:text-base">
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
                                    )} font-medium text-xs`}
                                  >
                                    {getStatusText(tx.status)}
                                  </p>
                                </div>
                              </div>
                              <div className="right text-right">
                                <p className="m-0  text-xs font-medium py-1">
                                  {tx.status === "rejected"
                                    ? "Insufficient Balance"
                                    : `${tx.type === "send" ? "-" : "+"} ${parseFloat(
                                        tx.amount
                                      ).toFixed(2)}`}
                                </p>
                                <p className="m-0 text-xs font-medium py-1">
                                  {tx.day}
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
      ),
    },
    {
      title: "SideShift",
      component: (
        <SideShiftTransaction
          userData={useData} // Make sure this contains sideshiftIds
          setTransactions={setSideshiftTxs}
          dateRange={isDateFilterActive() ? dateRange[0] : null}
          applyTrue={applyTrue}
        />
      ),
    },
    {
      title: "Boltz Lightning Withdraw",
      component: (
        <LnbitsTransaction usd={3} setTransactions={setWithdrawBoltz} />
      ),
    },
    {
      title: "Boltz Lightning Deposit",
      component: (
        <LnbitsTransaction usd={4} setTransactions={setDepositBoltz} />
      ),
    },
    {
      title: "Boltz Lightning TPOS USDC",
      component: <LnbitsTransaction usd={5} setTransactions={setBoltzUSDC} />,
    },
    {
      title: "Boltz Lightning TPOS Bitcoin",
      component: (
        <LnbitsTransaction usd={6} setTransactions={setBoltzBitcoin} />
      ),
    },
  ];

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

      {isDatePickerOpen && (
        <div className="absolute right-0 mt-2 z-[100] bg-white shadow-lg rounded-lg">
          <DateRange
            editableDateInputs={true}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            months={1}
            direction="horizontal"
            preventSnapRefocus={true}
            calendarFocus="backwards"
          />
          <div className="flex justify-between p-3 border-t">
            <button
              onClick={() => {
                clearDateFilter();
                setIsDatePickerOpen(false);
                setApplyTrue(false);
              }}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded"
            >
              Clear
            </button>
            <button
              onClick={applyDateFilter}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Apply Filter
            </button>
          </div>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </div>
      )}

      {userAuth?.walletAddress ? (
        <>
          <div className="flex items-center gap-3 mb-3 justify-between relative z-[99] flex-wrap">
            <div className="left">
              <h4 className="m-0 text-xl">Recent Transactions</h4>
              <p className="m-0 text-white flex items-center gap-2">
                <span className="themeClr">{clockIcn}</span>
                {userTimezone}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative">
                {activeTab === 1 ? (
                  // Select dropdown for when activeTab is 1
                  <div className="relative">
                    <select
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      className="px-4 py-2 bg-black/50 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none min-w-[200px] appearance-none cursor-pointer"
                    >
                      {selectOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-gray-800 text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Custom dropdown arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {/* Show selected value indicator */}
                    {/* {selectedItem && (
                      <div className="absolute left-0 right-0 text-center text-xs text-white mt-1">
                        Selected:{" "}
                        {
                          selectOptions.find(
                            (opt) => opt.value === selectedItem
                          )?.label
                        }
                        <button
                          onClick={() => setSelectedItem("")}
                          className="ml-2 text-xs text-red-300 hover:text-red-100"
                        >
                          ✕
                        </button>
                      </div>
                    )} */}
                  </div>
                ) : (
                  // Your existing date filter button for other tabs
                  <>
                    <button
                      onClick={() => {
                        setIsDatePickerOpen(!isDatePickerOpen);
                        setApplyTrue(false);
                      }}
                      className={`px-4 py-2 ${
                        isDateFilterActive() ? "bg-blue-600" : "bg-black/50"
                      } text-white rounded-md flex items-center gap-2`}
                    >
                      <span>{DateFilter}</span>
                      {isDateFilterActive() && (
                        <span className="text-xs bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </button>

                    {isDateFilterActive() && !isDatePickerOpen && (
                      <div className="absolute left-0 right-0 text-center text-xs text-white mt-1">
                        {formatDateForApi(dateRange[0].startDate)} to{" "}
                        {formatDateForApi(dateRange[0].endDate)}
                        <button
                          onClick={clearDateFilter}
                          className="ml-2 text-xs text-red-300 hover:text-red-100"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  let dataToExport = [];

                  if (activeTab === 0) dataToExport = transactions;
                  else if (activeTab === 1) dataToExport = btcTransactions;
                  else if (activeTab === 2) dataToExport = transactionsPaxg;
                  else if (activeTab === 3) dataToExport = lnbitsUsdTxs;
                  else if (activeTab === 4) dataToExport = lnbitsBtcTxs;
                  else if (activeTab === 5) dataToExport = spendTxs;
                  else if (activeTab === 6) dataToExport = morphotransactions;
                  else if (activeTab === 7) dataToExport = sideshiftTxs;
                  else if (activeTab === 8) dataToExport = withdrawBoltz;
                  else if (activeTab === 9) dataToExport = depositBoltz;
                  else if (activeTab === 10) dataToExport = boltzUSDC;
                  else if (activeTab === 11) dataToExport = boltzBitcoin;
                  if (dataToExport.length) {
                    exportTransactionsToCSV(
                      dataToExport,
                      tabs[activeTab].title + ".csv"
                    );
                  } else {
                    setError("No data available to export.");
                  }
                }}
                className="px-4 py-2 bg-black/50 text-white rounded-md text-xs h-[40px]"
              >
                Export CSV
              </button>
              <div className="relative inline-block text-left filter-dropdown">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="px-4 py-2 bg-black/50 text-white rounded-md text-xs h-[40px] flex items-center gap-2"
                >
                  <span>Filters</span>
                  {/* <span>Filters: {tabs[activeTab].title}</span> */}
                  <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-[200px] bg-white border rounded-md shadow-lg">
                    {tabs.map((item, key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setIsOpen(false); // Close dropdown first
                          setSetFilterType(key);
                          setActiveTab(key);

                          // Then handle the API calls
                          if (key === 0) {
                            // USDC tab
                            fetchRecentTransactions();
                          } else if (key === 2) {
                            // Gold tab
                            fetchRecentTransactionsPaxg();
                          } else if (key === 6) {
                            fetchRecentMorphoTransactions();
                          }
                        }}
                        className={`block px-4 text-xs py-2 w-full text-left flex items-center justify-between ${
                          activeTab === key
                            ? "bg-[#df723b]/20 themeClr"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{item.title}</span>
                        {activeTab === key && (
                          <span className="themeClr">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="py-2">
            <TabContent className="overflow-scroll md:max-h-[calc(100vh-240px)] scrollbar-none">
              {tabs[activeTab].component}
            </TabContent>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </>
  );
};

const TabContent = styled.div`
  &::-webkit-scrollbar {
    display: none;
  }
`;

export default RecentTransaction;

const exportTransactionsToCSV = (data, fileName = "transactions.csv") => {
  if (!data?.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) =>
      typeof row[header] === "string" ? `"${row[header]}"` : row[header]
    )
  );

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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

const DateFilter = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12V4M19 20V17M5 20V16M19 13V4M12 7V4M12 20V11"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <path
      d="M5 16C6.10457 16 7 15.1046 7 14C7 12.8954 6.10457 12 5 12C3.89543 12 3 12.8954 3 14C3 15.1046 3.89543 16 5 16Z"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <path
      d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <path
      d="M19 17C20.1046 17 21 16.1046 21 15C21 13.8954 20.1046 13 19 13C17.8954 13 17 13.8954 17 15C17 16.1046 17.8954 17 19 17Z"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);

const clockIcn = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0ZM10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2ZM10 4C10.2449 4.00003 10.4813 4.08996 10.6644 4.25272C10.8474 4.41547 10.9643 4.63975 10.993 4.883L11 5V9.586L13.707 12.293C13.8863 12.473 13.9905 12.7144 13.9982 12.9684C14.006 13.2223 13.9168 13.4697 13.7488 13.6603C13.5807 13.8508 13.3464 13.9703 13.0935 13.9944C12.8406 14.0185 12.588 13.9454 12.387 13.79L12.293 13.707L9.293 10.707C9.13758 10.5514 9.03776 10.349 9.009 10.131L9 10V5C9 4.73478 9.10536 4.48043 9.29289 4.29289C9.48043 4.10536 9.73478 4 10 4Z"
      fill="currentColor"
    />
  </svg>
);
