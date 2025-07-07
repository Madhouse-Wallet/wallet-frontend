import React, { useEffect, useState } from "react";
import SpherePayAPI from "../api/spherePayApi";
import { filterAmountInput, isValidNumber } from "@/utils/helper";
import {
  calculateGasPriceInUSDC,
  getAccount,
  publicClient,
  sendTransaction,
  usdc,
  USDC_ABI,
} from "@/lib/zeroDev";
import { retrieveSecret } from "@/utils/webauthPrf";
import { useSelector } from "react-redux";
import { getUser, updtUser } from "@/lib/apiCall";
import { parseAbi, parseUnits } from "viem";
import { createPortal } from "react-dom";
import SpherePayTransferDetailPop from "@/components/Modals/SpherePayTransferDetailPopup";

const TransferHistory = ({ step, setStep, customerId }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [spherePayTransfer, setSpherePayTransfer] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [transfers, setTransfers] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [transferData, setTransferData] = useState();
  const [gasPrice, setGasPrice] = useState(null);
  const [gasPriceError, setGasPriceError] = useState("");
  const [balance, setBalance] = useState("0");

  const [onRampForm, setOnRampForm] = useState({
    currency: "usd",
    transferMethod: "",
    bankAccountId: "",
    amount: "",
  });

  const [offRampForm, setOffRampForm] = useState({
    currency: "usd",
    transferMethod: "",
    bankAccountId: "",
    amount: "",
  });

  const currencyOptions = [
    { value: "usd", label: "USD - US Dollar" },
    { value: "eur", label: "EUR - Euro" },
  ];

  const transferMethodOptions = [
    { value: "achPush", label: "ACH Push" },
    { value: "wire", label: "Wire Transfer" },
  ];

  const transferMethodOptionsOfframp = [
    { value: "achSameDay", label: "ACH Same Day" },
    { value: "wire", label: "Wire Transfer" },
  ];

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalance();
    }
  }, [userAuth?.walletAddress]);

  const fetchBalance = async () => {
    try {
      if (!userAuth?.walletAddress) return;

      const senderUsdcBalance = await publicClient.readContract({
        abi: parseAbi([
          "function balanceOf(address account) returns (uint256)",
        ]),
        address: usdc,
        functionName: "balanceOf",
        args: [userAuth?.walletAddress],
      });
      const balance = String(
        Number(BigInt(senderUsdcBalance)) / Number(BigInt(1e6))
      );
      if (balance) {
        setBalance(balance);
      } else {
        setError("Failed to fetch USDC balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Failed to fetch USDC balance");
    }
  };

  const fetchCustomerData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await SpherePayAPI.getCustomer(
        // "customer_80e5b83cddc547ae8e5a167a71ee550b"
        customerId
      );

      if (response && response.data && response.data.customer) {
        setCustomerData(response.data.customer);

        if (
          response.data.customer.bankAccounts &&
          response.data.customer.bankAccounts.length > 0
        ) {
          const accountDetailsPromises =
            response.data.customer.bankAccounts.map((bankAccountId) =>
              SpherePayAPI.getBankAccountDetail(bankAccountId)
            );

          const accountDetailsResponses = await Promise.all(
            accountDetailsPromises
          );

          const bankAccountDetails = accountDetailsResponses
            .map((response) => {
              if (response && response.data && response.data.bankAccount) {
                return response.data.bankAccount;
              }
              return null;
            })
            .filter((account) => account !== null);

          setBankAccounts(bankAccountDetails);
        }
      } else {
        setError("Failed to retrieve customer data");
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setError("An error occurred while fetching data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnRampChange = (e) => {
    const { id, value } = e.target;

    if (id === "amount") {
      const filteredValue = filterAmountInput(value, 2, 20);
      setOnRampForm((prev) => ({ ...prev, [id]: filteredValue }));
    } else {
      setOnRampForm((prev) => ({ ...prev, [id]: value }));
    }

    setError("");
    setSuccessMessage("");
  };

  const handleOffRampChange = (e) => {
    const { id, value } = e.target;
    if (id === "amount") {
      const filteredValue = filterAmountInput(value, 2, 20);
      setOffRampForm((prev) => ({ ...prev, [id]: filteredValue }));
      if (parseFloat(value) > parseFloat(balance)) {
        setError("Insufficient USDC Balance");
        return;
      }
    } else {
      setOffRampForm((prev) => ({ ...prev, [id]: value }));
    }

    setError("");
    setSuccessMessage("");
  };

  const validateOnRampForm = () => {
    if (!onRampForm.currency) return "Please select a currency";
    if (!onRampForm.transferMethod) return "Please select a transfer method";
    if (!onRampForm.bankAccountId) return "Please select a bank account";
    if (!onRampForm.amount || onRampForm.amount <= 0)
      return "Please enter a valid amount";
    return null;
  };

  const validateOffRampForm = () => {
    if (!offRampForm.currency) return "Please select a currency";
    if (!offRampForm.transferMethod) return "Please select a transfer method";
    if (!offRampForm.bankAccountId) return "Please select a bank account";
    if (!offRampForm.amount || offRampForm.amount <= 0)
      return "Please enter a valid amount";
    return null;
  };

  const handleOnRampSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateOnRampForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (
        !customerData ||
        !customerData.wallets ||
        customerData.wallets.length === 0
      ) {
        throw new Error("No wallet found for this customer");
      }

      const walletId = customerData.wallets[0]; // Using the first wallet found

      const transferData = {
        // customer: "customer_80e5b83cddc547ae8e5a167a71ee550b",
        customer: customerId,
        amount: onRampForm.amount,
        source: {
          id: onRampForm.bankAccountId,
          network: onRampForm.transferMethod,
          currency: onRampForm.currency,
        },
        destination: {
          id: walletId,
          network: process.env.NEXT_PUBLIC_SPHEREPAY_NETWORK,
          currency: process.env.NEXT_PUBLIC_SPHEREPAY_CURRENCY,
        },
      };

      const response = await SpherePayAPI.createTransfer(transferData);
      setSuccessMessage("Transfer initiated successfully!");
      setTransferData(response.data.transfer);
      let data = await updtUser(
        { email: userAuth?.email },
        {
          $push: {
            spherePayTransferIds: response?.data?.transfer?.id,
          },
        }
      );
      // Clear form after successful submission
      setOnRampForm({
        currency: "",
        transferMethod: "",
        bankAccountId: "",
        amount: "",
      });
      setSpherePayTransfer(true);
    } catch (err) {
      console.error("Error initiating on-ramp transfer:", err);
      setError(
        err.response.data.message ||
          "Failed to initiate transfer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendUsdc = async (amount, toAddress) => {
    const data = JSON.parse(userAuth?.webauthnData);
    const retrieveSecretCheck = await retrieveSecret(
      data?.encryptedData,
      data?.credentialID
    );
    if (!retrieveSecretCheck?.status) {
      return;
    }

    const secretData = JSON.parse(retrieveSecretCheck?.data?.secret);

    try {
      const getAccountCli = await getAccount(
        secretData?.privateKey,
        secretData?.safePrivateKey
      );
      if (!getAccountCli.status) {
        return;
      }

      const gasPriceResult = await calculateGasPriceInUSDC(
        getAccountCli?.kernelClient,
        [
          {
            to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [toAddress, parseUnits(amount.toString(), 6)],
          },
        ]
      );

      // Round gas price to 2 decimals
      const value = Number.parseFloat(gasPriceResult.formatted);
      const roundedGasPrice = (Math.ceil(value * 100) / 100).toFixed(2);
      setGasPrice(roundedGasPrice);

      // Check if amount + gas price exceeds balance
      const totalRequired =
        Number.parseFloat(amount) + Number.parseFloat(roundedGasPrice);

      if (totalRequired > Number.parseFloat(balance)) {
        setGasPriceError(
          `Insufficient balance. Required: ${totalRequired.toFixed(2)} USDC (Amount: ${amount} + Max Gas Fee: ${roundedGasPrice})`
        );
        setIsLoading(false);
        return;
      }

      const tx = await sendTransaction(getAccountCli?.kernelClient, [
        {
          to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [toAddress, parseUnits(amount.toString(), 6)],
        },
      ]);

      if (tx && !tx.error) {
        return tx;
      }
    } catch (error) {
      console.log("error", error);
      setError("USDC Transfer Failed");
    }
  };

  const handleOffRampSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateOffRampForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    setGasPrice(null);
    setGasPriceError("");

    try {
      if (
        !customerData ||
        !customerData.wallets ||
        customerData.wallets.length === 0
      ) {
        throw new Error("No wallet found for this customer");
      }

      const walletId = customerData.wallets[0]; // Using the first wallet found

      const transferData = {
        // customer: "customer_80e5b83cddc547ae8e5a167a71ee550b",
        customer: customerId,
        amount: offRampForm.amount,
        source: {
          id: walletId,
          network: process.env.NEXT_PUBLIC_SPHEREPAY_NETWORK, // You might want to make this dynamic as well
          currency: process.env.NEXT_PUBLIC_SPHEREPAY_CURRENCY, // You might want to make this dynamic as well
        },
        destination: {
          id: offRampForm.bankAccountId,
          network: offRampForm.transferMethod,
          currency: offRampForm.currency,
        },
      };

      const response =
        await SpherePayAPI.createWalletToBankTransfer(transferData);
      setSuccessMessage("Transfer initiated successfully!");

      const tx = await sendUsdc(
        offRampForm.amount,
        response?.data?.transfer?.instructions?.resource?.address
      );
      if (!tx) {
        setError("USDC Transfer Failed");
        return;
      }
      let data = await updtUser(
        { email: userAuth?.email },
        {
          $push: {
            spherePayTransferIds: response?.data?.transfer?.id,
          },
        }
      );
      setOffRampForm({
        currency: "",
        transferMethod: "",
        bankAccountId: "",
        amount: "",
      });
    } catch (err) {
      console.error("Error initiating off-ramp transfer:", err);
      setError(
        (err.response.data.message ===
          "Please resubmit the following parameters that are either missing or invalid" &&
          "Please increase the amount.") ||
          "Failed to initiate transfer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTab = (activeTab) => {
    setTab(activeTab);
    setError("");
    setSuccessMessage("");
  };

  const fetchTransferHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const userExist = await getUser(userAuth.email);
      const transferIds = userExist?.userId?.spherePayTransferIds;

      if (!transferIds || transferIds.length === 0) {
        setTransfers([]);
        setError("No transfer history found");
        return;
      }

      // Fetch details for each transfer ID
      const transferPromises = transferIds.map((transferId) =>
        SpherePayAPI.getTransferDetail(transferId)
      );

      const transferResponses = await Promise.all(transferPromises);

      // Extract transfer data from responses
      const transfersData = transferResponses
        .map((response) => {
          if (response && response.data && response.data.transfer) {
            return response.data.transfer;
          }
          return null;
        })
        .filter((transfer) => transfer !== null)
        .reverse();

      setTransfers(transfersData);

      if (transfersData.length === 0) {
        setError("Failed to retrieve transfer history");
      }
    } catch (err) {
      console.error("Error fetching transfer history:", err);
      setError(
        "An error occurred while fetching transfer history. Please try again."
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 2) {
      fetchTransferHistory();
    }
  }, [tab]);

  const tabData = [
    {
      title: "On Ramp",
      component: (
        <>
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            On Ramp (Bank to Wallet)
          </h4>
          <p className="text-sm text-white/70">
            Transfer funds from your bank account to your wallet
          </p>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mt-3">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 text-green-300 p-3 rounded-lg mt-3">
              {successMessage}
            </div>
          )}

          <div className="contentBody">
            <form onSubmit={handleOnRampSubmit} className="mt-5">
              <div className="grid gap-3 grid-cols-12">
                <div className="md:col-span-6 col-span-12">
                  <div className="md:col-span-6 col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      Currency
                    </label>
                    <div className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full flex items-center">
                      USD - US Dollar
                    </div>
                  </div>
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Select Transfer Method
                  </label>
                  <select
                    id="transferMethod"
                    value={onRampForm.transferMethod}
                    onChange={handleOnRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    <option value="" disabled>
                      Select Transfer Method
                    </option>
                    {transferMethodOptions.map((option) => (
                      <option
                        className="text-black"
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Select Bank Account
                  </label>
                  <select
                    id="bankAccountId"
                    value={onRampForm.bankAccountId}
                    onChange={handleOnRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    <option value="" disabled>
                      Select Bank Account
                    </option>
                    {isLoading ? (
                      <option disabled>Loading bank accounts...</option>
                    ) : bankAccounts.length === 0 ? (
                      <option disabled>No bank accounts found</option>
                    ) : (
                      bankAccounts.map((account) => (
                        <option
                          className="text-black"
                          key={account.id}
                          value={account.id}
                        >
                          {account.bankName} - ••••{account.last4} (
                          {account.accountType})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-span-12">
                  <label
                    htmlFor="amount"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Enter Amount in USD
                  </label>
                  <input
                    id="amount"
                    type="text"
                    value={onRampForm.amount}
                    onChange={handleOnRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter Amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div className="col-span-12">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isLoading ? "Processing..." : "Transfer"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </>
      ),
    },
    {
      title: "Off Ramp",
      component: (
        <>
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Off Ramp (Wallet to Bank)
          </h4>
          <p className="text-sm text-white/70">
            Transfer funds from your wallet to your bank account
          </p>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mt-3">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 text-green-300 p-3 rounded-lg mt-3">
              {successMessage}
            </div>
          )}

          <div className="contentBody">
            <form onSubmit={handleOffRampSubmit} className="mt-5">
              <div className="grid gap-3 grid-cols-12">
                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Currency
                  </label>
                  <div className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full flex items-center">
                    USD - US Dollar
                  </div>
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Select Transfer Method
                  </label>
                  <select
                    id="transferMethod"
                    value={offRampForm.transferMethod}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    <option value="" disabled>
                      Select Transfer Method
                    </option>
                    {transferMethodOptionsOfframp.map((option) => (
                      <option
                        className="text-black"
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Select Bank Account
                  </label>
                  <select
                    id="bankAccountId"
                    value={offRampForm.bankAccountId}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    <option value="" disabled>
                      Select Bank Account
                    </option>
                    {isLoading ? (
                      <option disabled>Loading bank accounts...</option>
                    ) : bankAccounts.length === 0 ? (
                      <option disabled>No bank accounts found</option>
                    ) : (
                      bankAccounts.map((account) => (
                        <option
                          className="text-black"
                          key={account.id}
                          value={account.id}
                        >
                          {account.bankName} - ••••{account.last4} (
                          {account.accountType})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-span-12">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="amount"
                      className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                    >
                      Enter Amount
                    </label>

                    <label className="form-label m-0 font-semibold text-xs ps-3">
                      Balance:{" "}
                      {Number(balance) < 0.01
                        ? "0"
                        : Number.parseFloat(balance).toFixed(2)}{" "}
                      USDC
                    </label>
                  </div>

                  <input
                    id="amount"
                    type="text"
                    value={offRampForm.amount}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter Amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div className="col-span-12">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isLoading ? "Processing..." : "Transfer"}
                    </button>
                  </div>
                </div>
                <div className="col-span-12">
                  <div className="ps-3 flex flex-col gap-1 mt-2">
                    {gasPrice && (
                      <label className="form-label m-0 font-semibold text-xs block">
                        Estimated Max Gas Fee: {gasPrice} USDC
                      </label>
                    )}

                    {gasPriceError && (
                      <div className="text-red-500 text-xs">
                        {gasPriceError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </>
      ),
    },
    {
      title: "History",
      component: (
        <>
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Transfer History
          </h4>
          <p className="text-sm text-white/70">
            View your past bank and wallet transfers
          </p>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mt-3">
              {error}
            </div>
          )}

          <div className="contentBody mt-5">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : transfers.length === 0 ? (
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <p className="text-white/70">No transfer history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer, index) => (
                  <div
                    key={index}
                    className={`p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all ${
                      transfer.status === "pending" &&
                      transfer.type === "onRamp" &&
                      "cursor-pointer"
                    }`}
                    onClick={() => {
                      if (
                        transfer.status === "pending" &&
                        transfer.type === "onRamp"
                      ) {
                        setTransferData(transfer);
                        setSpherePayTransfer(true);
                      }
                    }}
                  >
                    <div className="grid gap-3 grid-cols-12">
                      <div className="col-span-12 border-b border-dashed border-white/30 pb-3">
                        <p className="font-semibold">
                          Amount : {transfer.amount}{" "}
                          {transfer.source?.currency?.toUpperCase() || ""}
                        </p>
                        <p
                          className={`text-xs ${
                            transfer.status === "completed"
                              ? "text-green-400"
                              : transfer.status === "failed"
                                ? "text-red-400"
                                : "text-yellow-400"
                          }`}
                        >
                          Status :{" "}
                          {transfer.status?.charAt(0).toUpperCase() +
                            transfer.status?.slice(1) || "Pending"}
                        </p>
                      </div>
                      <div className="col-span-6">
                        <p className="text-xs text-white/50">From : </p>
                        <p className="font-medium text-sm">
                          {transfer.source?.network.toUpperCase() ||
                            "Unknown"}{" "}
                        </p>
                      </div>
                      <div className="col-span-6">
                        <p className="text-xs text-white/50">To : </p>
                        <p className="font-medium text-sm">
                          {transfer.destination?.network.toUpperCase() ||
                            "Unknown"}
                        </p>
                      </div>
                      <div className="col-span-6">
                        <p className="text-xs text-white/50">Date : </p>
                        <p className="text-xs">
                          {new Date(transfer.created).toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-6">
                        <p className="text-xs text-white/50"> Type : </p>

                        <p className="text-xs">
                          {transfer.type === "onRamp"
                            ? "Deposit"
                            : "Withdrawal"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      {spherePayTransfer &&
        createPortal(
          <SpherePayTransferDetailPop
            transferData={transferData}
            spherePayTransfer={spherePayTransfer}
            setSpherePayTransfer={setSpherePayTransfer}
          />,
          document.body
        )}
      <div className="pb-4">
        <div className="p-2 rounded-xl bg-black/50 flex items-center justify-center">
          {tabData.map((item, key) => (
            <button
              onClick={() => handleTab(key)}
              key={key}
              className={`${tab === key ? "bg-[#df723b]" : ""} w-full rounded flex items-center justify-center text-xs px-3 py-2`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
      {isLoading && (tab === 0 || tab === 1) ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="tabContent">{tabData[tab].component}</div>
      )}
    </>
  );
};

export default TransferHistory;
