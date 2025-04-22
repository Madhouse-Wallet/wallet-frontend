import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
// src/pages/sphere/page.tsx
import SphereRampWidget from "@/components/SphereWidget/SphereRampWidget";
import Wlogomw from "@/Assets/Images/logow1.png";
import styled from "styled-components";
import { useTheme } from "@/ContextApi/ThemeContext";
import { BackBtn } from "@/components/common";
import SpherePayAPI from "../api/spherePayApi.js";
import Step1 from "./step1.jsx";
import Step2 from "./step2.jsx";
import Step3 from "./step3.jsx";
import AddBankDetail from "./AddBankDetail.jsx";
import TabbedComponent from "./tabbedComponent.jsx";
import TermsOfServiceStep from "./TermsOfServiceStep.jsx";
import VerifyIdentity from "./VerifyIdentity.jsx";
import Sidebar from "./Sidebar.jsx";

function Spharepay() {
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState("welcome");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState(0);
  const [customerId, setCustomerID] = useState("");
  const [termasSRC, setTermsSRC] = useState("");
  const [identitySRC, setIdentitySRC] = useState("");

  const tabData = [
    {
      icn: bankIcn,
      title: "My Accounts",
      components: "asdafsdfasdfasd asdfasdfasdfas",
    },
    {
      icn: transferIcn,
      title: "Transfer History",
      components: "asdafsdfasdfasd asdfasdfasdfas",
    },
  ];

  const router = useRouter();
  const themeSphere = {
    color: "gray" as const,
    radius: "lg" as const,
    components: {
      logo: `./logow1.png`, // Add your logo to the public folder
    },
  };

  const createNewCustomer = async () => {
    const customerData = {
      type: "individual",
      // firstName: "Perry",
      // lastName: "Kumar",
      email: "riteshd@test.co",
      // phoneNumber: "+917688862985",
      // address: {
      //   line1: "Ganeshpura",
      //   city: "Beawar",
      //   postalCode: "305901",
      //   state: "RJ",
      //   country: "IND",
      // },
      // dob: {
      //   month: 2,
      //   day: 18,
      //   year: 2000,
      // },
    };

    try {
      const response = await SpherePayAPI.createCustomer(customerData);
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const getCustomer = async () => {
    try {
      const response = await SpherePayAPI.getCustomer(
        "customer_80e5b83cddc547ae8e5a167a71ee550b"
      );
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const TermsOfServiveCustomer = async () => {
    try {
      const response = await SpherePayAPI.createTosLink(
        "customer_80e5b83cddc547ae8e5a167a71ee550b"
      );
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const kycCustomer = async () => {
    try {
      const response = await SpherePayAPI.createKycLink(
        "customer_80e5b83cddc547ae8e5a167a71ee550b"
      );
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  // Call the addWallet function
  const addCustomerWallet = async () => {
    try {
      const walletData = {
        customer: "customer_80e5b83cddc547ae8e5a167a71ee550b", // Replace with actual customer ID
        network: "arbitrum", // Blockchain network (e.g., Solana)
        address: "0xAbb188AA605E5A0AF65d4029ACAca04Bf26ECb4d", // Replace with actual wallet address
      };

      const response = await SpherePayAPI.addWallet(walletData);
      console.log("Wallet added successfully:", response);
      return response;
    } catch (error) {
      console.error("Error adding wallet:", error);
    }
  };

  // Call the addBankAccount function
  const addCustomerBankAccount = async () => {
    try {
      const customerId = "customer_80e5b83cddc547ae8e5a167a71ee550b"; // Replace with actual customer ID

      const bankAccountData = {
        customer: customerId,
        accountName: "Heramb Sharan Sharma",
        bankName: "Bank of Baroda",
        accountType: "savings",
        accountNumber: "06620100031733",
        routingNumber: "7688962985",
      };

      const response = await SpherePayAPI.addBankAccount(
        customerId,
        bankAccountData
      );
      console.log("Bank account added successfully:", response);
      return response;
    } catch (error) {
      console.error("Error adding bank account:", error);
    }
  };

  const initiateTransfer = async () => {
    try {
      const transferData = {
        customer: "customer_80e5b83cddc547ae8e5a167a71ee550b", // Replace with actual customer ID
        amount: "100",
        source: {
          id: "bankAccount_bfe977f4b212418e82723d10e8a7a6c2", // Replace with actual bank account ID
          network: "wire",
          currency: "usd",
        },
        destination: {
          id: "wallet_a07d92af200b4500a9c8e19725009fbb", // Replace with actual wallet ID
          network: "arbitrum",
          currency: "usdc",
        },
      };

      const response = await SpherePayAPI.createTransfer(transferData);
      console.log("Transfer initiated successfully:", response);
      return response;
    } catch (error) {
      console.error("Error initiating transfer:", error);
    }
  };

  const initiateWalletToBankTransfer = async () => {
    try {
      const transferData = {
        customer: "customer_80e5b83cddc547ae8e5a167a71ee550b", // Replace with actual customer ID
        amount: "100",
        source: {
          id: "wallet_a07d92af200b4500a9c8e19725009fbb", // Replace with actual wallet ID
          network: "arbitrum",
          currency: "usdc",
        },
        destination: {
          id: "bankAccount_bfe977f4b212418e82723d10e8a7a6c2", // Replace with actual bank account ID
          network: "wire",
          currency: "usd",
        },
      };

      const response =
        await SpherePayAPI.createWalletToBankTransfer(transferData);
      console.log("Wallet to bank transfer initiated successfully:", response);
      return response;
    } catch (error) {
      console.error("Error initiating wallet to bank transfer:", error);
    }
  };

  useEffect(() => {
    // createNewCustomer();
    // getCustomer();
    // TermsOfServiveCustomer();
    // kycCustomer();
    // addCustomerWallet();
    // addCustomerBankAccount();
    // initiateTransfer();
    // initiateWalletToBankTransfer();
  }, []);


  return (
    <>
      {/* <SpherePaysec className="ifrmae pt-12 relative"> */}
      <section className="ifrmae pt-12 relative">
        <div className="container relative">
          {/* <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button> */}
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
              {/* <div className="col-span-12">
                <Wrpper>
                  <SphereRampWidget
                    applicationId={process.env.NEXT_PUBLIC_SPHERE_APP_ID || ""}
                    // debug={process.env.NODE_ENV === 'development'}
                    debug={false}
                    theme={themeSphere}
                  />
                </Wrpper>
              </div> */}
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
                        userEmail={email}
                        setCustomerID={setCustomerID}
                      />
                    </>
                  ) : step == "PolicyKycStep" ? (
                    <>
                      <Step3
                        step={step}
                        setStep={setStep}
                        setTermsSRC={setTermsSRC}
                        setIdentitySRC={setIdentitySRC}
                        customerId={customerId}
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
      {/* </SpherePaysec> */}
    </>
  );
}

const SpherePaysec = styled.section`
  .ramp-bg-background {
    background-color: #00000099;
  }
  div#sphere-ramp-container div#sphere-ramp > .ramp-absolute {
    display: none;
  }
  input {
    background-color: #00000099;
    height: 45px;
    font-size: 12px;
  }
  button {
    color: #fff !important;
  }
  button[variant="outline"]:hover {
    background: #00000099 !important;
    color: #fff;
  }

  .ramp-text-primary {
    color: #fff !important;
  }
  @media (max-width: 575px) {
    div#sphere-ramp-container .ramp-w-dvw {
      position: unset !important;
    }
  }
`;

const Wrpper = styled.div`
  position: relative;
  div#sphere-ramp-container {
    .ramp-w-dvw {
      width: 100%;
    }
    form.ramp-w-full button span {
      color: #fff;
    }
  }
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

const bankIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 8V12.001H3V18H2V21H18L21 21.001L22 21V18H21V12.001H22V8L12 2L2 8ZM6 18V12.001H8V18H6ZM11 18V12.001H13V18H11ZM18 18H16V12.001H18V18ZM14 8C13.9999 8.26271 13.9481 8.52283 13.8475 8.76552C13.7469 9.00821 13.5995 9.2287 13.4137 9.41442C13.2279 9.60014 13.0073 9.74744 12.7646 9.84791C12.5219 9.94839 12.2617 10.0001 11.999 10C11.7363 9.99993 11.4762 9.94812 11.2335 9.84753C10.9908 9.74693 10.7703 9.59952 10.5846 9.41371C10.3989 9.2279 10.2516 9.00733 10.1511 8.7646C10.0506 8.52186 9.99893 8.26171 9.999 7.999C9.99913 7.46843 10.21 6.95965 10.5853 6.58458C10.9605 6.20951 11.4694 5.99887 12 5.999C12.5306 5.99913 13.0393 6.21003 13.4144 6.58529C13.7895 6.96055 14.0001 7.46943 14 8Z"
      fill="currentColor"
    />
  </svg>
);

const transferIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 10H4L9.5 4M4 14H20L14.5 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
