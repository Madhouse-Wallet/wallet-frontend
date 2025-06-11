import React, { useState, useEffect, useRef } from "react";
import { Country, State } from "country-state-city";
import iso3166 from "iso-3166-1";
import SpherePayAPI from "../api/spherePayApi";

const Step2 = ({
  step,
  setStep,
  userEmail,
  setCustomerID,
  setCountryCode,
  setStateCode,
}) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [stateSearchTerm, setStateSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const countryDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);

  function getCountryFlagEmoji(countryCode) {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt())
      );
  }

  const allCountries = Country.getAllCountries().map((country) => {
    const isoCountry = iso3166.whereAlpha2(country.isoCode);
    return {
      code: country.isoCode, // 2-digit code (needed for state lookup)
      alpha3: isoCountry ? isoCountry.alpha3 : country.isoCode, // 3-digit code
      name: country.name,
      emoji: getCountryFlagEmoji(country.isoCode), // Placeholder flag
    };
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setIsCountryOpen(false);
      }
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target)
      ) {
        setIsStateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
    setCountrySearchTerm("");

    const countryStates = State.getStatesOfCountry(country.code);
    setStates(countryStates);
    setSelectedState(null);
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setIsStateOpen(false);
    setStateSearchTerm("");
  };

  const filteredCountries = allCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
      country.alpha3.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const filteredStates = states.filter(
    (state) =>
      state.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      state.isoCode.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  const createNewCustomer = async (email, countryCode, stateCode) => {
    setIsLoading(true);
    setError("");

    const customerData = {
      type: "individual",
      email: email,
      address: {
        state: stateCode,
        country: countryCode,
      },
    };

    try {
      const response = await SpherePayAPI.createCustomer(customerData);
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
      setError(error?.response?.data?.message || "Failed to create customer");
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!selectedCountry) {
      setError("Please select a country");
      return;
    }

    if (states.length > 0 && !selectedState) {
      setError("Please select a state");
      return;
    }

    const countryCode = selectedCountry.alpha3; // Using the 3-digit code
    const stateCode = selectedState ? selectedState.isoCode : "";

    const email = userEmail; // Fallback if email not provided

    setCountryCode(countryCode);
    setStateCode(stateCode);
    setStep("PolicyKycStep");

    // const response = await createNewCustomer(email, countryCode, stateCode);

    // if (response && response.error) {
    //   if (
    //     response?.error?.response?.data?.error ===
    //     "customer/unsupported-country"
    //   ) {
    //     setError("Location not supported");
    //   } else {
    //     setError(
    //       response?.error?.response?.data?.message || "An error occurred"
    //     );
    //   }
    // } else {
    //   setCustomerID(response?.data?.customer?.id);
    //   setStep("PolicyKycStep");
    // }
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
        <form className="mt-5">
          <div className="py-2">
            <label
              htmlFor="country"
              className="form-label m-0 font-medium text-[12px] ml-3 pb-2 block"
            >
              Operating residency
            </label>
            <div className="dropdown w-full relative" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="flex items-center justify-between border-white/10 bg-white/4 hover:bg-white/6 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 text-white/70 w-full border-px md:border-hpx px-5 py-2 text-xs font-medium transition-colors duration-300 focus-visible:outline-none h-12 rounded-full"
              >
                {selectedCountry ? (
                  <>
                    <span>{selectedCountry.emoji}</span>
                    <span className="ml-2">{selectedCountry.name}</span>
                  </>
                ) : (
                  "Select Country"
                )}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              {isCountryOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="sticky top-0 bg-white p-2 border-b">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md text-black text-sm"
                      placeholder="Search countries..."
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                    />
                  </div>
                  <ul className="py-1">
                    {filteredCountries.map((country) => (
                      <li key={country.code}>
                        <button
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="mr-2">{country.emoji}</span>
                          {country.name} ({country.alpha3})
                        </button>
                      </li>
                    ))}
                    {filteredCountries.length === 0 && (
                      <li className="px-4 py-2 text-sm text-gray-500">
                        No countries found
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {selectedCountry && states.length > 0 && (
            <div className="py-2">
              <label
                htmlFor="state"
                className="form-label m-0 font-medium text-[12px] ml-3 pb-2 block"
              >
                State / Province
              </label>
              <div className="dropdown w-full relative" ref={stateDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsStateOpen(!isStateOpen)}
                  className="flex items-center justify-between border-white/10 bg-white/4 hover:bg-white/6 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 text-white/70 w-full border-px md:border-hpx px-5 py-2 text-xs font-medium transition-colors duration-300 focus-visible:outline-none h-12 rounded-full"
                >
                  {selectedState ? selectedState.name : "Select State"}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                {isStateOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="sticky top-0 bg-white p-2 border-b">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md text-black text-sm"
                        placeholder="Search states..."
                        value={stateSearchTerm}
                        onChange={(e) => setStateSearchTerm(e.target.value)}
                      />
                    </div>
                    <ul className="py-1">
                      {filteredStates.map((state) => (
                        <li key={state.isoCode}>
                          <button
                            type="button"
                            onClick={() => handleStateSelect(state)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {state.name} ({state.isoCode})
                          </button>
                        </li>
                      ))}
                      {filteredStates.length === 0 && (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          No states found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="py-2">
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          )}

          <div className="py-4">
            <div className="flex items-center justify-center">
              <button
                onClick={handleContinue}
                type="submit"
                disabled={isLoading}
                className="commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Step2;
