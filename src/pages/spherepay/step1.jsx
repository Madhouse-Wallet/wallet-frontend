import React, { useState } from "react";
import SpherePayAPI from "../api/spherePayApi";
import PrimaryButton from "@/components/common/PrimaryButton";

const Step1 = ({ step, setStep, email, setEmail, setCustomerID }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear any errors when user types
  };

  const createNewCustomer = async (type, email) => {
    const customerData = {
      type: type, // Use the dynamic type parameter
      email: email, // Use the email from user input
    };

    try {
      setIsLoading(true);
      const response = await SpherePayAPI.createCustomer(customerData);
      return response;
    } catch (error) {
      return { error: error.response.data };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    const response = await createNewCustomer("individual", email);
    const message = response?.error?.message;

    const match = message.match(/id:\s*(customer_[a-zA-Z0-9]+)/);
    const customerId = match ? match[1] : null;

    if (response && response.error) {
      if (
        response.error.error === "customer/duplicate" ||
        (response.error.message && response.error.message.includes("duplicate"))
      ) {
        setCustomerID(customerId);
        setStep("PolicyKycStep");
      } else if (
        response.error.message === "Expected country, got undefined or null"
      ) {
        setStep("select-country");
      }
    }
  };

  return (
    <>
      <div className="formWrpper mx-auto max-w-[500px] mt-5 bg-black/50 rounded-20 p-5 md:p-8">
        <div className="pb-4">
          <h4 className="m-0 themeClr text-[32px] font-bold">Welcome</h4>
          <p className="m-0 font-medium">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="py-2">
            <label
              htmlFor="email"
              className="form-label m-0 font-medium text-[14px]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                error ? "border-red-500" : ""
              }`}
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="py-2">
            <div className="flex items-center justify-center gap-3">
              <PrimaryButton type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Sign in"}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Step1;
