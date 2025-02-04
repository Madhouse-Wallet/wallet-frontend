import React, { useState } from "react";
import { useRouter } from "next/router";
import CreateWalletStep from "./CreateWallet";
import OtpStep from "./OtpStep";
import WalletBackup from "./WalletBackup";
import KeyStep from "./keysStep";
import {
  PasskeyValidatorContractVersion,
  WebAuthnMode,
  toPasskeyValidator,
  toWebAuthnKey,
} from "@zerodev/passkey-validator";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";

import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import { useDispatch, useSelector } from "react-redux";
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

const CreateWallet = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const [registerEmail, setRegisterEmail] = useState();
  const [registerUsername, setRegisterUsername] = useState();
  const [registerOTP, setRegisterOTP] = useState();
  const [checkOTP, setCheckOTP] = useState();
  const [registerTab, setRegisterTab] = useState(1);

  const [loginEmail, setLoginEmail] = useState();

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  const [addressPhrase, setAddressPhrase] = useState("");
  const [registerData, setRegisterData] = useState({ email: "", username: "" });

  async function isValidEmail(email) {
    // Define the email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the regex
    return emailRegex.test(email);
  }

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

  const addUser = async (
    email,
    username,
    passkey,
    publickeyId,
    rawId,
    wallet
  ) => {
    try {
      try {
        console.log(email, username, passkey, publickeyId, rawId);
        return await fetch(`/api/add-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username,
            passkey,
            publickeyId,
            rawId,
            wallet,
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
  const passketCreate = async (username) => {
    try {
      const webAuthnKey = await toWebAuthnKey({
        passkeyName: username,
        passkeyServerUrl: PASSKEY_SERVER_URL,
        mode: WebAuthnMode.Register,
        passkeyServerHeaders: {},
      });
      // console.log("line-95", webAuthnKey)
      const passkeyValidator = await toPasskeyValidator(publicClient, {
        webAuthnKey,
        entryPoint,
        kernelVersion: KERNEL_V3_1,
        validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
      });
      // console.log("line-102", passkeyValidator)
      return { passkeyValidator, webAuthnKey };
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };

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

  const sendOTP = async ({ email, name, otp, subject, type }) => {
    try {
      // console.log(email)
      return await fetch(`/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          emailData: {
            name: name,
            verificationCode: otp,
          },
          email,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };
  const loginFn = async () => {
    try {
      setLoginLoading(true);
      if (!loginEmail) {
        toast.error("Please Enter Email!");
      } else {
        let validEmail = await isValidEmail(loginEmail);
        if (!validEmail) {
          setLoginLoading(false);
          return toast.error("Please Enter Valid Email!");
        }
        let userExist = await getUser(loginEmail);
        if (userExist.status && userExist.status == "failure") {
          toast.error("User Not Found!");
        } else {
          // console.log(base64ToBuffer(userExist.userId.rawId))
          //base64ToBuffer(userExist.rawId)
          const createdCredential = await passketLogin(loginEmail);
          if (createdCredential) {
            let account = await getAccount(createdCredential.passkeyValidator);
            if (!account.status) {
              toast.error(account.msg);
            } else {
              if (
                userExist.userId.wallet == account?.account?.account?.address
              ) {
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
                setLoginEmail();
                handleLogin();
              } else {
                toast.error("Please Login With Correct Account!");
              }
            }
          }
        }
      }
      setLoginLoading(false);
    } catch (error) {
      setLoginLoading(false);
      console.log("error---->", error);
    }
  };

  const registerFn = async () => {
    try {
      let userExist = await getUser(registerData.email);
      if (userExist.status && userExist.status == "success") {
        toast.error("User Already Exist!");
        return false;
      }
      const createdCredential = await passketCreate(registerData.email);
      if (createdCredential) {
        let account = await createAccount(
          createdCredential.passkeyValidator,
          addressPhrase
        );
        if (!account.status) {
          toast.error(account.msg);
          return false;
        } else {
          console.log("account-->", account?.account?.account?.address);
          let data = await addUser(
            registerData.email,
            registerData.username,
            "",
            "",
            "",
            account?.account?.account?.address
          );
          toast.success("Sign Up Successfully!");
          dispatch(
            loginSet({
              login: true,
              walletAddress: account?.account?.account?.address || "",
              signer: "",
              username: registerData.username,
              email: registerData.email,
              passkeyCred: createdCredential.passkeyValidator || "",
            })
          );
          return true;
        }
      }
    } catch (error) {
      console.log("registerFn error---->", error);
      return false;
    }
  };

  const registerOtpFn = async (data) => {
    try {
      if (data.otp != checkOTP) {
        toast.error("Invalid OTP!");
        return false;
      } else {
        let userExist = await getUser(registerData.email);
        if (userExist.status && userExist.status == "success") {
          toast.error("User Already Exist!");
          return false;
        }
        let phrase = await getMnemonic();
        console.log("phrase -->", phrase);
        if (phrase) {
          setAddressPhrase(phrase);
          return true;
        } else {
          toast.error("Try Again After some time!!");
          return false;
        }
      }
    } catch (error) {
      console.log("registerOtpFn error---->", error);
      return false;
    }
  };

  const sendRegisterOtp = async (data) => {
    try {
      let userExist = await getUser(data.email);
      console.log("userExist-->", userExist);
      if (userExist.status && userExist.status == "success") {
        toast.error("User Already Exist!");
        return false;
      } else {
        let OTP = generateOTP(4);
        setCheckOTP(OTP);
        // console.log("OTP-->", OTP)
        setRegisterData({
          email: data.email,
          username: data.username,
        });
        let obj = {
          email: data.email,
          name: data.username,
          otp: OTP,
          subject: "Madhouse Account Verification OTP",
          type: "registerOtp",
        };
        let sendEmailData = await sendOTP(obj);
        if (sendEmailData.status && sendEmailData.status == "success") {
          setRegisterTab(2);
          toast.success(sendEmailData?.message);
          return true;
        } else {
          toast.error(sendEmailData?.message || sendEmailData?.error);
          return false;
        }
      }
    } catch (error) {
      console.log("sendRegisterOtp error---->", error);
      return false;
    }
  };

  return (
    <>
      {step == 1 ? (
        <>
          {/* <CreateWalletStep
            sendRegisterOtp={sendRegisterOtp}
            step={step}
            setStep={setStep}
          /> */}
          <OtpStep
            registerOtpFn={registerOtpFn}
            step={step}
            setStep={setStep}
          />
        </>
      ) : step == 2 ? (
        <>
          <OtpStep
            registerOtpFn={registerOtpFn}
            step={step}
            setStep={setStep}
          />
        </>
      ) : step == 3 ? (
        <>
          <WalletBackup
            handleCopy={handleCopy}
            addressPhrase={addressPhrase}
            step={step}
            setStep={setStep}
          />
        </>
      ) : step == 4 ? (
        <>
          <KeyStep registerFn={registerFn} step={step} setStep={setStep} />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

CreateWallet.authRoute = true;

export default CreateWallet;
