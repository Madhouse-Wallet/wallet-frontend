import React from "react";

const Help = () => {
  return (
    <>
      {" "}
      <section className="contentPage py-4 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="max-w-4xl mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold mb-4">Help</h1>
                <p className="m-0 text-gray-500">
                  Borrow cash by using your bitcoin as collateral. No KYC and no
                  central custodians. Stay in complete control of your bitcoin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Help;
