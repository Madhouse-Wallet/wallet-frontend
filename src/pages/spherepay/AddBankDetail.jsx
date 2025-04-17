import React, { useState } from "react";
import SpherePayAPI from "../api/spherePayApi";

const AddBankDetail = ({ step, setStep, customerId }) => {
  // Form state
  const [formData, setFormData] = useState({
    accountName: "",
    bankName: "",
    accountType: "",
    accountNumber: "",
    // contactNumber: "",
    routingNumber: "", // Added routing number as it's required in the API but not in the form
  });

  // Validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });

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

    // if (formData.contactNumber && !/^\d+$/.test(formData.contactNumber)) {
    //   newErrors.contactNumber = "Contact number should only contain digits";
    // }

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
        // "currency": "usd",
      };

      const response = await SpherePayAPI.addBankAccount(
        customerId,
        bankAccountData
      );
      console.log("Bank account added successfully:", response);

      setSubmitMessage({
        type: "success",
        message: "Bank account added successfully!",
      });

      // If needed, move to next step
      // if (setStep && typeof setStep === "function") {
      //   setTimeout(() => setStep(step + 1), 1500);
      // }
      setStep("welcome");
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

  return (
    <>
      <div className="formWrpper mx-auto max-w-[700px] mt-5 bg-black/50 rounded-20 p-5 md:p-8">
        <div className="pb-4">
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Enter Your Bank Details
          </h4>
          <p className="m-0 text-xs">
            Start transferring between USD and crypto in a few simple steps.
          </p>
        </div>

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

              {/* <div className="md:col-span-6 col-span-12">
                <label
                  htmlFor="contactNumber"
                  className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
                >
                  Contact No.
                </label>
                <input
                  id="contactNumber"
                  type="text"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                    errors.contactNumber ? "border-red-500" : ""
                  }`}
                  placeholder="Enter contact no."
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1 pl-3">
                    {errors.contactNumber}
                  </p>
                )}
              </div> */}

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
      </div>
    </>
  );
};

export default AddBankDetail;
