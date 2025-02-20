import React, { useState } from "react";
import logow from "@/Assets/Images/logow.png";
import Image from "next/image";
import {
  isValidEmail,
} from "../../utils/globals";
import { useTheme } from "@/ContextApi/ThemeContext";
import { toast } from "react-toastify";

const CreateWalletStep = ({ step, setStep, sendRegisterOtp }) => {
  const [registerUsername, setRegisterUsername] = useState();
  const [registerEmail, setRegisterEmail] = useState();
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  const [error, setError] = useState("");

  const createRegister = async () => {
    try {
      setRegisterOtpLoading(true);
      if (!registerEmail) {
        // toast.error("Please Enter Email!");
        setError("Please Enter Email!"); 
        setRegisterOtpLoading(false);
      }
      //  else if (!registerUsername) {
      //   toast.error("Please Enter Passkey Name!");
      //   setRegisterOtpLoading(false);
      // }
       else {
        let validEmail = await isValidEmail(registerEmail);
        if (!validEmail) {
          setRegisterOtpLoading(false);
          // return toast.error("Please Enter Valid Email!");
          setError("Please Enter Valid Email!");
        } else {
          let response = await sendRegisterOtp({
            email: registerEmail,
            username: registerUsername,
          });
          if (response) {
            setStep(2);
          }
          setRegisterOtpLoading(false);
        }
      }
    } catch (error) {
      console.log("createRegister error -->", error);
      setRegisterOtpLoading(false);
    }
  };
  return (
    <>
      {" "}
      <div className="mx-auto max-w-sm">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <Image
                src={logow}
                alt="logo"
                className="max-w-full mx-auto w-auto mb-2"
                height={100000}
                width={10000}
                style={{ height: 40 }}
              />
              <h1 className="text-center text-base font-medium  m-0">
                Madhouse Wallet
              </h1>
            </div>
          </div>
        </div>
        <div className="formBody pt-4 text-xs">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <h4 className="m-0 text-xl pb-1 font-semibold">Create Walllet</h4>
              <p className=" text-sm font-medium opacity-50 md:text-xs">
                Get an account and control your finances better with full
                control of your budgets and savings.
              </p>
            </div>
            <div className="col-span-12">
              <div className="relative mt-3">
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                  placeholder="Enter your email address"
                  defaultValue=""
                />
                {error && (
                  <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                    {error}
                  </div>
                )}
              </div>
              {/* <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-destructive2-lightest">
                  {infoIcn}
                  Incorrect email
                </div> */}
            </div>
            {/* <div className="col-span-12">
              <div className="relative">
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                  placeholder="Passkey name"
                  defaultValue=""
                />
              </div>
            </div> */}
            <div className="col-span-12">
              <div className="btnWrpper text-center mt-3">
                <button
                  disabled={registerOtpLoading}
                  onClick={createRegister}
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  {registerOtpLoading ? "Loading" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateWalletStep;
