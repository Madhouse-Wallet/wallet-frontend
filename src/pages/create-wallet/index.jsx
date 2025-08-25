import React, { useState, useEffect } from "react";
import CreateWalletStep from "./CreateWallet";
import OtpStep from "./OtpStep";
import WalletBackup from "./WalletBackup";
import KeyStep from "./keysStep";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { getBitcoinAddress } from "../../lib/apiCall";
import { encryptOTP } from "../../utils/globals";

import { registerCredential, storeSecret } from "../../utils/webauthPrf";
import {
  generateOTP,
  storedataLocalStorage,
  webAuthKeyStore,
  getRandomString,
} from "../../utils/globals";

import { setupNewAccount, getPrivateKey, getMenmonic } from "../../lib/zeroDev";
import TransactionFailedPop from "../../components/Modals/TransactionFailedPop";

const CreateWallet = () => {
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const [checkEmailLoader, setCheckEmailLoader] = useState(false);
  const [checkOTP, setCheckOTP] = useState();
  const [otpTimestamp, setOtpTimestamp] = useState(null);
  const [privateKey, setPrivateKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [safeKey, setSafeKey] = useState("");
  const [addressWif, setAddressWif] = useState("");
  const [bitcoinWallet, setBitcoinWallet] = useState("");

  const [bitcoinWalletwif, setBitcoinWalletWif] = useState("");
  const [txError, setTxError] = useState("");
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState("");

  const [registerData, setRegisterData] = useState({ email: "", username: "" });
  const isOtpExpired = () => {
    if (!otpTimestamp) return true;
    const currentTime = new Date().getTime();
    const expirationTime = otpTimestamp + 10 * 60 * 1000; // 10 minutes in milliseconds
    return currentTime > expirationTime;
  };
  const handleCopy = async (text) => {
    try {
      if (privateKey) {
        await navigator.clipboard.writeText(text);
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
    flowTokens
  ) => {
    try {
      try {
        return await fetch("/api/add-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username,
            passkey,
            wallet,
            bitcoinWallet,
            flowTokens,
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
            verificationCode:  await encryptOTP(otp),
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
      const registerCheck = await registerCredential(userName, userName);
      let res;
      if (registerCheck?.status) {
        const storeSecretCheck = await storeSecret(
          registerCheck?.data?.credentialId,
          data
        );
        if (storeSecretCheck?.status) {
          res = {
            status: true,
            storageKey: storeSecretCheck?.data?.storageKey,
            credentialId: registerCheck?.data?.credentialId,
          };
        } else {
          res = {
            status: false,
            msg: storeSecretCheck?.msg,
          };
        }
      } else {
        res = {
          status: false,
          msg: registerCheck?.msg,
        };
      }
      return res;
    } catch (error) {
      return {
        status: false,
        msg: "Facing issue in storing secret",
      };
    }
  };

  const cleatStates = async () => {
    localStorage.removeItem("verifiedData");
    return true;
  };

  const registerFn = async () => {
    try {
      const userExist = await getUser(registerData.email);
      if (userExist.status && userExist.status === "success") {
        setError("User Already Exist!");
        await cleatStates();
        return false;
      }
      const baseWallet = await setupNewAccount(privateKey, safeKey);
      if (!baseWallet?.status) {
        setFailed(true);
        setTxError("Gas Price is too high currently.");
        return false;
      } else {
        let { address, privateKeyOwner, safePrivateKey, seedPhraseOwner } =
          baseWallet?.data;
        setPrivateKey(privateKeyOwner);
        setSafeKey(safePrivateKey);
        setSeedPhrase(seedPhraseOwner);
        const cleanEmail = registerData?.email
          ?.split("@")[0]
          .replace(/[^a-zA-Z0-9]/g, "");
        const [usernameInit, domainInit] = registerData.email.split("@");
        let token1 = (await getRandomString(6)) + "_" + usernameInit;
        let flowTokens = [{ flow: 1, token: token1 }];
        const secretObj = {
          wif: bitcoinWalletwif,
          privateKey: privateKeyOwner,
          safePrivateKey: safePrivateKey,
          seedPhrase: seedPhraseOwner,
        };
        let encryptedData = "";
        let credentialID = "";
        const userExist = await getUser(registerData.email);
        if (userExist.status && userExist.status === "success") {
          setError("User Already Exist!");
          await cleatStates();
          return false;
        }
        const storeData = await setSecretInPasskey(
          registerData.email + "_passkey_1",
          JSON.stringify(secretObj)
        );
        if (storeData.status) {
          encryptedData = storeData?.storageKey;
          credentialID = storeData?.credentialId;
          const userExist = await getUser(registerData.email);
          if (userExist.status && userExist.status === "success") {
            setError("User Already Exist!");
            await cleatStates();
            return false;
          }
          const data = await addUser(
            registerData.email,
            registerData.username,
            [
              {
                name: registerData.email + "_passkey_1",
                encryptedData,
                credentialID,
                displayName: "",
                bitcoinWallet,
              },
            ],
            address,
            bitcoinWallet,
            flowTokens
          );
          if (data?.status == "failure") {
            setError(data.error);
            await cleatStates();
            setRegisterData({ email: "", username: "" });
            setStep(1);
            return false;
          }
          localStorage.removeItem("verifiedData");
          dispatch(
            loginSet({
              login: true,
              walletAddress: address || "",
              bitcoinWallet: bitcoinWallet || "",
              email: registerData.email,
              webauthnData: JSON.stringify({
                name: registerData.email + "_passkey_1",
                encryptedData,
                credentialID,
              }),

              totalPasskey: 1,
            })
          );
          storedataLocalStorage(
            {
              login: true,
              walletAddress: address || "",
              bitcoinWallet: bitcoinWallet || "",
              email: registerData.email,
              webauthnData: {
                name: registerData.email + "_passkey_1",
                encryptedData,
                credentialID,
              },
              totalPasskey: 1,
            },
            "authUser"
          );
          return true;
        } else {
          setError(storeData.msg);
          return false;
        }
      }
    } catch (error) {
      console.log("registerFn error---->", error);
      return false;
    }
  };

  const registerOtpFn = async (data) => {
    setError("");
    try {
      // Check if OTP is expired
      if (isOtpExpired()) {
        setError("OTP has expired! Please request a new one.");
        return false;
      }

      if (data.otp != checkOTP) {
        setError("Invalid OTP!");
        return false;
      } else {
        let userExist = await getUser(registerData.email);
        if (userExist.status && userExist.status == "success") {
          setError("User Already Exist!");
          return false;
        }
        let getWallet = await getBitcoinAddress();
        if (getWallet.status && getWallet.status == "success") {
          setBitcoinWallet(getWallet?.data?.wallet || "");
          setBitcoinWalletWif(getWallet?.data?.wif || "");
          setAddressWif(getWallet?.data?.wif || "");
          localStorage.setItem(
            "verifiedData",
            JSON.stringify({
              verified: true,
              email: registerData.email,
              username: registerData.username,
            })
          );
          return true;
        } else {
          setError("Try Again After some time!");
          return false;
        }
      }
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };

  const sendRegisterOtp = async (data) => {
    try {
      let userExist = await getUser(data.email);
      if (userExist.status && userExist.status == "success") {
        setError("User Already Exist!");
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
          return true;
        } else {
          setError(sendEmailData?.message || sendEmailData?.error);
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
        return true;
      } else {
        setError(sendEmailData?.message || sendEmailData?.error);
        return false;
      }
    } catch (error) {
      console.log("resendOtpFunc error---->", error);
      return false;
    }
  };

  const checkEmail = async () => {
    try {
      const getVerifiedData = localStorage.getItem("verifiedData");
      if (getVerifiedData) {
        const parsedData = JSON.parse(getVerifiedData);
        if (parsedData.email && parsedData.verified) {
          setCheckEmailLoader(true);
          const userExist = await getUser(parsedData.email);
          if (userExist.status && userExist.status === "success") {
            setCheckEmailLoader(false);
            await cleatStates();
          } else {
            let getWallet = await getBitcoinAddress();
            if (getWallet.status && getWallet.status == "success") {
              setRegisterData({
                email: parsedData.email,
                username: parsedData.username,
              });
              setBitcoinWallet(getWallet?.data?.wallet || "");
              setBitcoinWalletWif(getWallet?.data?.wif || "");
              setAddressWif(getWallet?.data?.wif || "");
              setCheckEmailLoader(false);
              setStep(4);
            } else {
              setCheckEmailLoader(false);
              await cleatStates();
            }
          }
        }
      }
    } catch (e) {
      console.log("error checkEmail-->", e);
      setCheckEmailLoader(false);
    }
  };
  useEffect(() => {
    checkEmail();
  }, []);

  return (
    <>
      {failed &&
        createPortal(
          <TransactionFailedPop
            failed={failed}
            setFailed={setFailed}
            txError={txError}
          />,
          document.body
        )}

      {step == 1 ? (
        <>
          <CreateWalletStep
            sendRegisterOtp={sendRegisterOtp}
            step={step}
            checkEmail={checkEmailLoader}
            setStep={setStep}
            errorr={error}
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
            errorr={error}
            setError={setError}
          />
        </>
      ) : step == 3 ? (
        <>
          <WalletBackup
            handleCopy={handleCopy}
            privateKey={privateKey}
            safeKey={safeKey}
            seedPhrase={seedPhrase}
            addressWif={addressWif}
            step={step}
            setStep={setStep}
            errorr={error}
          />
        </>
      ) : step == 4 ? (
        <>
          <KeyStep
            registerFn={registerFn}
            step={step}
            setStep={setStep}
            error={error}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

CreateWallet.authRoute = true;

export default CreateWallet;
