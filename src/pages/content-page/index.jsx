import React, { useState } from "react";
import styled from "styled-components";
import Help from "../help";
import PrivacyPolicy from "../privacy-policy";
import LegalNotice from "../legal-notice";
import Documentation from "../documentation";
import { useRouter } from "next/router";
import Link from "next/link";

const ContentPage = () => {
  const router = useRouter();
  const [step, setStep] = useState("all");
  return (
    <>
      <section className="relative dashboard h-full">
        <div className="container relative">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[12px] right-[25px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 md:px-3 pt-3">
              {step == "all" && (
                <div className="col-span-12">
                  <div className="sectionHeader p-2 ">
                    <div className="flex align-items-center gap-3">
                      <h4 className="m-0 text-[18px] sm:text-[20px] font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                        Content Page
                      </h4>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-span-12 ">
                {step == "all" ? (
                  <>
                    <div className="grid gap-3 grid-cols-12 px-3 mt-3">
                      <div className="sm:col-span-6 col-span-12">
                        <CounterCard
                          style={{ border: "1px solid #58585852" }}
                          className="cardCstm bg-white/5 rounded-lg p-3 cursor-pointer"
                        >
                          <h4 className="m-0 font-bold text-xl">
                            Help and Support
                          </h4>
                          <p className="m-0 text-xs pt-2 text-gray-400">
                            Welcome to the Madhouse Wallet Help Center. We're
                            here to assist you with any issues or questions you
                            may have.
                          </p>
                          <div className="btnWrpper mt-3">
                            <button
                              onClick={() => setStep("help")}
                              className="btn inline-flex items-center justify-center text-xs font-semibold h-8 rounded-20 px-3"
                            >
                              Learn More
                            </button>
                          </div>
                        </CounterCard>
                      </div>
                      <div className="sm:col-span-6 col-span-12">
                        <CounterCard
                          style={{ border: "1px solid #58585852" }}
                          className="cardCstm bg-white/5 rounded-lg p-3 cursor-pointer"
                        >
                          <h4 className="m-0 font-bold text-xl">
                            Documentation
                          </h4>
                          <p className="m-0 text-xs pt-2 text-gray-400">
                            Welcome to the official documentation for Madhouse
                            Wallet. This page provides essential information to
                            help you get started and maximize your experience.
                          </p>
                          <div className="btnWrpper mt-3">
                            <button
                              onClick={() => setStep("documentation")}
                              className="btn inline-flex items-center justify-center text-xs font-semibold h-8 rounded-20 px-3"
                            >
                              Learn More
                            </button>
                          </div>
                        </CounterCard>
                      </div>
                      <div className="sm:col-span-6 col-span-12">
                        <CounterCard
                          style={{ border: "1px solid #58585852" }}
                          className="cardCstm bg-white/5 rounded-lg p-3 cursor-pointer"
                        >
                          <h4 className="m-0 font-bold text-xl">
                            Terms of Service
                          </h4>
                          <p className="m-0 text-xs pt-2 text-gray-400">
                            Please read these Terms of Service (the “Terms”) and
                            our Privacy Policy (Privacy Policy v1.0) (“Privacy
                            Policy”) carefully because they govern your use of
                            the website and interface located at
                            https://madhouse-wallet.gitbook.io/docs/contact (the
                            “Site”) and the platform, services, and
                          </p>
                          <div className="btnWrpper mt-3">
                            <button
                              onClick={() => setStep("terms service")}
                              className="btn inline-flex items-center justify-center text-xs font-semibold h-8 rounded-20 px-3"
                            >
                              Learn More
                            </button>
                          </div>
                        </CounterCard>
                      </div>
                      <div className="sm:col-span-6 col-span-12">
                        <CounterCard
                          style={{ border: "1px solid #58585852" }}
                          className="cardCstm bg-white/5 rounded-lg p-3 cursor-pointer"
                        >
                          <h4 className="m-0 font-bold text-xl">
                            Privacy Policy
                          </h4>
                          <p className="m-0 text-xs pt-2 text-gray-400">
                            At Madhouse, we respect the privacy of our users and
                            are committed to protecting their personal
                            information. This page is used to inform visitors
                            regarding our policies regarding the collection,
                            use, and disclosure of Personal Information if
                            anyone decided to use our Service.
                          </p>
                          <div className="btnWrpper mt-3">
                            <button
                              onClick={() => setStep("privacy")}
                              className="btn inline-flex items-center justify-center text-xs font-semibold h-8 rounded-20 px-3"
                            >
                              Learn More
                            </button>
                          </div>
                        </CounterCard>
                      </div>
                      <div className="sm:col-span-6 col-span-12">
                        <CounterCard
                          style={{ border: "1px solid #58585852" }}
                          className="cardCstm bg-white/5 rounded-lg p-3 cursor-pointer"
                        >
                          <h4 className="m-0 font-bold text-xl">
                            Proof of Reserve Reporting
                          </h4>
                          <p className="m-0 text-xs pt-2 text-gray-400">
                            Provide insight into the workings of the Keep and
                            tBTC systems - deposits, redemptions, who bonds for
                            what, governance actions, etc.
                          </p>
                          <div className="btnWrpper mt-3">
                            <Link
                              target="_blank"
                              href={"https://tbtcscan.com/wallets"}
                              className="btn inline-flex items-center justify-center text-xs font-semibold h-8 rounded-20 px-3"
                            >
                              Learn More
                            </Link>
                          </div>
                        </CounterCard>
                      </div>
                    </div>
                  </>
                ) : step == "help" ? (
                  <>
                    <Help />
                  </>
                ) : step == "privacy" ? (
                  <>
                    <PrivacyPolicy />
                  </>
                ) : step == "terms service" ? (
                  <>
                    <LegalNotice />
                  </>
                ) : step == "documentation" ? (
                  <>
                    <Documentation />
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
const CounterCard = styled.div`
  transition: 0.4s;
  &:hover {
    transform: translateY(-2px) scale(1.01);
  }
  p {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  button,
  a {
    background: #6a6a6aed;
    color: #ffffff;
    border-color: #6a6a6aed;
    &:hover {
      background: #6a6a6aed;
    }
  }
`;

export default ContentPage;

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
