import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

const SuccessPop = ({ success, setSuccess }) => {
  const handleSuccess = () => setSuccess(!success);
  const router = useRouter();
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          <button
            onClick={handleSuccess}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
            // style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>{" "}
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80"></h5>
            </div>
            <div className="modalBody text-center">
              <span className="icn flex items-center justify-center pb-3">
                {tickIcn}
              </span>
              <h4 className="m-0 font-medium text-white text-2xl pb-2">
                🎉 Success!
              </h4>
              <p className="m-0 py-2">
                You've successfully Send USDC. Thank you for using MadHouse
                Wallet!"
              </p>
              {/* <div className="btnWrpper mt-5">
                <Link
                  href={"/"}
                  className="flex items-center justify-center commonBtn btn w-full rounded-full h-[50px]"
                >
                  Back to Home
                </Link>
              </div> */}
              <div className="btnWrpper mt-5">
                <button
                  onClick={() => {
                    router.push("/");
                    handleSuccess();
                  }}
                  className="flex items-center justify-center commonBtn btn w-full rounded-full h-[50px]"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  ${"" /* padding-bottom: 100px; */}

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 550px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default SuccessPop;

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
        fill="currentColor"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="currentColor"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);

const tickIcn = (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="50"
      cy="50"
      r="48.5"
      fill="url(#paint0_linear_301_1302)"
      stroke="url(#paint1_linear_301_1302)"
      strokeWidth="3"
    />
    <g clip-path="url(#clip0_301_1302)">
      <path
        d="M36 50L46 60L66 40"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_301_1302"
        x1="50"
        y1="0"
        x2="50"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#11CF8B" />
        <stop offset="1" stopColor="#30EEA9" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_301_1302"
        x1="50"
        y1="0"
        x2="50"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7BF4C8" />
        <stop offset="1" stopColor="#56F1B9" />
      </linearGradient>
      <clipPath id="clip0_301_1302">
        <rect
          width="48"
          height="48"
          fill="white"
          transform="translate(26 26)"
        />
      </clipPath>
    </defs>
  </svg>
);
