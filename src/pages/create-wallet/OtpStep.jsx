import React, { useState, useEffect } from "react";
import OtpInput from "react-otp-input";
import Image from "next/image";
import styled from "styled-components";
import { useTheme } from "@/ContextApi/ThemeContext";
import { BackBtn } from "@/components/common/index";

const OtpStep = ({
  step,
  setStep,
  registerOtpFn,
  resendOtpFunc,
  registerData,
  errorr,
  setError,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [registerOTP, setRegisterOTP] = useState();
  const [attempt, setAttempt] = useState(3);
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const OTP_VALIDITY_SECONDS = 5 * 60; // 5 minutes

  const [secondsLeft, setSecondsLeft] = useState(OTP_VALIDITY_SECONDS);
  const [otpExpired, setOtpExpired] = useState(false);
  useEffect(() => {
    startResendTimer();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setOtpExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
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
    setTimeLeft(30); // 2 minutes in seconds
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const otpRegister = async () => {
    try {
      setRegisterOtpLoading(true);
      if (!registerOTP) {
        setError("Please Enter OTP!");
        setRegisterOtpLoading(false);
      } else {
        let response = await registerOtpFn({
          otp: registerOTP,
        });
        if (response) {
          setStep(4);
        } else {
          if (attempt < 2) {
            setError("")
            setStep(1);
          } else {
            setAttempt((prev) => (prev - 1))
          }
        }
        setRegisterOtpLoading(false);
      }
    } catch (error) {
      console.log("createRegister error -->", error);
      setRegisterOtpLoading(false);
    }
  };

  // const resendOtp = async () => {
  //   try {
  //     localStorage.setItem(resendOtp,)
  //     let response = await resendOtpFunc();
  //     if (response) {
  //       startResendTimer();
  //     }
  //   } catch (error) {
  //     console.log("createRegister error -->", error);
  //     setRegisterOtpLoading(false);
  //   }
  // };

  const resendOtp = async () => {
    try {
      // Get the current resend count from localStorage
      let resendCount = parseInt(
        localStorage.getItem("resendOtpCount") || "0",
        10
      );

      // If more than 3 attempts, redirect to login
      if (resendCount >= 3) {
        console.log("Too many OTP attempts. Redirecting...");
        localStorage.setItem("resendOtpCount", "0");
        setStep(1);
        return;
      }

      // Otherwise, proceed with OTP resend
      setLoading(true)
      let response = await resendOtpFunc();
      if (response) {
        // Increment resend count and store it
        setSecondsLeft(OTP_VALIDITY_SECONDS)
        setOtpExpired(false)
        resendCount += 1;
        localStorage.setItem("resendOtpCount", resendCount.toString());
        setLoading(false)
        startResendTimer();
      }
    } catch (error) {
      setLoading(false)

      console.log("resendOtp error -->", error);
      setRegisterOtpLoading(false);
    }
  };

  useEffect(() => {
    setError("")
    // if (registerOTP?.length === 4 && !registerOtpLoading) {
    //   otpRegister();
    // }
  }, [registerOTP]);

  return (
    <>
      <div className="mx-auto max-w-sm">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center justify-center mb-2 gap-3">
                <BackBtn />
                <Image
                  src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow.png"}
                  alt="logo"
                  className="max-w-full mx-auto w-auto "
                  height={100000}
                  width={10000}
                  style={{ height: 40 }}
                />
              </div>
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
                  <span className="opacity-50">
                    Code has been send to {registerData?.email}{" "}
                  </span>
                  <br />{" "}
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
                {errorr && (
                  <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                    {errorr}
                  </div>
                )}
                {(attempt < 3) && (
                  <div className="flex pt-3  items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                    {attempt + " Attempts left!"}
                  </div>
                )}
              </OtpWrpper>
            </div>
            <div className="col-span-12">
              <div className="text-center">
                {(!otpExpired) && <button
                  className={`m-0 text-center themeClr inline-flex hover:opacity-50 font-medium`}
                >
                  {`OTP Expires in(${formatTime(secondsLeft)})`}
                </button>}
              </div>
            </div>
            <div className="col-span-12">
              <div className="text-center">
                {(otpExpired && (<>
                  <button
                    onClick={resendOtp}
                     disabled={loading}
                    className={`m-0 text-center themeClr inline-flex hover:opacity-50 font-medium`}
                  >
                    {"OTP Expired. Please Resend OTP."}
                  </button>
                </>)) || <> <button
                  onClick={resendOtp}
                  disabled={isResendDisabled}
                  className={`m-0 text-center themeClr inline-flex hover:opacity-50 font-medium ${isResendDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isResendDisabled
                    ? `Resend OTP (${formatTime(timeLeft)})`
                    : "Resend OTP"}
                </button></>}

              </div>
            </div>
            <div className="col-span-12">
              <div className="btnWrpper text-center mt-3">
                <button
                  onClick={otpRegister}
                  disabled={otpExpired || registerOtpLoading || !registerOTP}
                  // type="submit"
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  {registerOtpLoading || loading ? (
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
