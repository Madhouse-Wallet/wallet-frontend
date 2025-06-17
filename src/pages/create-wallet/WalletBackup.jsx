import React from "react";

const WalletBackup = ({
  step,
  setStep,
  privateKey,
  safeKey,
  seedPhrase,
  addressWif,
  handleCopy,
  errorr,
}) => {
  return (
    <>
      <div className="mx-auto max-w-sm">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <h1 className="text-center text-base font-medium  m-0">
                Back Up Your Wallet
              </h1>
              <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                Save This Private Key
              </p>
            </div>
          </div>
        </div>
        <div className="formBody pt-4 text-xs">
          <div className="grid gap-3 grid-cols-12">
            {privateKey && (
              <div className="col-span-12">
                <input
                  readOnly={true}
                  value={privateKey}
                  type="text"
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                />
              </div>
            )}
            <div className="col-span-12">
              <div className="text-center my-3">
                <button
                  onClick={() => handleCopy(privateKey)}
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
              Save This Safe Key
            </p>
          </div>
          <div className="grid gap-3 grid-cols-12">
            {safeKey && (
              <div className="col-span-12">
                <input
                  readOnly={true}
                  value={safeKey}
                  type="text"
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                />
              </div>
            )}
            <div className="col-span-12">
              <div className="text-center my-3">
                <button
                  onClick={() => handleCopy(safeKey)}
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
              Save This Seed Phrase Key
            </p>
          </div>
          <div className="grid gap-3 grid-cols-12">
            {seedPhrase && (
              <div className="col-span-12">
                <input
                  readOnly={true}
                  value={seedPhrase}
                  type="text"
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                />
              </div>
            )}
            <div className="col-span-12">
              <div className="text-center my-3">
                <button
                  onClick={() => handleCopy(seedPhrase)}
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
            {addressWif && (
              <div className="col-span-12">
                <input
                  readOnly={true}
                  value={addressWif}
                  type="text"
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                />
              </div>
            )}
            <div className="col-span-12">
              <div className="text-center my-3">
                <button
                  onClick={() => handleCopy(addressWif)}
                  // type="submit"
                  className={` bg-white/40 active:bg-white/90 text-black hover:bg-white/80 ring-white/40 text-white inline-flex h-[42px] text-xs items-center rounded-full  gap-3 px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  <span className="icn">{copyIcn}</span> Copy to clipboard
                </button>
              </div>
            </div>

            <div className="col-span-12">
              {" "}
              {errorr && (
                <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                  {errorr}
                </div>
              )}
            </div>

            <div className="col-span-12">
              <div className="btnWrpper text-center mt-3">
                <button
                  onClick={() => setStep(4)}
                  // type="submit"
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletBackup;

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
