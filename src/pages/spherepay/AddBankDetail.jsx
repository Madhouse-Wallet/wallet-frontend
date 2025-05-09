import React, { useState, useEffect } from "react";
import SpherePayAPI from "../api/spherePayApi";

const AddBankDetail = ({ step, setStep, customerId }) => {
  const [formData, setFormData] = useState({
    accountName: "",
    bankName: "",
    accountType: "",
    accountNumber: "",
    routingNumber: "",
  });

  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    if (tab === 1) {
      fetchCustomerData();
    }
  }, [tab]);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const customerResponse = await getCustomer();
      if (
        customerResponse &&
        customerResponse.data &&
        customerResponse.data.customer
      ) {
        const customer = customerResponse.data.customer;

        if (customer.bankAccounts && customer.bankAccounts.length > 0) {
          const accountDetailsPromises = customer.bankAccounts.map(
            (bankAccountId) => SpherePayAPI.getBankAccountDetail(bankAccountId)
          );

          const accountDetailsResponses = await Promise.all(
            accountDetailsPromises
          );

          // Extract bank account details from responses
          const bankAccountDetails = accountDetailsResponses
            .map((response) => {
              if (response && response.data && response.data.bankAccount) {
                return response.data.bankAccount;
              }
              return null;
            })
            .filter((account) => account !== null);

          setBankAccounts(bankAccountDetails);
        } else {
          setBankAccounts([]);
        }
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setError("Failed to load bank accounts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomer = async () => {
    try {
      const response = await SpherePayAPI.getCustomer(
        // "customer_80e5b83cddc547ae8e5a167a71ee550b"
        customerId
      );
      return response;
    } catch (error) {
      console.error("Error getting customer:", error);
      return null;
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Clear error when field is updated
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account holder name is required";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.accountType.trim()) {
      newErrors.accountType = "Account type is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number should only contain digits";
    }

    if (!formData.routingNumber.trim()) {
      newErrors.routingNumber = "Routing number is required";
    } else if (!/^\d+$/.test(formData.routingNumber)) {
      newErrors.routingNumber = "Routing number should only contain digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: "", message: "" });

    try {
      const bankAccountData = {
        customer: customerId,
        accountName: formData.accountName,
        bankName: formData.bankName,
        accountType: formData.accountType,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
      };

      const response = await SpherePayAPI.addBankAccount(
        customerId,
        bankAccountData
      );

      setSubmitMessage({
        type: "success",
        message: "Bank account added successfully!",
      });

      // Clear form fields after successful submission
      setFormData({
        accountName: "",
        bankName: "",
        accountType: "",
        accountNumber: "",
        routingNumber: "",
      });

      // If the List tab is implemented, switch to it after adding
      setTab(1);

      // Fetch updated bank accounts
      fetchCustomerData();
    } catch (error) {
      console.error("Error adding bank account:", error);
      setSubmitMessage({
        type: "error",
        message:
          error.message || "Failed to add bank account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "invalid":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-white/60";
    }
  };

  const tabData = [
    {
      title: "Bank Account",
      component: (
        <>
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            My Accounts
          </h4>
          {/* Display success/error message */}
          {submitMessage.message && (
            <div
              className={`mt-2 p-3 rounded-lg text-sm ${
                submitMessage.type === "success"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {submitMessage.message}
            </div>
          )}

          <div className="mt-5">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-3 grid-cols-12">
                <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="accountName"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Account Holder Name
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    value={formData.accountName}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.accountName ? "border-red-500" : ""
                    }`}
                    placeholder="Enter Name"
                  />
                  {errors.accountName && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.accountName}
                    </p>
                  )}
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="bankName"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Bank Name
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    value={formData.bankName}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.bankName ? "border-red-500" : ""
                    }`}
                    placeholder="Enter bank name"
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.bankName}
                    </p>
                  )}
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="accountType"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Account Type
                  </label>
                  <input
                    id="accountType"
                    type="text"
                    value={formData.accountType}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.accountType ? "border-red-500" : ""
                    }`}
                    placeholder="Enter account type"
                  />
                  {errors.accountType && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.accountType}
                    </p>
                  )}
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="accountNumber"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Account Number
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.accountNumber ? "border-red-500" : ""
                    }`}
                    placeholder="Enter Account no."
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="routingNumber"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Routing Number
                  </label>
                  <input
                    id="routingNumber"
                    type="text"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.routingNumber ? "border-red-500" : ""
                    }`}
                    placeholder="Enter routing number"
                  />
                  {errors.routingNumber && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.routingNumber}
                    </p>
                  )}
                </div>

                <div className="col-span-12">
                  <div className="flex items-center justify-center gap-3 mt-5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
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
      title: "List Account",
      component: (
        <>
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            My Bank Accounts
          </h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mt-4">
              {error}
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="bg-white/10 p-6 rounded-lg mt-4 text-center">
              <p className="text-white/60">
                No bank accounts found. Add your first bank account in the "Bank
                Account" tab.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="text-lg font-semibold">
                        {account.bankName}
                      </h5>
                      <p className="text-sm text-white/70">
                        {account.accountName}
                      </p>
                    </div>
                    <div
                      className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(account.status)} bg-white/10`}
                    >
                      {account.status.charAt(0).toUpperCase() +
                        account.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-white/50">Account Type</p>
                      <p className="text-sm">{account.accountType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Account Number</p>
                      <p className="text-sm">••••{account.last4}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Routing Number</p>
                      <p className="text-sm">{account.routingNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Currency</p>
                      <p className="text-sm">
                        {account.currency.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Created</p>
                      <p className="text-sm">
                        {new Date(account.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setTab(0)}
              className="border border-white/20 hover:bg-white/10 flex h-[42px] text-xs items-center rounded-full px-6 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none active:scale-100 justify-center"
            >
              Add New Account
            </button>
            <button
              onClick={fetchCustomerData}
              className="border border-white/20 hover:bg-white/10 flex h-[42px] text-xs items-center rounded-full px-6 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none active:scale-100 justify-center"
            >
              Refresh
            </button>
          </div>
        </>
      ),
    },
  ];

  const handleTab = (activeTab) => {
    setTab(activeTab);
  };

  return (
    <>
      <div className="pb-4">
        <div className="p-3 rounded-xl bg-black/50 flex items-center justify-center max-w-[max-content] mx-auto">
          {tabData.map((item, key) => (
            <button
              onClick={() => handleTab(key)}
              key={key}
              className={`${tab == key && "bg-[#df723b]"} rounded flex items-center justify-center text-xs px-3 py-2`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
      <div className="tabContent">{tabData[tab].component}</div>
    </>
  );
};

export default AddBankDetail;
