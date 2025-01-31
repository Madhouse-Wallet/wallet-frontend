import React, { useState } from "react";
import logo from "@/Assets/Images/logow.png";
import OtpInput from "react-otp-input";
import Image from "next/image";
import styled from "styled-components";

const OtpStep = ({ step, setStep, registerOtpFn }) => {
  const [registerOTP, setRegisterOTP] = useState();
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);

  const otpRegister = async () => {
    try {
      setRegisterOtpLoading(true);
      if (!registerOTP) {
        toast.error("Please Enter OTP!");
        setRegisterOtpLoading(false);
      } else {
        let response = await registerOtpFn({
          otp: registerOTP,
        })
        if (response) {
          setStep(3)
        }
        setRegisterOtpLoading(false)
      }
    } catch (error) {
      console.log("createRegister error -->", error)
      setRegisterOtpLoading(false);
    }
  }
  return (
    <>
      <div className="mx-auto max-w-sm">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <Image
                src={logo}
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
              <div className="text-center">
                <h4 className="m-0 text-xl pb-1 font-semibold text-white">
                  OTP Code Verification
                </h4>
                <p className=" text-sm font-medium  md:text-xs py-5">
                  <span className="opacity-50">Code has been send to </span>
                  <br />{" "}
                  <span className="font-bold text-white opacity-100">
                    and***ley@yourdomain.com
                  </span>
                </p>{" "}
              </div>
            </div>
            <div className="col-span-12">
              <OtpWrpper>
                <OtpInput
                  value={registerOTP}
                  onChange={setRegisterOTP}
                  numInputs={4}
                  renderSeparator={<span></span>}
                  renderInput={(props) => <input {...props} />}
                />
              </OtpWrpper>
            </div>
            <div className="col-span-12">
              <p className="m-0 text-center text-white opacity-80 font-medium">
                Resend code in <span className="themeClr">55</span> s
              </p>
            </div>
            <div className="col-span-12">
              <div className="btnWrpper text-center mt-3">
                <button
                  onClick={otpRegister}
                  disabled={registerOtpLoading}
                  // type="submit"
                  className="inline-flex h-[42px] text-xs items-center rounded-full bg-white px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
                >
                  {registerOtpLoading ? "Loading" : "Verify"}

                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const OtpWrpper = styled.div`
  div {
    justify-content: center;
    gap: 10px;
    input {
      height: 50px;
      width: 50px !important;
      border-radius: 8px;
      outline: 0;
      color: rgb(255 255 255 / 0.4);
      background: rgb(255 255 255 / 0.04);
      border: 1px solid rgb(255 255 255 / 0.1);
      font-size: 24px;
      font-weight: 600;
    }
  }
`;

export default OtpStep;
