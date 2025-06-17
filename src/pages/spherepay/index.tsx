import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { BackBtn } from "@/components/common";
import SpherePayAPI from "../api/spherePayApi.js";
import Step1 from "./step1.jsx";
import Step2 from "./step2.jsx";
import Step3 from "./step3.jsx";
import TabbedComponent from "./tabbedComponent.jsx";
import TermsOfServiceStep from "./TermsOfServiceStep.jsx";
import VerifyIdentity from "./VerifyIdentity.jsx";
import { useSelector } from "react-redux";

function Spharepay() {
  const userAuth = useSelector((state: any) => state.Auth);

  const [step, setStep] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [customerId, setCustomerID] = useState("");
  const [termasSRC, setTermsSRC] = useState("");
  const [identitySRC, setIdentitySRC] = useState("");

  const router = useRouter();

  const createNewCustomer = async (type: any, email: any) => {
    const customerData = {
      type: type, // Use the dynamic type parameter
      email: email, // Use the email from user input
    };

    try {
      const response = await SpherePayAPI.createCustomer(customerData);
      return response;
    } catch (error: any) {
      return { error: error.response.data };
    }
  };

  useEffect(() => {
    if (!userAuth?.email) {
      router.push("/welcome");
      // return;
    }
    const fetchData = async () => {
      const response = await createNewCustomer("individual", userAuth?.email);
      const message = response?.error?.message;

      const match = message.match(/id:\s*(customer_[a-zA-Z0-9]+)/);
      const customerId = match ? match[1] : null;

      if (response && response.error) {
        if (
          response.error.error === "customer/duplicate" ||
          (response.error.message &&
            response.error.message.includes("duplicate"))
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

    fetchData();
  }, []);

  return (
    <>
      <section className="ifrmae   relative">
        <div className="container relative">
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12">
              <div className=" col-span-12  z-10">
                <div
                  className={` sectionHeader  px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
                >
                  <div className="flex align-items-center gap-3 pb-3">
                    <BackBtn />
                    <h4 className="m-0 text-[18px] sm:text-[20px] font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Spherepay
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-span-12">
                <div className="">
                  {step == "welcome" ? (
                    <>
                      <Step1
                        step={step}
                        setStep={setStep}
                        email={email}
                        setEmail={setEmail}
                        setCustomerID={setCustomerID}
                      />
                    </>
                  ) : step == "select-country" ? (
                    <>
                      <Step2
                        step={step}
                        setStep={setStep}
                        userEmail={userAuth?.email}
                        setCustomerID={setCustomerID}
                        setCountryCode={setCountryCode}
                        setStateCode={setStateCode}
                      />
                    </>
                  ) : step == "PolicyKycStep" ? (
                    <>
                      <Step3
                        step={step}
                        setStep={setStep}
                        email={userAuth?.email}
                        setTermsSRC={setTermsSRC}
                        setIdentitySRC={setIdentitySRC}
                        setCustomerID={setCustomerID}
                        customerId={customerId}
                        countryCode={countryCode}
                        stateCode={stateCode}
                      />
                    </>
                  ) : step == "TermsOfService" ? (
                    <>
                      <TermsOfServiceStep
                        src={"https://spherepay.co/ramp"}
                        step={step}
                        setStep={setStep}
                        customerId={customerId}
                        termasSRC={termasSRC}
                      />
                    </>
                  ) : step == "VerifyIdentity" ? (
                    <>
                      <VerifyIdentity
                        src={"https://spherepay.co/ramp"}
                        step={step}
                        setStep={setStep}
                        customerId={customerId}
                        identitySRC={identitySRC}
                      />
                    </>
                  ) : step == "addBankDetail" ? (
                    <>
                      <TabbedComponent
                        customerId={customerId}
                        step={step}
                        setStep={setStep}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Spharepay;
