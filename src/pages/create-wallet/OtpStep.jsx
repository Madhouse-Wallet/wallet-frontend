import React, { useEffect, useState } from "react";
import logow from "@/Assets/Images/logow.png";
import logo from "@/Assets/Images/logo.png";
import OtpInput from "react-otp-input";
import Image from "next/image";
import styled from "styled-components";
import { useTheme } from "@/ContextApi/ThemeContext";

const OtpStep = ({ step, setStep, registerOtpFn, resendOtpFunc }) => {
  const { theme, toggleTheme } = useTheme();
  const [registerOTP, setRegisterOTP] = useState();
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  

  useEffect(() => {
    // Start the timer when component mounts
    startResendTimer();
  }, []);

  useEffect(() => {
    // Timer countdown logic
    if (timeLeft > 0) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerInterval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);

  const startResendTimer = () => {
    setIsResendDisabled(true);
    setTimeLeft(120); // 2 minutes in seconds
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const otpRegister = async () => {
    try {
      setRegisterOtpLoading(true);
      if (!registerOTP) {
        toast.error("Please Enter OTP!");
        setRegisterOtpLoading(false);
      } else {
        let response = await registerOtpFn({
          otp: registerOTP,
        });
        if (response) {
          setStep(3);
        }
        setRegisterOtpLoading(false);
      }
    } catch (error) {
      console.log("createRegister error -->", error);
      setRegisterOtpLoading(false);
    }
  };


  const resendOtp = async () => {
    try {
      let response = await resendOtpFunc();
      if (response) {
        startResendTimer();
      }
    } catch (error) {
      console.log("createRegister error -->", error);
      setRegisterOtpLoading(false);
    }
  };

  useEffect(() => {
    if (registerOTP?.length === 4 && !registerOtpLoading) {
      otpRegister();
    }
  }, [registerOTP]);
  return (
    <>
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
              <div className="text-center">
                <h4 className="m-0 text-xl pb-1 font-semibold ">
                  OTP Code Verification
                </h4>
                <p className=" text-sm font-medium  md:text-xs py-5">
                  <span className="opacity-50">Code has been send to You Email </span>
                  <br />{" "}
                  {/* <span className="font-bold  opacity-100">
                    and***ley@yourdomain.com
                  </span> */}
                </p>{" "}
              </div>
            </div>
            <div className="col-span-12">
              <OtpWrpper theme={theme}>
                <OtpInput
                  value={registerOTP}
                  onChange={setRegisterOTP}
                  numInputs={4}
                  inputType={"number"}
                  renderSeparator={<span></span>}
                  renderInput={(props) => <input {...props} />}
                />
              </OtpWrpper>
            </div>
            <div className="col-span-12">
              <div className="text-center">
              <button 
                  onClick={resendOtp} 
                  disabled={isResendDisabled}
                  className={`m-0 text-center themeClr inline-flex hover:opacity-50 font-medium ${isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isResendDisabled ? `Resend OTP (${formatTime(timeLeft)})` : 'Resend OTP'}
                </button>
              </div>
            </div>
            <div className="col-span-12">
              <div className="btnWrpper text-center mt-3">
                <button
                  onClick={otpRegister}
                  disabled={registerOtpLoading}
                  // type="submit"
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
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
      ${"" /* color: rgb(255 255 255 / 0.4); */}
      background: ${({ theme }) =>
        theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "#fff3ed"};
      border: 1px solid rgb(255 255 255 / 0.1);
      border-color: ${({ theme }) =>
        theme === "dark" ? "rgb(255 255 255 / 0.1)" : "#ffad84"};
      font-size: 24px;
      font-weight: 600;
    }
  }
`;

export default OtpStep;
