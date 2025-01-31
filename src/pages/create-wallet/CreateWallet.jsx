import React, { useState } from "react";
import logo from "@/Assets/Images/logow.png";
import Image from "next/image";

import {
  PasskeyValidatorContractVersion,
  WebAuthnMode,
  toPasskeyValidator,
  toWebAuthnKey
} from "@zerodev/passkey-validator"
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants"

import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem"
import { sepolia } from "viem/chains"
import { asyncThunkCreator } from "@reduxjs/toolkit";
// @dev add your BUNDLER_URL, PAYMASTER_URL, and PASSKEY_SERVER_URL here
const BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`
const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`
const PASSKEY_SERVER_URL = `https://passkeys.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`
const CHAIN = sepolia
const entryPoint = getEntryPoint("0.7")

const contractAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863"
const contractABI = parseAbi([
  "function mint(address _to) public",
  "function balanceOf(address owner) external view returns (uint256 balance)"
])
const publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
  chain: CHAIN
})

import { toast } from "react-toastify";




const CreateWalletStep = ({ step, setStep, sendRegisterOtp }) => {
  const [registerUsername, setRegisterUsername] = useState();
  const [registerEmail, setRegisterEmail] = useState();
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);

  // onClick={() => setStep(2)}
  async function isValidEmail(email) {
    // Define the email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the regex
    return emailRegex.test(email);
  }


  const createRegister = async () => {
    try {
      setRegisterOtpLoading(true);
      if (!registerEmail) {
        toast.error("Please Enter Email!");
        setRegisterOtpLoading(false);
      } else if (!registerUsername) {
        toast.error("Please Enter Username!");
        setRegisterOtpLoading(false);
      } else {
        let validEmail = await isValidEmail(registerEmail);
        if (!validEmail) {
          setRegisterOtpLoading(false);
          return toast.error("Please Enter Valid Email!");
        } else {

          let response = await sendRegisterOtp({
            email: registerEmail,
            username: registerUsername
          })
          if (response) {
            setStep(2)
          }
          setRegisterOtpLoading(false)
        }

      }
    } catch (error) {
      console.log("createRegister error -->", error)
      setRegisterOtpLoading(false);
    }
  }
  return (
    <>
      {" "}
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
              <h4 className="m-0 text-xl pb-1 font-semibold text-white">
                Create Walllet
              </h4>
              <p className=" text-sm font-medium opacity-50 md:text-xs">
                Get an account and control your finances better with full
                control of your budgets and savings.
              </p>
            </div>
            <div className="col-span-12">
              <div className="relative mt-3">
                <input
                  type="email"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                  placeholder="Enter your email address"
                  defaultValue=""
                />
              </div>
              {/* <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-destructive2-lightest">
                  {infoIcn}
                  Incorrect email
                </div> */}
            </div>
            <div className="col-span-12">
              <div className="relative mt-3">
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                  placeholder="Enter your email address"
                  defaultValue=""
                />
              </div>
              {/* <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-destructive2-lightest">
                  {infoIcn}
                  Incorrect email
                </div> */}
            </div>
            <div className="col-span-12">
              <div className="btnWrpper text-center mt-3">
                <button
                  disabled={registerOtpLoading}
                  onClick={createRegister}

                  className="inline-flex h-[42px] text-xs items-center rounded-full bg-white px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
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
