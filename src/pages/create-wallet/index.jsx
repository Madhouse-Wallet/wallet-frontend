import React, { useState, useEffect } from "react";
import CreateWalletStep from "./CreateWallet";
import OtpStep from "./OtpStep";
import WalletBackup from "./WalletBackup";
import KeyStep from "./keysStep";

import { useDispatch } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { toast } from "react-toastify";
import {
  createCoinosInvoice,
  getBitcoinAddress,
  registerCoinosUser,
} from "../../lib/apiCall";

import { registerCredential, storeSecret } from "../../utils/webauthPrf";

import {
  generateOTP,
  storedataLocalStorage,
  webAuthKeyStore,
  getRandomString
} from "../../utils/globals";

import {
  createAccount,
  getMnemonic,
  registerPasskey,
  passkeyValidator,
} from "../../lib/zeroDevWallet";

import { setupNewAccount, getPrivateKey } from "../../lib/zeroDev";

const CreateWallet = () => {
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const [checkOTP, setCheckOTP] = useState();
  const [otpTimestamp, setOtpTimestamp] = useState(null);
  const [addressPhrase, setAddressPhrase] = useState("");
  const [registerData, setRegisterData] = useState({ email: "", username: "" });
  const isOtpExpired = () => {
    if (!otpTimestamp) return true;
    const currentTime = new Date().getTime();
    const expirationTime = otpTimestamp + 10 * 60 * 1000; // 10 minutes in milliseconds
    return currentTime > expirationTime;
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

  const addUser = async (
    email,
    username,
    passkey,
    wallet,
    bitcoinWallet,
    liquidBitcoinWallet,
    coinosToken,
    flowTokens
  ) => {
    try {
      try {
        return await fetch(`/api/add-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username,
            passkey,
            wallet,
            bitcoinWallet,
            liquidBitcoinWallet,
            coinosToken,
            flowTokens
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            return data;
          });
      } catch (error) {
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
        return await fetch(`/api/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
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

  const sendOTP = async ({ email, name, otp, subject, type }) => {
    try {
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
          return data;
        });
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };

  const setSecretInPasskey = async (userName, data) => {
    try {
      let registerCheck = await registerCredential(userName, userName);
      if (registerCheck?.status) {
        let storeSecretCheck = await storeSecret(
          registerCheck?.data?.credentialId,
          data
        );
        if (storeSecretCheck?.status) {
          return {
            status: true,
            storageKey: storeSecretCheck?.data?.storageKey,
            credentialId: registerCheck?.data?.credentialId,
          };
        } else {
          return {
            status: false,
            msg: storeSecretCheck?.msg,
          };
        }
      } else {
        return {
          status: false,
          msg: registerCheck?.msg,
        };
      }
    } catch (error) {
      return {
        status: false,
        msg: "Facing issue in storing secret",
      };
    }
  };

  const registerFn = async () => {
    try {
      let userExist = await getUser(registerData.email);
      if (userExist.status && userExist.status == "success") {
        toast.error("User Already Exist!");
        return false;
      }
      const createWallet = await setupNewAccount(addressPhrase)
      if (!createWallet?.status) {
        toast.error(createWallet?.msg);
        return false;
      } else {
        let { privatekey, address, account, trxn } = createWallet?.data
        const cleanEmail = registerData?.email?.replace(
          /[^a-zA-Z0-9]/g,
          ""
        );
        let registerCoinos = await registerCoinosUser(
          cleanEmail,
          "testttttttt"
        );
        localStorage.setItem("coinosToken", registerCoinos?.token);
        const [usernameInit, domainInit] = (registerData.email).split("@");
        let token1 = (await getRandomString(6)) + "_" + usernameInit;
        let flowTokens = [
          { flow: 1, token: (token1) },
        ];
        const resultLiquid = await createCoinosInvoice(
          registerCoinos?.token,
          "1",
          "liquid",
          token1
        );
        let getWallet = await getBitcoinAddress();
        let bitcoinWallet = "";
        if (getWallet.status && getWallet.status == "success") {
          bitcoinWallet = getWallet?.data?.wallet || "";
        }
        let secretObj = {
          coinosToken: registerCoinos?.token || "",
          wif: getWallet?.data?.wif || "",
          seedPhrase: addressPhrase,
        };
        let storageKeySecret = "";
        let credentialIdSecret = "";
        let storeData = await setSecretInPasskey(
          registerData.email + "_secret_1",
          JSON.stringify(secretObj)
        );
        if (storeData.status) {
          storageKeySecret = storeData?.storageKey;
          credentialIdSecret = storeData?.credentialId;
          let liquidBitcoinWallet = "";
          if (resultLiquid) {
            liquidBitcoinWallet = resultLiquid?.hash || "";
          }
          let data = await addUser(
            registerData.email,
            registerData.username,
            [{
              name: registerData.email + "_secret_1",
              storageKeySecret,
              credentialIdSecret
            }],
            address,
            bitcoinWallet,
            liquidBitcoinWallet,
            registerCoinos?.token,
            flowTokens
          );
          toast.success("Sign Up Successfully!");
          dispatch(
            loginSet({
              login: true,
              walletAddress: address || "",
              bitcoinWallet: bitcoinWallet || "",
              signer: "",
              username: registerData.username,
              email: registerData.email,
              webauthKey: JSON.stringify({
                name: registerData.email + "_secret_1",
                storageKeySecret,
                credentialIdSecret
              }),
              id: data.userData._id,
              totalPasskey: 1
            })
          );
          storedataLocalStorage(
            {
              login: true,
              walletAddress: address || "",
              bitcoinWallet: bitcoinWallet || "",
              signer: "",
              username: registerData.username,
              email: registerData.email,
              webauthKey: {
                name: registerData.email + "_secret_1",
                storageKeySecret,
                credentialIdSecret
              },
              id: data.userData._id,
              totalPasskey: 1
            },
            "authUser"
          );
          return true;
        } else {
          toast.error(storeData.msg);
          return false;
        }
      }
    } catch (error) {
      console.log("registerFn error---->", error);
      return false;
    }
  };

  const registerOtpFn = async (data) => {
    try {
      // Check if OTP is expired
      if (isOtpExpired()) {
        toast.error("OTP has expired! Please request a new one.");
        return false;
      }

      if (data.otp != checkOTP) {
        toast.error("Invalid OTP!");
        return false;
      } else {
        let userExist = await getUser(registerData.email);
        if (userExist.status && userExist.status == "success") {
          toast.error("User Already Exist!");
          return false;
        }
        let phrase = await getPrivateKey();
        if (phrase) {
          setAddressPhrase(phrase);
          return true;
        } else {
          toast.error("Try Again After some time!!");
          return false;
        }
      }
    } catch (error) {
      return false;
    }
  };

  const sendRegisterOtp = async (data) => {
    try {
      let userExist = await getUser(data.email);
      if (userExist.status && userExist.status == "success") {
        toast.error("User Already Exist!");
        return false;
      } else {
        let OTP = generateOTP(4);
        setCheckOTP(OTP);
        setOtpTimestamp(new Date().getTime()); // Save the timestamp when OTP is generated
        // console.log("OTP-->", OTP);
        setRegisterData({
          email: data.email,
          username: data.username,
        });
        // return true;
        let obj = {
          email: data.email,
          name: data.username,
          otp: OTP,
          subject: "Madhouse Account Verification OTP",
          type: "registerOtp",
        };
        let sendEmailData = await sendOTP(obj);
        if (sendEmailData.status && sendEmailData.status == "success") {
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

  const resendOtpFunc = async () => {
    try {
      let OTP = generateOTP(4);
      setCheckOTP(OTP);
      setOtpTimestamp(new Date().getTime()); // Update timestamp when OTP is resent
      let obj = {
        email: registerData.email,
        name: registerData.username,
        otp: OTP,
        subject: "Madhouse Account Verification OTP",
        type: "registerOtp",
      };
      let sendEmailData = await sendOTP(obj);
      if (sendEmailData.status && sendEmailData.status == "success") {
        toast.success("OTP sent to your email.");

        return true;
      } else {
        toast.error(sendEmailData?.message || sendEmailData?.error);
        return false;
      }
    } catch (error) {
      console.log("resendOtpFunc error---->", error);
      return false;
    }
  };

  return (
    <>
      {step == 1 ? (
        <>
          <CreateWalletStep
            sendRegisterOtp={sendRegisterOtp}
            step={step}
            setStep={setStep}
          />
        </>
      ) : step == 2 ? (
        <>
          <OtpStep
            registerOtpFn={registerOtpFn}
            resendOtpFunc={resendOtpFunc}
            registerData={registerData}
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
