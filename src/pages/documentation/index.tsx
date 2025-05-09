import React from "react";

const Documentation = () => {
  return (
    <>
      {" "}
      <section className="contentPage pt-5 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="sectionHeader p-2 px-3 px-lg-4 py-lg-3">
                <div className="flex align-items-center gap-3">
                  <h4 className="m-0 text-24 font-bold -tracking-3 text-white/75 md:text-4xl flex-1 whitespace-nowrap capitalize leading-none">
                    Documentation
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-span-12">
              <div className=" mx-auto p-2 px-3 px-lg-4 py-lg-3 text-xs">
                <>
                  <p className="text-gray-400 m-0">
                    Welcome to the official documentation for Madhouse Wallet.
                    This page provides essential information to help you get
                    started and maximize your experience.
                  </p>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      1. Introduction
                    </h2>
                    <p className="text-gray-400 m-0">
                      Madhouse Wallet is a secure crypto wallet designed to
                      enable users to earn yields through automated market
                      makers (AMMs) and yield farming. It offers support for
                      tokenized Bitcoin like wBTC, tBTC, and cbBTC.
                    </p>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      2. Getting Started
                    </h2>
                    <ul className="mt-0">
                      <li className="text-gray-400 py-1">
                        <strong className="">Sign Up:</strong>{" "}
                        <a className="themeClr" href="#">
                          Create your Madhouse Wallet account
                        </a>
                        .
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">Set Up:</strong> Configure your
                        wallet securely using self-custody.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">Deposit Bitcoin:</strong> Transfer
                        Bitcoin to start earning yield.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">Test Transfers:</strong> Make a
                        small test transfer for accuracy.
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      3. Key Features
                    </h2>
                    <ul className="mt-0">
                      <li className="text-gray-400 py-1">
                        <strong className="">Yield Farming:</strong> Earn
                        passive income by providing liquidity.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">AMM Integration:</strong> Trade
                        assets seamlessly through AMMs.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">Security:</strong> Multi-signature
                        cold storage, 2FA, and Passkey protection.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">Bitcoin Pools:</strong> Support for
                        tokenized Bitcoin (wBTC, tBTC, cbBTC).
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      4. How It Works
                    </h2>
                    <p className="text-gray-400 m-0">
                      Earn yields by providing liquidity to Bitcoin-only pools.
                      Madhouse Wallet uses smart contracts to automate market
                      making, ensuring seamless and profitable liquidity
                      provision.
                    </p>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">5. FAQs</h2>
                    <ul className="mt-0">
                      <li className="text-gray-400 py-1">
                        <strong className="">What is Madhouse Wallet?</strong> A
                        secure crypto wallet for yield farming and liquidity
                        provision.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">How can I earn?</strong> Provide
                        liquidity to earn yield via AMMs.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">
                          What Bitcoin types are supported?
                        </strong>{" "}
                        wBTC, tBTC, and cbBTC.
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong className="">Is my wallet secure?</strong> Yes,
                        it includes 2FA and cold storage for safety.
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      6. Best Practices
                    </h2>
                    <ul className="mt-0">
                      <li className="text-gray-400 py-1">
                        Keep your seed phrase private and secure.
                      </li>
                      <li className="text-gray-400 py-1">
                        Enable two-factor authentication (2FA).
                      </li>
                      <li className="text-gray-400 py-1">
                        Verify wallet addresses before transactions.
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      7. Contact Us
                    </h2>
                    <p className="text-gray-400 m-0">
                      Need help?{" "}
                      <a
                        className="themeClr"
                        href="mailto:support@madhousewallet.com"
                      >
                        Contact Support
                      </a>
                      .
                    </p>
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Documentation;

