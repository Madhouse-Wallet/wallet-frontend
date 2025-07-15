import React, { useEffect, useState } from "react";
import { filterAmountInput, isValidName, isValidNumber } from "@/utils/helper";
import { swap, swapUSDC } from "@/utils/morphoSwap";
import { retrieveSecret } from "@/utils/webauthPrf";
import {
  calculateGasPriceInUSDC,
  getAccount,
  publicClient,
  sendTransaction,
  usdc,
  USDC_ABI,
} from "@/lib/zeroDev";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { getUser, sendTransferDetail, updtUser } from "@/lib/apiCall";
import { parseAbi, parseUnits } from "viem";

const TransferHistory = ({ step, setStep, customerId }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [userData, setUserData] = useState(null);
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gasPrice, setGasPrice] = useState(null);
  const [gasPriceError, setGasPriceError] = useState("");
  const [balance, setBalance] = useState("0");
  const [feeAmount, setFeeAmount] = useState(null);

  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [payments, setPayments] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [offRampForm, setOffRampForm] = useState({
    receivingPartyType: "company",
    receivingPartyName: "",
    accountNumber: "",
    bankName: "",
    country: "US",
    network: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    amount: "",
    currency: "",
    description: "",
    purposeOfPayment: "payment_for_goods",
    sourceOfFunds: "business_income",
    metadata: "",
  });

  const networksOptions = [{ value: "SWIFT", label: "SWIFT" }];

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
    if (id === "description" && !isValidName(value, 100)) {
      return;
    }

    if (id === "amount") {
      console.log("line-79", id);
      setFeeAmount(null);
      const filteredValue = filterAmountInput(value, 2, 20);
      const FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_FEE_PERCENTAGE);
      const FeeAmount = filteredValue * FEE_PERCENTAGE;
      console.log("line-dsf83", FeeAmount);
      setFeeAmount(FeeAmount);
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

  const validateOffRampForm = () => {
    if (!selectedParty) {
      return "Please select the Bank Account.";
    }
    if (!offRampForm.receivingPartyName)
      return "Please enter receiving party name";
    if (!offRampForm.accountNumber) return "Please enter account number";
    if (!offRampForm.bankName) return "Please enter bank name";
    if (!offRampForm.network) return "Please select network";
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
    setSelectedParty("");
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
              network: offRampForm.network,
              currencies: [offRampForm.currency],
              provider: {
                name: offRampForm.bankName,
                country: offRampForm.country,
                networkIdentifier: "BOFAUS3N",
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
      const userId = userAuth?.email;
      const resultt = await usdcBridge();
      if (!resultt) {
        return;
      }
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
        const userExist = await getUser(userAuth.email);
        if (!userExist) {
          return;
        }
        const transferData = {
          businessAccountDetail: userExist?.userId?.businessAccountDetail || {},
          receivingPartyDetail: userExist?.userId?.receivingPartyDetail || {},
          transfer: result || {},
          txHash: resultt,
        };

        console.log("line-180", transferData);
        const obj = {
          // email: userAuth.email,
          email: process.env.NEXT_PUBLIC_REAP_EMAIL_URL,
          transferData: JSON.stringify(transferData),
          subject: "Transfer Detail for Reap",
          type: "transferDetail",
        };
        await sendTransferDetail(obj);
        setSuccessMessage("Payment created successfully!");
        setOffRampForm({
          receivingPartyType: "company",
          receivingPartyName: "",
          accountNumber: "",
          bankName: "",
          country: "",
          network: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          amount: "",
          currency: "",
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
      if (result.data.length) {
        setPayments(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setError("Please make payment first.");
      }
    } catch (err) {
      setError(
        "An error occurred while fetching payment history. Please try again."
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const fetchParties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/parties/${userAuth?.email}`, {
        method: "GET",
      });

      const result = await response.json();
      if (result) {
        const data = result;
        setParties(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch parties");
      }
    } catch (err) {
      setError("Failed to load bank accounts. Please try again.");
      setParties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 1) {
      fetchPaymentHistory();
    }
  }, [tab]);

  useEffect(() => {
    fetchParties();
  }, []);

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalance();
    }
  }, [userAuth?.walletAddress]);

  useEffect(() => {
    const fetchData = async () => {
      let user = await getUser(userAuth?.email);
      setUserData(user?.userId);
    };
    fetchData();
  }, []);

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

  const handlePartySelection = (e) => {
    const partyId = e.target.value;
    setSelectedParty(partyId);

    if (partyId) {
      const selectedPartyData = parties.find(
        (party) => party.data.id === partyId
      );
      if (selectedPartyData) {
        const account = selectedPartyData.data.accounts[0]; // Taking first account
        const address = account.addresses[0]; // Taking first address
        console.log(account);
        setOffRampForm((prev) => ({
          ...prev,
          receivingPartyName: selectedPartyData.data.name.name,
          accountNumber: account.identifier.value,
          bankName: account.provider.name,
          currency: account.currencies[0],
          network: account.network,
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          postalCode: address.postalCode,
        }));
      }
    }
  };

  const usdcBridge = async () => {
    let user = await getUser(userAuth?.email);
    console.log("line-104", user);

    if (!user) {
      return;
    }

    const amountInBaseUnits = ethers.utils
      .parseUnits(offRampForm.amount, 6)
      .toString();
    const quoteResult = await swapUSDC(
      process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
      process.env.NEXT_PUBLIC_USDC_POLYGON_CONTRACT_ADDRESS,
      amountInBaseUnits,
      process.env.NEXT_PUBLIC_MAINNET_CHAIN,
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
      process.env.NEXT_PUBLIC_MAINNET_CHAIN,
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
      process.env.NEXT_PUBLIC_MAINNET_CHAIN,
      userAuth?.walletAddress
    );

    console.log("line-276", gasQuoteFinalResult);

    if (!gasQuoteFinalResult) {
      return;
    }

    let data = JSON.parse(userAuth?.webauthnData);
    let retrieveSecretCheck = await retrieveSecret(
      data?.encryptedData,
      data?.credentialID
    );
    if (!retrieveSecretCheck?.status) {
      return;
    }

    let secretData = JSON.parse(retrieveSecretCheck?.data?.secret);

    try {
      const getAccountCli = await getAccount(
        secretData?.privateKey,
        secretData?.safePrivateKey
      );

      console.log("line-434", gasQuoteFinalResult);
      const gasGasPriceResult = await calculateGasPriceInUSDC(
        getAccountCli?.kernelClient,
        [
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
        ]
      );

      // Round gas price to 2 decimals
      const gasValue = Number.parseFloat(gasGasPriceResult.formatted);
      const roundedGasGasPrice = (Math.ceil(gasValue * 100) / 100).toFixed(2);

      console.log("Gas transaction estimated gas price:", roundedGasGasPrice);

      // const FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_FEE_PERCENTAGE);
      // const FeeAmount = offRampForm.amount * FEE_PERCENTAGE;
      // console.log("line-133", FeeAmount);

      let COMMISSION_FEES;
      if (!user?.userId?.commission_fees) {
        console.log("line-138");
        let data = await updtUser(
          { email: userAuth.email },
          {
            $set: { commission_fees: process.env.NEXT_PUBLIC_MADHOUSE_FEE },
          }
        );
        COMMISSION_FEES = process.env.NEXT_PUBLIC_MADHOUSE_FEE;
      } else {
        console.log("line-147");
        COMMISSION_FEES = user?.userId?.commission_fees;
      }

      // Estimate gas for the main transaction
      const mainGasPriceResult = await calculateGasPriceInUSDC(
        getAccountCli?.kernelClient,
        [
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
          {
            to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [COMMISSION_FEES, parseUnits(feeAmount.toString(), 6)],
          },
        ]
      );

      // Round gas price to 2 decimals
      const mainValue = Number.parseFloat(mainGasPriceResult.formatted);
      const roundedMainGasPrice = (Math.ceil(mainValue * 100) / 100).toFixed(2);

      console.log("Main transaction estimated gas price:", roundedMainGasPrice);

      // Calculate total gas required
      const totalGasRequired =
        Number.parseFloat(roundedGasGasPrice) +
        Number.parseFloat(roundedMainGasPrice);

      console.log("Total gas required:", totalGasRequired.toFixed(2));

      // Check if user has sufficient balance (you may want to add balance check here)
      const totalRequired =
        Number.parseFloat(offRampForm.amount) + totalGasRequired;
      if (totalRequired > Number.parseFloat(balance)) {
        setGasPriceError(
          `Insufficient balance. Required: ${totalRequired.toFixed(2)} USDC (Amount: ${offRampForm.amount} + Max Gas Fee: ${totalGasRequired.toFixed(2)})`
        );
        return;
      }

      console.log("line-499", gasQuoteFinalResult);

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
      if (gasTx?.success !== false) {
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
          {
            to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [COMMISSION_FEES, parseUnits(feeAmount.toString(), 6)],
          },
        ]);

        console.log("line-283", tx);
        setHash(tx);
        return tx;
      } else {
        console.log("line-422 error");
        return;
      }
    } catch (error) {
      console.log(error);
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

                <div className="col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Select Bank Account
                  </label>
                  <select
                    id="selectedParty"
                    value={selectedParty}
                    onChange={handlePartySelection}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    <option className="text-black" value="">
                      Select a bank account
                    </option>
                    {parties.map((party) => (
                      <option
                        className="text-black"
                        key={party.data.id}
                        value={party.data.id}
                      >
                        {party.data.name.name} -{" "}
                        {party.data.accounts[0]?.provider?.name} (
                        {party.data.accounts[0]?.identifier?.value})
                      </option>
                    ))}
                  </select>
                </div>
                {offRampForm.receivingPartyName && (
                  <>
                    {" "}
                    <div className="md:col-span-6 col-span-12">
                      <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                        Bank Account Name
                      </label>
                      <input
                        id="receivingPartyName"
                        type="text"
                        value={offRampForm.receivingPartyName}
                        disabled={selectedParty !== ""}
                        onChange={handleOffRampChange}
                        className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                        placeholder="Enter Bank Account Name"
                      />

                      {errors.receivingPartyName && (
                        <p className="text-red-500 text-xs mt-1 pl-3">
                          {errors.receivingPartyName}
                        </p>
                      )}
                    </div>
                  </>
                )}
                {offRampForm.accountNumber && (
                  <div className="md:col-span-6 col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      Account Number
                    </label>
                    <input
                      id="accountNumber"
                      type="text"
                      value={offRampForm.accountNumber}
                      disabled={selectedParty !== ""}
                      onChange={handleOffRampChange}
                      className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                      placeholder="Enter account number"
                    />
                  </div>
                )}

                {offRampForm.bankName && (
                  <div className="md:col-span-6 col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      Bank Name
                    </label>
                    <input
                      id="bankName"
                      type="text"
                      value={offRampForm.bankName}
                      onChange={handleOffRampChange}
                      disabled={selectedParty !== ""}
                      className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                      placeholder="Enter bank name"
                    />
                  </div>
                )}
                {offRampForm.currency && (
                  <div className="md:col-span-6 col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      Currency
                    </label>

                    <input
                      id="currency"
                      type="text"
                      value={offRampForm.currency}
                      onChange={handleOffRampChange}
                      disabled={selectedParty !== ""}
                      className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                      placeholder="Enter currency name"
                    />
                  </div>
                )}

                <div className="md:col-span-6 col-span-12">
                  <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                    Network
                  </label>
                  <select
                    id="network"
                    value={offRampForm.network}
                    onChange={handleOffRampChange}
                    disabled={true}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    {networksOptions.map((option) => (
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

                {offRampForm.street && (
                  <div className="col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      Street Address
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={offRampForm.street}
                      onChange={handleOffRampChange}
                      disabled={selectedParty !== ""}
                      className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                      placeholder="Enter street address"
                    />
                  </div>
                )}

                {offRampForm.city && (
                  <div className="md:col-span-4 col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={offRampForm.city}
                      disabled={selectedParty !== ""}
                      onChange={handleOffRampChange}
                      className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                      placeholder="Enter city"
                    />
                  </div>
                )}
                {offRampForm.state && (
                  <div className="md:col-span-4 col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={offRampForm.state}
                      disabled={selectedParty !== ""}
                      onChange={handleOffRampChange}
                      className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                      placeholder="Enter state"
                    />
                  </div>
                )}

                {offRampForm.postalCode && (
                  <div className="md:col-span-4 col-span-12">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={offRampForm.postalCode}
                      onChange={handleOffRampChange}
                      disabled={selectedParty !== ""}
                      className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                      placeholder="Enter postal code"
                    />
                  </div>
                )}

                <div className="md:col-span-6 col-span-12">
                  <div className="flex items-center justify-between">
                    <label className="form-label m-0 font-medium text-[12px] pl-3 pb-1">
                      Amount
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
                    placeholder="Enter amount"
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
                  />
                </div>

                <div className="col-span-12">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="submit"
                      disabled={
                        isLoading || userData?.EnableSpherepay === false
                      }
                      className="commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isLoading ? "Creating Payment..." : "Create Payment"}
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

                    {feeAmount > 0 && (
                      <label className="form-label m-0 font-semibold text-xs block">
                        Commission Fee:{" "}
                        {(Math.ceil(feeAmount * 100) / 100).toFixed(2)} USDC
                        USDC
                      </label>
                    )}
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
