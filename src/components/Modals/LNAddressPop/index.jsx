import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { updateLNAddressCall } from "../../../lib/apiCall";
import { useSelector } from "react-redux";

const LNAdressPopup = ({
  lnAdressPop,
  setLNAdressPop,
  lnaddress,
  setLnaddress,
}) => {
  const userAuth = useSelector((state) => state.Auth);
  const extractUsername = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split("@");
    return parts[0] || "";
  };

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(extractUsername(lnaddress));
  const [usernameError, setUsernameError] = useState("");

  // Regex to allow only alphanumeric characters (no special characters)
  const usernameRegex = /^[a-zA-Z0-9]*$/;

  const handleUsernameChange = (e) => {
    const value = e.target.value;

    // Check if the value matches the regex (only alphanumeric characters)
    if (usernameRegex.test(value)) {
      setUsername(value);
      setUsernameError("");
    } else {
      setUsernameError("Only alphanumeric characters are allowed");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate username
      if (!username.trim()) {
        toast.error("Please enter a username");
        setLoading(false);
        return;
      }

      if (!usernameRegex.test(username)) {
        toast.error("Username can only contain alphanumeric characters");
        setLoading(false);
        return;
      }

      // Construct the full LN address
      const fullLnAddress = `${username}@spend.madhousewallet.com`;
      const resposne = await updateLNAddressCall(userAuth?.email,username);
      // console.log("repsonse", resposne);
      if (resposne?.status === "success") {
        setLnaddress(fullLnAddress);
        toast.success("LN Address updated successfully!");
      } else {
        toast.success(resposne?.message);
      }
      // Here you can add your logic to handle the updated LN address
      console.log("Updated LN Address:", fullLnAddress);

      setLNAdressPop(false);

      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error updating LN address");
      setLoading(false);
    }
  };

  const closeIcn = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <button
          onClick={() => setLNAdressPop(!lnAdressPop)}
          type="button"
          className="bg-[#0d1017] h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </button>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20 z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] max-w-[400px] w-full`}
        >
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                Update LN Address
              </h5>
            </div>
            <div className="modalBody">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="py-2">
                  <label
                    htmlFor="username"
                    className="form-label m-0 font-semibold text-xs ps-3"
                  >
                    Enter Username
                  </label>
                  <div className="iconWithText relative">
                    <input
                      id="username"
                      type="text"
                      onChange={handleUsernameChange}
                      value={username}
                      placeholder="Enter username"
                      className={`border-white/10 bg-white/4 hover:bg-white/6 text-white/40 flex text-xs w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full pr-48 ${
                        usernameError ? "border-red-500" : ""
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/60 pointer-events-none">
                      @spend.madhousewallet.com
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-red-500 text-xs mt-1 ps-3">
                      {usernameError}
                    </p>
                  )}
                  <p className="text-white/40 text-xs mt-1 ps-3">
                    Only letters and numbers are allowed
                  </p>
                </div>

                <div className="btnWrpper mt-3">
                  <button
                    type="button"
                    className="flex items-center justify-center btn commonBtn w-full"
                    disabled={loading || !username.trim() || usernameError}
                    onClick={handleSubmit}
                  >
                    {loading ? "Loading..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LNAdressPopup;

const Modal = styled.div`
  padding-bottom: 100px;

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 450px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

const closeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 15"
    fill="none"
  >
    <g clip-path="url(#clip0_0_6282)">
      <path
        d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
        fill="var(--textColor)"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="var(--textColor)"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="var(--textColor)"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);
