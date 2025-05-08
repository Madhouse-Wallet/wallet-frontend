import React, { useState, useEffect } from "react";
import SpherePayAPI from "../api/spherePayApi";
import { useSelector } from "react-redux";

const Step3 = ({ step, setStep, setIdentitySRC, setTermsSRC, customerId }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [kycStatus, setKycStatus] = useState("pending");
  const [tosStatus, setTosStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);

  const TermsOfServiceCustomer = async () => {
    try {
      const response = await SpherePayAPI.createTosLink(customerId);
      return response;
    } catch (error) {
      console.error("Error creating ToS link:", error);
    }
  };

  // KYC API call
  const kycCustomer = async () => {
    try {
      const response = await SpherePayAPI.createKycLink(customerId);
      return response;
    } catch (error) {
      console.error("Error creating KYC link:", error);
    }
  };

  const handleTermsClick = async () => {
    try {
      const response = await TermsOfServiceCustomer();
      setTermsSRC(response); // Store the response in state
      window.open(response?.link, "_blank");
    } catch (error) {
      console.error("Error processing Terms of Service:", error);
    }
  };

  const handleIdentityClick = async () => {
    try {
      const response = await kycCustomer();
      setIdentitySRC(response); // Store the response in state
      window.open(response?.url, "_blank");
    } catch (error) {
      console.error("Error processing Identity Verification:", error);
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
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      checkCustomerStatus();
    }
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
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Get started
          </h4>
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
