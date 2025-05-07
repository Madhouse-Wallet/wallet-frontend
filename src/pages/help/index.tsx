import React from "react";

const Help = () => {
  return (
    <>
      {" "}
      <section className="contentPage pt-5 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="sectionHeader p-2 px-3 px-lg-4 py-lg-3 ">
                <div className="flex align-items-center gap-3">
                  <h4 className="m-0 text-24 font-bold -tracking-3 text-white/75 md:text-4xl flex-1 whitespace-nowrap capitalize leading-none">
                    Help
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-span-12">
              <div className=" mx-auto p-2 px-3 px-lg-4 py-lg-3 text-xs">
                <>
                  <p className="text-gray-400 m-0">
                    Welcome to the Madhouse Wallet Help Center. We're here to
                    assist you with any issues or questions you may have.
                  </p>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      Common Issues
                    </h2>
                    <ul className="mt-0">
                      <li className="text-gray-400 py-1">
                        <strong>I forgot my password:</strong> Reset your
                        password by clicking{" "}
                        <a className="themeClr" href="#">
                          here
                        </a>
                        .
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong>How do I recover my wallet?</strong> Use your
                        seed phrase to restore your wallet. Learn more{" "}
                        <a className="themeClr" href="#">
                          here
                        </a>
                        .
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong>Why can’t I withdraw funds?</strong> Ensure your
                        account meets withdrawal requirements and try again.
                        Contact support if the issue persists.
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      Getting Started
                    </h2>
                    <p className="text-gray-400 m-0">
                      If you're new to Madhouse Wallet, follow these steps to
                      get started:
                    </p>
                    <ol className="mt-0">
                      <li className="text-gray-400 py-1">
                        Sign up for an account.
                      </li>
                      <li className="text-gray-400 py-1">
                        Set up two-factor authentication for added security.
                      </li>
                      <li className="text-gray-400 py-1">
                        Deposit funds into your wallet.
                      </li>
                      <li className="text-gray-400 py-1">
                        Start earning yield through our liquidity pools.
                      </li>
                    </ol>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      Support Options
                    </h2>
                    <ul className="mt-0">
                      <li className="text-gray-400 py-1">
                        <strong>Email Support:</strong> Reach us at{" "}
                        <a
                          className="themeClr"
                          href="mailto:support@madhousewallet.com"
                        >
                          support@madhousewallet.com
                        </a>
                        .
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong>Live Chat:</strong> Available 24/7 on our{" "}
                        <a className="themeClr" href="#">
                          website
                        </a>
                        .
                      </li>
                      <li className="text-gray-400 py-1">
                        <strong>Community Forum:</strong> Join discussions with
                        other users{" "}
                        <a className="themeClr" href="#">
                          here
                        </a>
                        .
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">
                      Tips for Safe Usage
                    </h2>
                    <ul className="mt-0">
                      <li className="text-gray-400 py-1">
                        Keep your seed phrase private and secure.
                      </li>
                      <li className="text-gray-400 py-1">
                        Enable two-factor authentication (2FA) for all accounts.
                      </li>
                      <li className="text-gray-400 py-1">
                        Double-check wallet addresses before making transfers.
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <h2 className="py-2 m-0 text-xl font-bold">Contact Us</h2>
                    <p className="text-gray-400 m-0">
                      If you need further assistance, don’t hesitate to contact
                      our support team. You can email us at{" "}
                      <a
                        className="themeClr"
                        href="mailto:support@madhousewallet.com"
                      >
                        support@madhousewallet.com
                      </a>{" "}
                      or use our{" "}
                      <a className="themeClr" href="#">
                        live chat
                      </a>{" "}
                      feature.
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

export default Help;
