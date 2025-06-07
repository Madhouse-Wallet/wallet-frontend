import React from "react";

const VerifyIdentity = ({ step, setStep, src, customerId, identitySRC }) => {


  return (
    <>
      <div className="h-[500px] w-full mx-auto">
        <iframe
          src={identitySRC.data.link}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="SpherePay Terms of Service"
        />
      </div>
    </>
  );
};

export default VerifyIdentity;
