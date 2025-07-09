import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { addCreditCard } from "../../../lib/apiCall";

const CreateCardPop = ({
  createCard,
  setCreateCard,
  email,
  setCreditCardDetail,
}) => {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("");
  const [loader, setLoader] = useState(false);
  const addCard = async (type) => {
    try {
      setLoader(true);
      const addCardData = await addCreditCard({
        email,
        type,
      });
      if (addCardData?.status == "success") {
        setCreditCardDetail(addCardData.data.creditCardPass);
        setUrl(addCardData.data.creditCardPass.url);
        setStep(2);
        setLoader(false);
      } else {
        setLoader(false);
      }
      // setStep(2)
    } catch (error) {
      console.log("addCard error-->", error);
    }
  };
  const handleCreateCard = () => setCreateCard(!createCard);
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
            onClick={handleCreateCard}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
            // style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>{" "}
          <div className={`relative rounded px-3`}>
            <div className="top pb-3"></div>
            <div className="modalBody">
              {step == 1 ? (
                <>
                  <div className="py-2">
                    <button
                      disabled={loader}
                      onClick={() => addCard("apple")}
                      className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[55px] text-left text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] gap-2 justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      <div className="left">{applewallet}</div>
                      <div className="content">
                        <p className="m-0 text-[14px] text-black/50">Add to</p>
                        <p className="m-0 text-[16px]">Apple Wallet</p>
                      </div>
                    </button>
                  </div>
                  <div className="py-2">
                    <button
                      disabled={loader}
                      onClick={() => addCard("google")}
                      className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[55px] text-left text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] gap-2 justify-center disabled:pointer-events-none disabled:opacity-50`}
                    >
                      <div className="left">{googleWallet}</div>
                      <div className="content">
                        <p className="m-0 text-[14px] text-black/50">Add to</p>
                        <p className="m-0 text-[16px]">Google Wallet</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : step == 2 ? (
                <>
                  <button
                    className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                    onClick={() => {
                      window.open(url, "_blank");
                    }}
                  >
                    Download Pass
                  </button>
                </>
              ) : (
                <></>
              )}
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
    max-width: 350px !important;
    padding-bottom: 35px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default CreateCardPop;

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

const applewallet = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M3 15H9.4C9.731 15 10.005 15.278 10.15 15.576C10.356 15.999 10.844 16.5 12 16.5C13.156 16.5 13.644 16 13.85 15.576C13.995 15.278 14.269 15 14.6 15H21M3 7H21M3 11H21"
      stroke="black"
      strokeWidth="1.5"
    />
  </svg>
);

const googleWallet = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.75 10.545V6.8125C21.7487 5.99074 21.4216 5.20301 20.8406 4.62193C20.2595 4.04085 19.4718 3.71382 18.65 3.7125H5.35C4.52985 3.71904 3.74514 4.04774 3.16519 4.62769C2.58524 5.20765 2.25654 5.99235 2.25 6.8125V10.672"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.75 9.422C21.7487 8.60023 21.4216 7.8125 20.8406 7.23143C20.2595 6.65035 19.4718 6.32332 18.65 6.322H5.35C4.52823 6.32332 3.74051 6.65035 3.15943 7.23143C2.57835 7.8125 2.25132 8.60023 2.25 9.422"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.4765 10.744C21.231 10.1998 20.8338 9.73796 20.3325 9.41375C19.8311 9.08954 19.247 8.91672 18.65 8.916H5.35C4.75455 8.91679 4.17188 9.08878 3.67145 9.41147C3.17102 9.73416 2.77392 10.1939 2.5275 10.736"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.649 13.55L2.25 10.6715V17.1875C2.25132 18.0093 2.57835 18.797 3.15943 19.3781C3.74051 19.9591 4.52823 20.2862 5.35 20.2875H18.6505C19.4723 20.2862 20.26 19.9591 20.8411 19.3781C21.4221 18.797 21.7492 18.0093 21.7505 17.1875V10.545L18.793 12.696C18.2036 13.1266 17.5287 13.4257 16.8137 13.573C16.0988 13.7203 15.3606 13.7125 14.649 13.55Z"
      stroke="black"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
