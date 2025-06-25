import React, { useState } from "react";

const UserStep = ({ step, setStep }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    registeredType: "tax_identification_number",
    registeredValue: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Registered identifier type options
  const registeredTypeOptions = [
    { value: "tax_identification_number", label: "Tax Identification Number" },
    {
      value: "business_registration_number",
      label: "Business Registration Number",
    },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    if (!formData.registeredValue.trim()) {
      newErrors.registeredValue = "Registered value is required";
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

    setIsLoading(true);

    try {
      // Get user's IP address
      const userIP = "201.144.119.146";

      // Prepare data for API
      const accountData = {
        name: formData.businessName,
        registeredAddress: {
          type: "postal",
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        },
        registeredIdentifier: {
          type: formData.registeredType,
          value: formData.registeredValue,
        },
        termsOfServiceAcceptance: {
          date: new Date().toISOString(),
          ipAddress: userIP,
        },
      };

      // Call the API
      const response = await fetch("/api/business-account/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      const result = await response.json();

      if (response.ok) {
        // Success - move to next step or show success message
        console.log("Business account created successfully:", result);
        // You might want to store the business ID or move to next step
        if (setStep) {
          setStep(step + 1);
        }
      } else {
        // Handle API errors
        console.error("API Error:", result.error);
        setErrors({
          submit: result.error || "Failed to create business account",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="formWrpper mx-auto max-w-[700px] mt-5 bg-black/50 rounded-20 p-5 md:p-8">
        <div className="pb-4">
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Almost there
          </h4>
          <p className="m-0 text-xs">
            We need just a few more details before connecting you in...
          </p>
        </div>

        <form className="mt-5" onSubmit={handleSubmit}>
          <div className="grid gap-3 grid-cols-12">
            {/* Business Name */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="businessName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Business Name *
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.businessName ? "border-red-500" : ""
                }`}
                placeholder="Enter Business Name"
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.businessName}
                </p>
              )}
            </div>

            {/* Street Address */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="street"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Street Address *
              </label>
              <input
                id="street"
                name="street"
                type="text"
                value={formData.street}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.street ? "border-red-500" : ""
                }`}
                placeholder="Enter Street Address"
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.street}
                </p>
              )}
            </div>

            {/* City */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="city"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.city ? "border-red-500" : ""
                }`}
                placeholder="Enter City"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1 pl-3">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="state"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                State *
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.state ? "border-red-500" : ""
                }`}
                placeholder="Enter State"
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1 pl-3">{errors.state}</p>
              )}
            </div>

            {/* Country */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="country"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Country *
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.country ? "border-red-500" : ""
                }`}
                placeholder="Enter Country"
              />
              {errors.country && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.country}
                </p>
              )}
            </div>

            {/* Postal Code */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="postalCode"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Postal Code *
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.postalCode ? "border-red-500" : ""
                }`}
                placeholder="Enter Postal Code"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.postalCode}
                </p>
              )}
            </div>

            {/* Registered Type Dropdown */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="registeredType"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Registered Type *
              </label>
              <select
                id="registeredType"
                name="registeredType"
                value={formData.registeredType}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.registeredType ? "border-red-500" : ""
                }`}
              >
                {registeredTypeOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-black text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.registeredType && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.registeredType}
                </p>
              )}
            </div>

            {/* Registered Value */}
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="registeredValue"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Registered Value *
              </label>
              <input
                id="registeredValue"
                name="registeredValue"
                type="text"
                value={formData.registeredValue}
                onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 ${
                  errors.registeredValue ? "border-red-500" : ""
                }`}
                placeholder="Enter Registered Value"
              />
              {errors.registeredValue && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.registeredValue}
                </p>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4">
              <p className="text-red-500 text-xs text-center">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="py-4 mt-10">
            <div className="flex items-center justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserStep;
