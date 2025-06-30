import React, { useState, useEffect } from "react";
import { isValidName, isValidNumber } from "@/utils/helper";
import { useSelector } from "react-redux";

const AddBankDetail = ({ step, setStep, customerId }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [formData, setFormData] = useState({
    accountName: "",
    bankName: "",
    accountType: "",
    accountNumber: "",
    routingNumber: "",
    street: "",
    city: "",
    state: "",
    country: "US",
    postalCode: "",
  });

  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });

  const accounttype = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Saving" },
  ];

  const countries = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
    // Add more countries as needed
  ];

  const networkOptions = [
    { value: "SWIFT", label: "SWIFT" },
    { value: "ACH", label: "ACH" },
    { value: "WIRE", label: "Wire Transfer" },
  ];

  const identifierStandards = [
    { value: "iban", label: "IBAN" },
    { value: "account_number", label: "Account Number" },
    { value: "routing_number", label: "Routing Number" },
  ];

  useEffect(() => {
    if (tab === 1) {
      fetchParties();
    }
  }, [tab]);

  const fetchParties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This would typically fetch all parties for the current user/customer
      // For now, we'll implement a simple approach
      // You might want to modify this based on your backend structure
      // const response = await fetch("/api/parties");

      const response = await fetch(`/api/parties/${userAuth?.email}`, {
        method: "GET",
      });

      const result = await response.json();
      console.log("line-74", result);
      if (result) {
        const data = result;
        setParties(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch parties");
      }
    } catch (err) {
      console.error("Error fetching parties:", err);
      setError("Failed to load bank accounts. Please try again.");
      setParties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log("Field change:", id, value);

    // Apply validation rules based on the field
    if (
      (id === "accountName" ||
        id === "bankName" ||
        id === "city" ||
        id === "state") &&
      !isValidName(value, 50)
    ) {
      return; // invalid name, do not update
    }

    if (
      (id === "accountNumber" && !isValidNumber(value, 34)) || // IBAN can be up to 34 chars
      // (id === "routingNumber" && !isValidNumber(value, 15)) ||
      (id === "postalCode" && !isValidNumber(value, 10))
    ) {
      return; // invalid number, do not update
    }

    // Valid input, update state
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

    // if (!formData.accountType.trim()) {
    //   newErrors.accountType = "Account type is required";
    // }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    // if (!formData.routingNumber.trim()) {
    //   newErrors.routingNumber = "Routing number is required";
    // }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
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
      // Prepare party data according to the API structure
      const partyData = {
        type: "individual",
        name: {
          name: formData.accountName,
        },
        accounts: [
          {
            type: "bank",
            identifier: {
              standard: "account_number",
              value: formData.accountNumber,
            },
            network: "SWIFT", // You can make this dynamic if needed
            currencies: ["USD"], // You can make this dynamic
            provider: {
              name: formData.bankName,
              country: formData.country,
              networkIdentifier: "BOFAUS3N",
            },
            addresses: [
              {
                type: "postal",
                street: formData.street,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                postalCode: formData.postalCode,
              },
            ],
          },
        ],
      };
      const userId = userAuth?.id;
      const response = await fetch("/api/parties/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(partyData),
        body: JSON.stringify({
          ...partyData,
          userId,
        }),
      });

      if (response.ok) {
        const result = await response.json();

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
          street: "",
          city: "",
          state: "",
          country: "US",
          postalCode: "",
        });

        // Switch to List tab and fetch updated data
        setTab(1);
        fetchParties();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create party");
      }
    } catch (error) {
      console.error("Error creating party:", error);
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
    switch (status?.toLowerCase()) {
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

  // Function to get party details for display
  const getPartyDisplayInfo = (partyy) => {
    console.log("line-281", partyy);
    const party = partyy?.data;
    const account = party.accounts?.[0] || {};
    const address = account.addresses?.[0] || {};

    return {
      id: party.id,
      accountName: party.name?.name || "N/A",
      bankName: account.provider?.name || "N/A",
      // accountType: account.type || "bank",
      accountNumber: account.identifier?.value || "N/A",
      // routingNumber: account.provider?.networkIdentifier || "N/A",
      status: party.status || "pending",
      currency: account.currencies?.[0] || "USD",
      created: party.createdAt || party.created || new Date().toISOString(),
      network: account.network || "N/A",
      country: address.country || "N/A",
      city: address.city || "N/A",
    };
  };

  const tabData = [
    {
      title: "Bank Account",
      component: (
        <>
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Add Bank Account
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

                {/* <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="accountType"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Account Type
                  </label>
                  <select
                    id="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none ${
                      errors.accountType ? "border-red-500" : ""
                    }`}
                  >
                    <option value="" disabled>
                      Select Account Type
                    </option>
                    {accounttype.map((option) => (
                      <option
                        className="text-black"
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.accountType && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.accountType}
                    </p>
                  )}
                </div> */}

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

                {/* <div className="md:col-span-6 col-span-12">
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
                </div> */}

                <div className="col-span-12">
                  <h5 className="text-lg font-semibold mb-3 text-white/80">
                    Address Information
                  </h5>
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="street"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Street Address
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.street ? "border-red-500" : ""
                    }`}
                    placeholder="Enter street address"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.street}
                    </p>
                  )}
                </div>

                <div className="md:col-span-6 col-span-12">
                  <label
                    htmlFor="city"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.city ? "border-red-500" : ""
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div className="md:col-span-4 col-span-12">
                  <label
                    htmlFor="state"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.state ? "border-red-500" : ""
                    }`}
                    placeholder="Enter state"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.state}
                    </p>
                  )}
                </div>

                <div className="md:col-span-4 col-span-12">
                  <label
                    htmlFor="country"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="border-white/10 bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                  >
                    {countries.map((option) => (
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

                <div className="md:col-span-4 col-span-12">
                  <label
                    htmlFor="postalCode"
                    className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                  >
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                      errors.postalCode ? "border-red-500" : ""
                    }`}
                    placeholder="Enter postal code"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs mt-1 pl-3">
                      {errors.postalCode}
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
                      {isSubmitting
                        ? "Creating Party..."
                        : "Create Bank Account"}
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
      title: "List Accounts",
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
          ) : parties.length === 0 ? (
            <div className="bg-white/10 p-6 rounded-lg mt-4 text-center">
              <p className="text-white/60">
                No bank accounts found. Add your first bank account in the "Bank
                Account" tab.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {parties.map((party) => {
                const displayInfo = getPartyDisplayInfo(party);
                return (
                  <div
                    key={displayInfo.id}
                    className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="text-lg font-semibold">
                          {displayInfo.bankName}
                        </h5>
                        <p className="text-sm text-white/70">
                          {displayInfo.accountName}
                        </p>
                      </div>
                      <div
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(displayInfo.status)} bg-white/10`}
                      >
                        {displayInfo.status.charAt(0).toUpperCase() +
                          displayInfo.status.slice(1)}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 grid-cols-2 gap-3 mt-3">
                      {/* <div>
                        <p className="text-xs text-white/50">Account Type</p>
                        <p className="text-sm">{displayInfo.accountType}</p>
                      </div> */}
                      <div>
                        <p className="text-xs text-white/50">Account Number</p>
                        <p className="text-sm">
                          ••••{displayInfo.accountNumber.slice(-4)}
                        </p>
                      </div>
                      {/* <div>
                        <p className="text-xs text-white/50">Routing Number</p>
                        <p className="text-sm">{displayInfo.routingNumber}</p>
                      </div> */}
                      <div>
                        <p className="text-xs text-white/50">Currency</p>
                        <p className="text-sm">
                          {displayInfo.currency.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Network</p>
                        <p className="text-sm">{displayInfo.network}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Country</p>
                        <p className="text-sm">{displayInfo.country}</p>
                      </div>
                      <div className="md:col-span-3 col-span-2">
                        <p className="text-xs text-white/50">Created</p>
                        <p className="text-sm">
                          {new Date(displayInfo.created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              onClick={fetchParties}
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
