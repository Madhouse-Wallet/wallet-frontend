import React, { useEffect, useState } from "react";
import { filterAmountInput, isValidNumber } from "@/utils/helper";
import { swap, swapUSDC } from "@/utils/morphoSwap";
import { retrieveSecret } from "@/utils/webauthPrf";
import { getAccount, sendTransaction } from "@/lib/zeroDev";
import { useSelector } from "react-redux";

const TransferHistory = ({ step, setStep, customerId }) => {
  const userAuth = useSelector((state) => state.Auth);

  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [payments, setPayments] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [offRampForm, setOffRampForm] = useState({
    receivingPartyType: "company",
    receivingPartyName: "",
    accountNumber: "",
    bankName: "",
    country: "US",
    networkIdentifier: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    amount: "",
    currency: "USD",
    description: "",
    purposeOfPayment: "payment_for_goods",
    sourceOfFunds: "business_income",
    metadata: "",
  });

  const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
  ];

  const purposeOfPaymentOptions = [
    { value: "payment_for_goods", label: "Payment for Goods" },
    { value: "payment_for_services", label: "Payment for Services" },
    { value: "salary", label: "Salary" },
    { value: "rent", label: "Rent" },
    { value: "other", label: "Other" },
  ];

  const sourceOfFundsOptions = [
    { value: "business_income", label: "Business Income" },
    { value: "salary", label: "Salary" },
    { value: "investment", label: "Investment" },
    { value: "other", label: "Other" },
  ];

  const handleOffRampChange = (e) => {
    const { id, value } = e.target;

    if (id === "amount") {
      const filteredValue = filterAmountInput(value, 2, 20);
      setOffRampForm((prev) => ({ ...prev, [id]: filteredValue }));
    } else {
      setOffRampForm((prev) => ({ ...prev, [id]: value }));
    }

    setError("");
    setSuccessMessage("");
  };

  const validateOffRampForm = () => {
    if (!offRampForm.receivingPartyName)
      return "Please enter receiving party name";
    if (!offRampForm.accountNumber) return "Please enter account number";
    if (!offRampForm.bankName) return "Please enter bank name";
    if (!offRampForm.networkIdentifier)
      return "Please enter network identifier";
    if (!offRampForm.street) return "Please enter street address";
    if (!offRampForm.city) return "Please enter city";
    if (!offRampForm.state) return "Please enter state";
    if (!offRampForm.postalCode) return "Please enter postal code";
    if (!offRampForm.amount || parseFloat(offRampForm.amount) <= 0)
      return "Please enter a valid amount";
    if (!offRampForm.description) return "Please enter payment description";
    return null;
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

    try {
      const paymentData = {
        receivingParty: {
          type: offRampForm.receivingPartyType,
          name: {
            name: offRampForm.receivingPartyName,
          },
          accounts: [
            {
              type: "bank",
              identifier: {
                standard: "account_number",
                value: offRampForm.accountNumber,
              },
              network: "SWIFT",
              currencies: [offRampForm.currency],
              provider: {
                name: offRampForm.bankName,
                country: offRampForm.country,
                networkIdentifier: offRampForm.networkIdentifier,
              },
              addresses: [
                {
                  type: "postal",
                  street: offRampForm.street,
                  city: offRampForm.city,
                  state: offRampForm.state,
                  country: offRampForm.country,
                  postalCode: offRampForm.postalCode,
                },
              ],
            },
          ],
          id: `receiving_party_${Date.now()}`,
        },
        payment: {
          receivingAmount: parseFloat(offRampForm.amount),
          receivingCurrency: offRampForm.currency,
          description: offRampForm.description,
          purposeOfPayment: offRampForm.purposeOfPayment,
          requireApproval: true,
          sourceOfFunds: offRampForm.sourceOfFunds,
          senderCurrency: "USDC",
          metadata: {
            content: offRampForm.metadata || "Payment via off-ramp",
          },
        },
      };
      const userId = userAuth?.id;
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(paymentData),
        body: JSON.stringify({
          ...paymentData,
          userId,
        }),
      });

      const result = await response.json();

      if (result.paymentId) {
        setSuccessMessage("Payment created successfully!");
        // Clear form after successful submission
        setOffRampForm({
          receivingPartyType: "company",
          receivingPartyName: "",
          accountNumber: "",
          bankName: "",
          country: "US",
          networkIdentifier: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          amount: "",
          currency: "USD",
          description: "",
          purposeOfPayment: "payment_for_goods",
          sourceOfFunds: "business_income",
          metadata: "",
        });
      } else {
        throw new Error(result.error || "Failed to create payment");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      setError(err.message || "Failed to create payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTab = (activeTab) => {
    setTab(activeTab);
    setError("");
    setSuccessMessage("");
  };

  const fetchPaymentHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`/api/payments/${userAuth?.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("line-214", result);
      if (result.data.length) {
        setPayments(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setError("Please make payment first.");
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(
        "An error occurred while fetching payment history. Please try again."
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 1) {
      fetchPaymentHistory();
    }
  }, [tab]);

  const usdcBridge = async () => {
    const amountInBaseUnits = ethers.utils.parseUnits(amount, 6).toString();
    const quoteResult = await swapUSDC(
      process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
      process.env.NEXT_PUBLIC_USDC_POLYGON_CONTRACT_ADDRESS,
      amountInBaseUnits,
      8453,
      userAuth?.walletAddress
    );

    console.log("line-242", quoteResult);

    if (!quoteResult) {
      return;
    }

    const eth = {
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      name: "ETH",
    };

    const usdc = {
      address: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
      name: "USDC",
    };

    const gasQuoteResult = await swap(
      eth,
      usdc,
      quoteResult?.routeData?.tx?.value,
      8453,
      userAuth?.walletAddress
    );

    console.log("line-262", gasQuoteResult);

    if (!gasQuoteResult) {
      return;
    }

    const gasQuoteFinalResult = await swap(
      usdc,
      eth,
      Number(gasQuoteResult?.routeData?.amountOut || 0) + 10000,
      8453,
      userAuth?.walletAddress
    );

    console.log("line-276", gasQuoteFinalResult);

    if (!gasQuoteFinalResult) {
      return;
    }

    let data = JSON.parse(userAuth?.webauthKey);
    let retrieveSecretCheck = await retrieveSecret(
      data?.storageKeySecret,
      data?.credentialIdSecret
    );
    if (!retrieveSecretCheck?.status) {
      return;
    }

    let secretData = JSON.parse(retrieveSecretCheck?.data?.secret);

    const getAccountCli = await getAccount(
      secretData?.privateKey,
      secretData?.safePrivateKey
    );

    const gasTx = await sendTransaction(getAccountCli?.kernelClient, [
      {
        from: gasQuoteFinalResult?.approvalData?.tx?.from,
        to: gasQuoteFinalResult?.approvalData?.tx?.to,
        data: gasQuoteFinalResult?.approvalData?.tx?.data,
      },
      {
        from: gasQuoteFinalResult?.routeData?.tx?.from,
        to: gasQuoteFinalResult?.routeData?.tx?.to,
        data: gasQuoteFinalResult?.routeData?.tx?.data,
        value: gasQuoteFinalResult?.routeData?.tx?.value,
      },
    ]);
    console.log("gasTx", gasTx);
    if (gasTx) {
      console.log("gasTx", gasTx);
      const tx = await sendTransaction(getAccountCli?.kernelClient, [
        {
          from: quoteResult?.approvalData?.tx?.from,
          to: quoteResult?.approvalData?.tx?.to,
          data: quoteResult?.approvalData?.tx?.data,
        },
        {
          from: quoteResult?.routeData?.tx?.from,
          to: quoteResult?.routeData?.tx?.to,
          data: quoteResult?.routeData?.tx?.data,
          value: quoteResult?.routeData?.tx?.value,
        },
      ]);

      console.log("line-283", tx);
      setHash(tx);
    }
  };

  const tabData = [
    {
      title: "Off Ramp",
      component: (
        <>
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Off Ramp (Create Payment)
          </h4>
          <p className="text-sm text-white/70">
            Create a payment to transfer funds to a bank account
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
                    Receiving Party Type
                  </label>
                  <select
                    id="receivingPartyType"
                    value={offRampForm.receivingPartyType}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    <option className="text-black" value="company">
                      Company
                    </option>
                    <option className="text-black" value="individual">
                      Individual
                    </option>
                  </select>
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Receiving Party Name
                  </label>
                  <input
                    id="receivingPartyName"
                    type="text"
                    value={offRampForm.receivingPartyName}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter receiving party name"
                    required
                  />
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Account Number
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    value={offRampForm.accountNumber}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter account number"
                    required
                  />
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Bank Name
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    value={offRampForm.bankName}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter bank name"
                    required
                  />
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Network Identifier
                  </label>
                  <input
                    id="networkIdentifier"
                    type="text"
                    value={offRampForm.networkIdentifier}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter network identifier"
                    required
                  />
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={offRampForm.currency}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    {currencyOptions.map((option) => (
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
                    Street Address
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={offRampForm.street}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="md:col-span-4 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={offRampForm.city}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="md:col-span-4 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={offRampForm.state}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div className="md:col-span-4 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    value={offRampForm.postalCode}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter postal code"
                    required
                  />
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="text"
                    value={offRampForm.amount}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Purpose of Payment
                  </label>
                  <select
                    id="purposeOfPayment"
                    value={offRampForm.purposeOfPayment}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    {purposeOfPaymentOptions.map((option) => (
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

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Source of Funds
                  </label>
                  <select
                    id="sourceOfFunds"
                    value={offRampForm.sourceOfFunds}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    {sourceOfFundsOptions.map((option) => (
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

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Payment Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={offRampForm.description}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                    placeholder="Enter payment description"
                    required
                  />
                </div>

                <div className="col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Metadata (Optional)
                  </label>
                  <textarea
                    id="metadata"
                    value={offRampForm.metadata}
                    onChange={handleOffRampChange}
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 rounded-xl resize-none"
                    placeholder="Enter additional metadata"
                    rows="3"
                  />
                </div>

                <div className="col-span-12">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isLoading ? "Creating Payment..." : "Create Payment"}
                    </button>
                  </div>
                </div>

                <div className="col-span-12">
                  <div className="flex items-center justify-center gap-3 mt-5">
                    <button
                      type="button"
                      onClick={usdcBridge}
                      className={`commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      Test Enso Bridge
                    </button>
                  </div>
                </div>

                {hash && (
                  <p className="text-red-500 text-xs mt-1 pl-3">{hash}</p>
                )}
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
            ) : payments.length === 0 ? (
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <p className="text-white/70">No payment history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">
                          Payment to{" "}
                          {payment.receivingParty?.name?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-white/70">
                          {payment.payment?.description || "No description"}
                        </p>
                        <p className="text-xs text-white/50">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleString()
                            : "Unknown date"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {payment.payment?.receivingAmount || 0}{" "}
                          {payment.payment?.receivingCurrency || "USD"}
                        </p>
                        <p className="text-xs text-blue-400">
                          From: {payment.payment?.senderCurrency || "USDC"}
                        </p>
                        <p
                          className={`text-xs ${
                            payment.status === "completed"
                              ? "text-green-400"
                              : payment.status === "failed"
                                ? "text-red-400"
                                : "text-yellow-400"
                          }`}
                        >
                          {payment.status?.charAt(0).toUpperCase() +
                            payment.status?.slice(1) || "Pending"}
                        </p>
                      </div>
                    </div>
                    {payment.payment?.purposeOfPayment && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs text-white/60">
                          Purpose:{" "}
                          {payment.payment.purposeOfPayment
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      </div>
                    )}
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
