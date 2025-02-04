import React, { useState } from "react";

import { useRouter } from "next/router";
import KeyStep from "./KeyStep";
import EmailStep from "./EmailStep";

import {
  PasskeyValidatorContractVersion,
  WebAuthnMode,
  toPasskeyValidator,
  toWebAuthnKey,
} from "@zerodev/passkey-validator";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";

import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import { useDispatch } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { toast } from "react-toastify";

import {
  generateOTP,
  bufferToBase64,
  base64ToBuffer,
} from "../../utils/globals";

import {
  createAccount,
  getAccount,
  getMnemonic,
} from "../../lib/zeroDevWallet";

// @dev add your BUNDLER_URL, PAYMASTER_URL, and PASSKEY_SERVER_URL here
const BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
const PASSKEY_SERVER_URL = `https://passkeys.zerodev.app/api/v3/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
const CHAIN = sepolia;
const entryPoint = getEntryPoint("0.7");

const contractAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863";
const contractABI = parseAbi([
  "function mint(address _to) public",
  "function balanceOf(address owner) external view returns (uint256 balance)",
]);
const publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
  chain: CHAIN,
});

const Login = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [registerData, setRegisterData] = useState({ email: "" });
  const dispatch = useDispatch();
  async function isValidEmail(email) {
    // Define the email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the regex
    return emailRegex.test(email);
  }

  const passketLogin = async (username) => {
    try {
      const webAuthnKey = await toWebAuthnKey({
        passkeyName: username,
        passkeyServerUrl: PASSKEY_SERVER_URL,
        mode: WebAuthnMode.Login,
        passkeyServerHeaders: {},
      });
      console.log("line-95", webAuthnKey);
      const passkeyValidator = await toPasskeyValidator(publicClient, {
        webAuthnKey,
        entryPoint,
        kernelVersion: KERNEL_V3_1,
        validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
      });
      console.log("line-102", passkeyValidator);
      return { passkeyValidator, webAuthnKey };
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };

  const handleCopy = async (text) => {
    try {
      if (addressPhrase) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied Successfully!");
      } else {
      }
    } catch (error) {
      console.log("error-->", error);
    }
  };
  const getUser = async (email) => {
    try {
      try {
        // console.log(email)
        return await fetch(`/api/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            // console.log("data-->", data);
            return data;
          });
      } catch (error) {
        console.log(error);
        return false;
      }
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };

  const loginFn = async (data) => {
    try {
      let validEmail = await isValidEmail(data.email);
      if (!validEmail) {
        toast.error("Please Enter Valid Email!");
        return false;
      }
      let userExist = await getUser(data.email);
      if (userExist.status && userExist.status == "failure") {
        toast.error("User Not Found!");
        return false;
      } else {
        // console.log(base64ToBuffer(userExist.userId.rawId))
        //base64ToBuffer(userExist.rawId)
        const createdCredential = await passketLogin(data.email);
        if (createdCredential) {
          let account = await getAccount(createdCredential.passkeyValidator);
          if (!account.status) {
            toast.error(account.msg);
            return false;
          } else {
            if (userExist.userId.wallet == account?.account?.account?.address) {
              toast.success("Login Successfully!");
              dispatch(
                loginSet({
                  login: true,
                  walletAddress: account?.account?.account?.address || "",
                  signer: "",
                  username: userExist.userId.username,
                  email: userExist.userId.email,
                  passkeyCred: createdCredential.passkeyValidator || "",
                })
              );
              return true;
            } else {
              toast.error("Please Login With Correct Account!");
              return false;
            }
          }
        }
      }
    } catch (error) {
      console.log("error---->", error);
    }
  };

  return (
    <>
      {step == 1 ? (
        <>
          <EmailStep loginFn={loginFn} step={step} setStep={setStep} />
        </>
      ) : step == 2 ? (
        <>
          <KeyStep step={step} setStep={setStep} />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

Login.authRoute = true;
export default Login;
