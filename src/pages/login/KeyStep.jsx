import Link from "next/link";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

const KeyStep = ({ step, setStep, passkeyData, email, loginFn2nd, error }) => {
  const [selectOption, setSelectOption] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();
  const loginTry = async () => {
    try {
      setLoginLoading(true);
      let response = await loginFn2nd(email, passkeyData[selectOption]);
      if (response) {
        router.push("/dashboard");
      } else {
        setLoginLoading(false);
      }
    } catch (error) {
      console.log("loginTry error --->", error);
      setLoginLoading(false);
    }
  };
  return (
    <>
      <div className="mx-auto max-w-[700px]">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center gap-3 mb-2 justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="border-0 themeClr p-0"
                >
                  {backIcn}
                </button>
                <h1 className="text-center text-[32px] font-medium  m-0">
                  Select Passkey
                </h1>
              </div>
              {/* <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                They will be stored in different location for better security
              </p> */}
            </div>
          </div>
        </div>
        <div className="formBody pt-4 text-xs">
          <div className="grid gap-3 grid-cols-12">
            {passkeyData.map((item, key) => (
              <div
                key={key}
                onClick={() => setSelectOption(key)}
                className="md:col-span-6 col-span-12"
              >
                <div className="relative mt-3">
                  <div
                    className={` border-white/10 bg-white/4 hover:bg-white/6 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:border-white/50"
                        : "bg-[#fff3ed] border border-[#ffad84] cursor-pointer border rounded-10 py-2 px-3 flex items-center justify-between
                      border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300  focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <div className="left flex items-center gap-2">
                      <div
                        className={`border-white/10 bg-white/4 hover:bg-white/6 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:border-white/50 cursor-pointer border h-[60px] w-[60px] rounded-10 py-2 px-3 flex items-center justify-between
                      border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300  focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {keyIcn}
                      </div>
                      <div className="content">
                        <h4 className="m-0 font-bold text-xl">
                          {item?.displayName || "Key " + (key + 1)}
                        </h4>
                        <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                          {item.name}
                        </p>
                      </div>
                    </div>
                    {key == selectOption && (
                      <span className="icn">{check}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="col-span-12">
              {" "}
              {error && (
                <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                  {error}
                </div>
              )}
            </div>

            <div className="col-span-12">
              <div className="btnWrpper text-center mt-3 mx-auto  max-w-[300px]">
                <button
                  onClick={loginTry}
                  disabled={loginLoading}
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  {loginLoading ? (
                    <Image
                      src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                      alt={""}
                      height={100000}
                      width={10000}
                      className={"max-w-full h-[40px] object-contain w-auto"}
                    />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyStep;

const check = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.33917 12.7758C11.6023 14.2065 13.2933 16.7632 13.2933 16.7632H13.3272C13.3272 16.7632 16.9195 10.4063 23.5935 6.49683"
      stroke="#34C759"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      opacity="0.4"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.9688 23.6001C18.5031 23.6001 22.9896 19.1136 22.9896 13.5792C22.9896 8.04485 18.5031 3.55838 12.9688 3.55838C7.43442 3.55838 2.94794 8.04485 2.94794 13.5792C2.94794 19.1136 7.43442 23.6001 12.9688 23.6001Z"
      stroke="#34C759"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const keyIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M21 10H12.65C12.2381 8.83048 11.4733 7.81762 10.4613 7.10116C9.44934 6.3847 8.23994 5.99995 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C8.23994 18 9.44934 17.6153 10.4613 16.8988C11.4733 16.1824 12.2381 15.1695 12.65 14H13L15 16L17 14L19 16L23 11.96L21 10ZM7 15C5.35 15 4 13.65 4 12C4 10.35 5.35 9 7 9C8.65 9 10 10.35 10 12C10 13.65 8.65 15 7 15Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
