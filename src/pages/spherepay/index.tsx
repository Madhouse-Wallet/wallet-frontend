import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SpherePayAPI from "../api/spherePayApi.js";
import Step1 from "./step1.jsx";
import Step2 from "./step2.jsx";
import Step3 from "./step3.jsx";
import TabbedComponent from "./tabbedComponent.jsx";
import TermsOfServiceStep from "./TermsOfServiceStep.jsx";
import VerifyIdentity from "./VerifyIdentity.jsx";
import { useSelector } from "react-redux";
import styled from "styled-components";

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
      <section className="ifrmae relative h-full flex items-center py-[30px] sm:flex-row flex-col">
        <div className="absolute inset-0 backdrop-blur-xl h-full"></div>

        <div className="px-3 mx-auto relative w-full sm:min-w-[500px] sm:max-w-[max-content]">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[12px] right-[25px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <header className="siteHeader top-0 py-2 w-full z-[999]">
            <div className="">
              <Nav className=" px-3 py-3 rounded-[20px] shadow relative flex items-center justify-center flex-wrap gap-2">
                <div className="left">
                  <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                    Spherepay
                  </h4>
                </div>
              </Nav>
            </div>
          </header>
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 px-2 py-5">
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

const Nav = styled.nav`
  // background: var(--cardBg);
  background: #5c2a28a3;
  backdrop-filter: blur(12.8px);
`;

export default Spharepay;

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);
