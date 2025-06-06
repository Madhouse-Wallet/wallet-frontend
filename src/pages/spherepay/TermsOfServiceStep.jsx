import React from "react";

const TermsOfServiceStep = ({ step, setStep, src, customerId, termasSRC }) => {
  return (
    <>
      <div className="h-[500px] w-full mx-auto">
        <iframe
          src={termasSRC.data.link}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="SpherePay Terms of Service"
        />
      </div>
    </>
  );
};

export default TermsOfServiceStep;
