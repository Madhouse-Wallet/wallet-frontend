import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import WalletBackup from "../../../pages/create-wallet/WalletBackup";


// css

// img





const RecoverPopup = ({
  recover,
  setRecover,
  phrase,
  phraseStatus,
  adminId
}) => {
  const [step, setStep] = useState(1)
  const [lndHubUrl, setLndHubUrl] = useState(`lndhub://admin:${adminId || ""}@https://spend.madhousewallet.com/lndhub/ext/`)
  const handleAdjustPop = () => {
    setRecover(!recover)
  }
  useEffect(() => {
    setLndHubUrl(`lndhub://admin:${adminId || ""}@https://spend.madhousewallet.com/lndhub/ext/`)
  }, [])
  const handleCopy = async (text) => {
    try {
      if (phrase) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied Successfully!");
      } else {
      }
    } catch (error) {
      console.log("error-->", error);
    }
  };


  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <button
          onClick={handleAdjustPop}
          className="bg-[#0d1017] h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </button>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          {step == 1 ? <>
            <div className="mx-auto max-w-sm">
              <div className="top pb-3">
                <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
                  <div className="flex flex-col items-center gap-1 px-4">
                    <h1 className="text-center text-base font-medium  m-0">
                      Wallet Secrets
                    </h1>
                    <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                      Save This Private Key
                    </p>
                  </div>
                </div>
              </div>
              <div className="formBody pt-4 text-xs">
                <div className="grid gap-3 grid-cols-12">
                  {phraseStatus && phrase?.privateKey &&
                    <div className="col-span-12">
                      <input
                        readOnly={true}
                        value={phrase?.privateKey}
                        type="text"
                        className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                      />
                    </div>}
                  <div className="col-span-12">
                    <div className="text-center my-3">
                      <button
                        onClick={() => handleCopy(phrase?.privateKey || "")}
                        // type="submit"
                        className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <span className="icn">{copyIcn}</span> Copy to clipboard
                      </button>
                    </div>
                  </div>

                </div>
                <div>
                  <p className="text-center mb-2 text-sm font-medium opacity-50 md:text-xs">
                    Save This Wallet Safe Key
                  </p>
                </div>
                <div className="grid gap-3 grid-cols-12">
                  {phraseStatus && phrase?.safePrivateKey &&
                    <div className="col-span-12">
                      <input
                        readOnly={true}
                        value={phrase?.safePrivateKey}
                        type="text"
                        className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                      />
                    </div>}
                  <div className="col-span-12">
                    <div className="text-center my-3">
                      <button
                        onClick={() => handleCopy(phrase?.safePrivateKey || "")}
                        // type="submit"
                        className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <span className="icn">{copyIcn}</span> Copy to clipboard
                      </button>
                    </div>
                  </div>

                </div>

                <div>
                  <p className="text-center mb-2 text-sm font-medium opacity-50 md:text-xs">
                    Save This Wallet Seed Phrase
                  </p>
                </div>
                <div className="grid gap-3 grid-cols-12">
                  {phraseStatus && phrase?.seedPhrase &&
                    <div className="col-span-12">
                      <input
                        readOnly={true}
                        value={phrase?.seedPhrase}
                        type="text"
                        className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                      />
                    </div>}
                  <div className="col-span-12">
                    <div className="text-center my-3">
                      <button
                        onClick={() => handleCopy(phrase?.seedPhrase || "")}
                        // type="submit"
                        className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <span className="icn">{copyIcn}</span> Copy to clipboard
                      </button>
                    </div>
                  </div>

                </div>


                <div>
                  <p className="text-center mb-2 text-sm font-medium opacity-50 md:text-xs">
                    Save This Bitcoin Wallet Wif
                  </p>
                </div>
                <div className="grid gap-3 grid-cols-12">

                  {phrase?.wif &&
                    <div className="col-span-12">
                      <input
                        readOnly={true}
                        value={phrase?.wif}
                        type="text"
                        className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                      />
                    </div>}
                  <div className="col-span-12">
                    <div className="text-center my-3">
                      <button
                        onClick={() => handleCopy(phrase?.wif)}
                        // type="submit"
                        className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <span className="icn">{copyIcn}</span> Copy to clipboard
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <div className="btnWrpper text-center mt-3">
                      <button
                        onClick={() => handleAdjustPop()}
                        // type="submit"
                        className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </> : step == 2 ? <>
            <div className="mx-auto max-w-sm">
              <div className="top pb-3">
                <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
                  <div className="flex flex-col items-center gap-1 px-4">
                    <h1 className="text-center text-base font-medium  m-0">
                      Wallet Secrets
                    </h1>
                    <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                      Save This 12 Phase Key recovery
                    </p>
                  </div>
                </div>
              </div>
              <div className="formBody pt-4 text-xs">
                <div className="grid gap-3 grid-cols-12">

                  {/* {addressPhrase &&
              addressPhrase.split(" ").map((item, key) => ( */}
                  {phraseStatus && phrase?.seedPhrase && phrase?.seedPhrase?.split(" ").map((item, key) => (
                    <div key={key} className="col-span-6">
                      <input
                        readOnly={true}
                        value={item}
                        type="text"
                        className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                      />
                    </div>
                  ))}
                  <div className="col-span-12">
                    <div className="text-center my-3">
                      <button
                        onClick={() => handleCopy(phrase?.seedPhrase || "")}
                        type="submit"
                        className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <span className="icn">{copyIcn}</span> Copy to clipboard
                      </button>
                    </div>
                  </div>
                  {!phraseStatus &&
                    (<>
                      <div className="col-span-12">
                        <div className="text-center my-3">
                          <button
                            // onClick={() => handleCopy(addressPhrase)}
                            // type="submit"
                            className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          >
                            {phrase}
                          </button>
                        </div>
                      </div>
                    </>)
                  }
                  <div className="col-span-12">
                    {/* <div className="btnWrpper text-center mt-3">
                <button
                  // type="submit"
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  Next
                </button>
              </div> */}
                  </div>
                </div>
              </div>
            </div>
          </> : step == 3 ? <>
            <div className="mx-auto max-w-sm">
              <div className="top pb-3">
                <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
                  <div className="flex flex-col items-center gap-1 px-4">
                    <h1 className="text-center text-base font-medium  m-0">
                      Back Up Your Bitcoin Wallet
                    </h1>
                    <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                      Save This Wif Key
                    </p>
                  </div>
                </div>
              </div>
              <div className="formBody pt-4 text-xs">
                <div className="grid gap-3 grid-cols-12 ">

                  {/* {addressPhrase &&
              addressPhrase.split(" ").map((item, key) => ( */}
                  {phraseStatus && phrase?.wif && (<div className="col-span-12">
                    <input
                      readOnly={true}
                      value={phrase?.wif}
                      type="text"
                      className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                    />
                  </div>)}
                  <div className="col-span-12">
                    <div className="text-center my-3">
                      <button
                        onClick={() => handleCopy(phrase?.wif || "")}
                        type="submit"
                        className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <span className="icn">{copyIcn}</span> Copy to clipboard
                      </button>
                    </div>
                  </div>
                  {!phraseStatus &&
                    (<>
                      <div className="col-span-12">
                        <div className="text-center my-3">
                          <button
                            // onClick={() => handleCopy(addressPhrase)}
                            // type="submit"
                            className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          >
                            {phrase}
                          </button>
                        </div>
                      </div>
                    </>)
                  }
                  <div className="col-span-12">
                    {/* <div className="btnWrpper text-center mt-3">
                <button
                  // type="submit"
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  Next
                </button>
              </div> */}
                  </div>
                </div>
              </div>
            </div>
          </> : <>
            <div className="mx-auto max-w-sm">
              <div className="top pb-3">
                <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
                  <div className="flex flex-col items-center gap-1 px-4">
                    <h1 className="text-center text-base font-medium  m-0">
                      Get Your LndHub Url
                    </h1>
                    <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                      Save This LndHub Url
                    </p>
                  </div>
                </div>
              </div>
              <div className="formBody pt-4 text-xs">
                <div className="grid gap-3 grid-cols-12 ">

                  {/* {addressPhrase &&
              addressPhrase.split(" ").map((item, key) => ( */}
                  {adminId && (<div className="col-span-12">
                    <input
                      readOnly={true}
                      value={lndHubUrl}
                      type="text"
                      className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                    />
                  </div>)}
                  <div className="col-span-12">
                    <div className="text-center my-3">
                      <button
                        onClick={() => handleCopy(lndHubUrl || "")}
                        type="submit"
                        className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <span className="icn">{copyIcn}</span> Copy to clipboard
                      </button>
                    </div>
                  </div>
                  {!phraseStatus &&
                    (<>
                      <div className="col-span-12">
                        <div className="text-center my-3">
                          <button
                            // onClick={() => handleCopy(addressPhrase)}
                            // type="submit"
                            className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          >
                            {phrase}
                          </button>
                        </div>
                      </div>
                    </>)
                  }
                  <div className="col-span-12">
                    {/* <div className="btnWrpper text-center mt-3">
                <button
                  // type="submit"
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  Next
                </button>
              </div> */}
                  </div>
                </div>
              </div>
            </div>
          </>}
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  padding-bottom: 100px;

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 500px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

const RadioList = styled.ul`
  button {
    font-size: 12px;
    background: var(--cardBg);
    border-color: var(--cardBg);
  }
  input:checked + button {
    background: #ff8735;
    border-color: #ff8735;
    color: #000;
  }
`;

export default RecoverPopup;

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


const copyIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 2H10C8.897 2 8 2.897 8 4V8H4C2.897 8 2 8.897 2 10V20C2 21.103 2.897 22 4 22H14C15.103 22 16 21.103 16 20V16H20C21.103 16 22 15.103 22 14V4C22 2.897 21.103 2 20 2ZM4 20V10H14L14.002 20H4ZM20 14H16V10C16 8.897 15.103 8 14 8H10V4H20V14Z"
      fill="currentColor"
    />
  </svg>
);