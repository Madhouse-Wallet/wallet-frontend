import React, { useState, useEffect } from "react";
import SpherePayAPI from "../api/spherePayApi";
import { useSelector } from "react-redux";

const Step3 = ({
  step,
  setStep,
  setIdentitySRC,
  setTermsSRC,
  customerId,
  countryCode,
  stateCode,
  email,
  setCustomerID,
}) => {
  const userAuth = useSelector((state) => state.Auth);
  const [kycStatus, setKycStatus] = useState("pending");
  const [tosStatus, setTosStatus] = useState("pending");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
      setError(error?.response?.data?.message || "Failed to create customer");
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const TermsOfServiceCustomer = async () => {
    try {
      if (customerId === "") {
        const response = await createNewCustomer(email, countryCode, stateCode);

        if (response && response.error) {
          if (
            response?.error?.response?.data?.error ===
            "customer/unsupported-country"
          ) {
            setError("Location not supported");
          } else {
            setError(
              response?.error?.response?.data?.message || "An error occurred"
            );
          }
        } else {
          // const setFee = await SpherePayAPI.transferFee({
          //   bpsFee: process.env.NEXT_PUBLIC_SPHEREPAY_FEE,
          //   targetCustomerId: response?.data?.customer?.id,
          // });
          const result = await SpherePayAPI.createTosLink(
            response?.data?.customer?.id
          );
          setCustomerID(response?.data?.customer?.id);
          return result;

          // setStep("PolicyKycStep");
        }
      } else {
        const result = await SpherePayAPI.createTosLink(customerId);
        return result;
      }
    } catch (error) {
      console.error("Error creating ToS link:", error);
    }
  };

  // KYC API call
  const kycCustomer = async () => {
    try {
      if (customerId === "") {
        const response = await createNewCustomer(email, countryCode, stateCode);

        if (response && response.error) {
          if (
            response?.error?.response?.data?.error ===
            "customer/unsupported-country"
          ) {
            setError("Location not supported");
          } else {
            setError(
              response?.error?.response?.data?.message || "An error occurred"
            );
          }
        } else {
          // const setFee = await SpherePayAPI.transferFee({
          //   bpsFee: process.env.NEXT_PUBLIC_SPHEREPAY_FEE,
          //   targetCustomerId: response?.data?.customer?.id,
          // });
          const result = await SpherePayAPI.createKycLink(
            response?.data?.customer?.id
          );
          setCustomerID(response?.data?.customer?.id);
          return result;
          // setStep("PolicyKycStep");
        }
      } else {
        const result = await SpherePayAPI.createKycLink(customerId);
        return result;
      }

      // const response = await SpherePayAPI.createKycLink(customerId);
      // return response;
    } catch (error) {
      console.error("Error creating KYC link:", error);
    }
  };


  const handleTermsClick = async () => {
    try {
      // Open blank window immediately on user click
      const newWindow = window.open("about:blank", "_blank");

      const response = await TermsOfServiceCustomer();
      if (response && newWindow) {
        setTermsSRC(response);
        newWindow.location.href = response?.link;
      } else if (newWindow) {
        newWindow.close();
      }
    } catch (error) {
      console.error("Error processing Terms of Service:", error);
      // Close window if error occurs
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
    }
  };

  const handleIdentityClick = async () => {
    try {
      // Open blank window immediately on user click
      const newWindow = window.open("about:blank", "_blank");

      const response = await kycCustomer();
      if (response && newWindow) {
        setIdentitySRC(response);
        newWindow.location.href = response?.url;
      } else if (newWindow) {
        newWindow.close();
      }
    } catch (error) {
      console.error("Error processing Identity Verification:", error);
      // Close window if error occurs
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
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

  const addCustomerWallet = async () => {
    try {
      const walletData = {
        customer: customerId,
        network: process.env.NEXT_PUBLIC_SPHEREPAY_NETWORK,
        address: userAuth?.walletAddress,
      };

      const response = await SpherePayAPI.addWallet(walletData);
      return response;
    } catch (error) {
      console.error("Error adding wallet:", error);
    }
  };

  useEffect(() => {
    const checkCustomerStatus = async () => {
      setIsLoading(true);
      try {
        const response = await getCustomer();
        const customer = response?.data?.customer;

        if (!customer) {
          setIsLoading(false);
          setKycStatus("");
          setTosStatus("");
          return;
        }

        const { kyc, tos } = customer;

        setKycStatus(kyc || "pending");
        setTosStatus(tos || "pending");

        if (kyc === "approved" && tos === "approved") {
          await addCustomerWallet();
          setStep("addBankDetail");
        }
      } catch (error) {
        console.error("Error checking customer status:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    // if (customerId) {
    checkCustomerStatus();
    // }
  }, [customerId, setStep]);

  const getButtonProps = (status) => {
    switch (status) {
      case "approved":
        return {
          text: "Complete",
          disabled: true,
          className: "bg-green-600 text-white cursor-not-allowed opacity-80",
        };
      case "pending":
        return {
          text: "Pending",
          disabled: false,
          className: "bg-yellow-600 text-white cursor-allowed opacity-80",
        };
      case "rejected":
        return { text: "Retry", disabled: false, className: "commonBtn" };
      default:
        return { text: "Start", disabled: false, className: "commonBtn" };
    }
  };

  const tosButtonProps = getButtonProps(tosStatus);
  const kycButtonProps = getButtonProps(kycStatus);

  return (
    <>
      <div className="formWrpper mx-auto max-w-[700px] mt-5 bg-black/50 rounded-20 p-5 md:p-8">
        <div className="pb-4">
          <div className="flex gap-3 items-center">
            {!customerId && (
              <button
                onClick={() => setStep("select-country")}
                className="border-0 themeClr p-0"
              >
                {backIcn}
              </button>
            )}

            <h4 className="m-0 themeClr text-[28px] font-semibold">
              Get started
            </h4>
          </div>
          <p className="m-0 text-xs">
            Start transferring between USD and crypto in a few simple steps.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="mt-5">
            <ul className="list-none pl-0 mb-0">
              <li className="py-2">
                <div className="bg-black/50 p-4 rounded-xl flex-wrap flex items-center justify-between gap-3">
                  <div className="left flex items-center gap-3">
                    <div className="icnWrpper"></div>
                    <div className="content">
                      <div className="inline-flex text-xs items-center justify-center rounded-full h-[20px] w-[20px] bg-[#e79064] border-[#df723b] text-white border">
                        1
                      </div>
                      <h4 className="m-0 font-medium text-base">
                        Terms of Service
                      </h4>
                      <p className="m-0 text-xs text-white/50">
                        This application uses Sphere and other 3rd parties to
                        securely move funds.
                      </p>
                      {tosStatus === "approved" && (
                        <span className="text-xs text-green-400 mt-1 inline-block">
                          ✓ Approved
                        </span>
                      )}
                      {tosStatus === "pending" && (
                        <span className="text-xs text-yellow-400 mt-1 inline-block">
                          ⟳ In progress
                        </span>
                      )}
                      {tosStatus === "rejected" && (
                        <span className="text-xs text-red-400 mt-1 inline-block">
                          ✗ Requires attention
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleTermsClick}
                    disabled={tosButtonProps.disabled}
                    className={`flex items-center justify-center px-3 py-2 rounded text-xs font-medium ${tosButtonProps.className}`}
                  >
                    {tosButtonProps.text}
                  </button>
                </div>
              </li>
              <li className="py-2">
                <div className="bg-black/50 p-4 rounded-xl flex-wrap flex items-center justify-between gap-3">
                  <div className="left flex items-center gap-3">
                    <div className="icnWrpper"></div>
                    <div className="content">
                      <div className="inline-flex text-xs items-center justify-center rounded-full h-[20px] w-[20px] bg-[#e79064] border-[#df723b] text-white border">
                        2
                      </div>
                      <h4 className="m-0 font-medium text-base">
                        Verify identity
                      </h4>
                      <p className="m-0 text-xs text-white/50">
                        KYC check is the mandatory process of identifying and
                        verifying identity.
                      </p>
                      {kycStatus === "approved" && (
                        <span className="text-xs text-green-400 mt-1 inline-block">
                          ✓ Approved
                        </span>
                      )}
                      {kycStatus === "pending" && (
                        <span className="text-xs text-yellow-400 mt-1 inline-block">
                          ⟳ In progress
                        </span>
                      )}
                      {kycStatus === "rejected" && (
                        <span className="text-xs text-red-400 mt-1 inline-block">
                          ✗ Requires attention
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleIdentityClick}
                    disabled={kycButtonProps.disabled}
                    className={`flex items-center justify-center px-3 py-2 rounded text-xs font-medium ${kycButtonProps.className}`}
                  >
                    {kycButtonProps.text}
                  </button>
                </div>
              </li>
            </ul>

            {error && (
              <div className="py-2">
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}

            {tosStatus === "approved" && kycStatus === "approved" && (
              <div className="mt-4 p-4 bg-green-500/20 rounded-xl text-center">
                <p className="text-green-300 text-sm mb-2">
                  Both verifications complete!
                </p>
                <button
                  onClick={() => {
                    addCustomerWallet();
                    setStep("addBankDetail");
                  }}
                  className="commonBtn px-4 py-2 text-xs"
                >
                  Continue to Add Bank Details
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Step3;

const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
