import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { createPortal } from "react-dom";
import { fetchTokenTransfers, fetchWalletHistory } from "../../lib/utils";
import TransactionDetail from "@/components/Modals/TransactionDetailPop";
import moment from "moment";
import BitcoinTransactionsTab from "./BitcoinTransaction";
import LnbitsTransaction from "./LnbitsTransaction";
import { getUser } from "../../lib/apiCall";
import { DateRange } from "react-date-range";
import SideShiftTransaction from "./SideShiftTransaction";

const RecentTransaction = ({ setSetFilterType }) => {
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
        date: moment(tx.block_timestamp).format("MMMM D, YYYY h:mm A") || "",
        from: tx.from_address || "",
        id: tx.transaction_hash || "",
        rawData: tx,
        status: "confirmed", // You can modify this if you plan to add status checks later
        summary: `${amount || "0"} ${isSend ? "Transfer" : "Receive"}`,
        to: tx.to_address || "",
        transactionHash: tx.transaction_hash || "",
        type: isSend === true ? "send" : "receive",
        day: moment(tx.block_timestamp).format("MMMM D, YYYY h:mm A") || "",
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
          data.result.slice(0, 10)
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

  const tabs = [
    {
      title: "USDC",
      component: (
        <>
          {transactions.length > 0 ? (
            <div className="bg-black/5 lg:p-4 rounded-lg p-3">
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
          <div className="flex items-center gap-3 mb-3 justify-between relative z-[99]">
            <h4 className="m-0 text-xl">Recent Transaction</h4>

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
                  else if (activeTab === 7)
                    dataToExport = sideshiftTxs; // Add this
                  else if (activeTab === 8) dataToExport = withdrawBoltz;
                  else if (activeTab === 9) dataToExport = depositBoltz;

                  if (dataToExport.length) {
                    exportTransactionsToCSV(
                      dataToExport,
                      tabs[activeTab].title + ".csv"
                    );
                  } else {
                    setError("No data available to export.");
                  }
                }}
                className="px-4 py-2 bg-black/50 text-white rounded-md"
              >
                Export CSV
              </button>
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="px-4 py-2 bg-black/50 text-white rounded-md"
                >
                  Filters
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-[200px] bg-white border rounded-md shadow-lg">
                    {tabs.map((item, key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSetFilterType(key);
                          if (key === 0) {
                            // USDC tab
                            fetchRecentTransactions();
                          } else if (key === 2) {
                            // Gold tab
                            fetchRecentTransactionsPaxg();
                          } else if (key === 6) {
                            fetchRecentMorphoTransactions();
                          }
                          setActiveTab(key);
                          setIsOpen(false);
                        }}
                        className="block px-4 text-xs py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="py-2">
            <div className="">{tabs[activeTab].component}</div>
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
