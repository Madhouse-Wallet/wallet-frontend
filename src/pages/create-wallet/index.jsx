import React, { useState } from "react";
import { useRouter } from "next/router";
import CreateWalletStep from "./CreateWallet";
import OtpStep from "./OtpStep";
import WalletBackup from "./WalletBackup";
import KeyStep from "./keysStep";

import { useDispatch, useSelector } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { toast } from "react-toastify";
import {
  createCoinosInvoice,
  getBitcoinAddress,
  registerCoinosUser,
  sendBitcoinn,
} from "../../lib/apiCall";
import { registerCredential, storeSecret, retrieveSecret } from "../../utils/webauthPrf";

import {
  generateOTP,
  isValidEmail,
  storedataLocalStorage,
  webAuthKeyStore,
} from "../../utils/globals";

import {
  createAccount,
  getAccount,
  getMnemonic,
  registerPasskey,
  passkeyValidator,
} from "../../lib/zeroDevWallet";

// const getWallet = async () => {
//   try {
//     let getWallet = await getBitcoinAddress();
//     console.log("getWallet-->", getWallet)
//   } catch (error) {
//     console.log("errr-->", error)
//   }
// }
// getWallet();
const CreateWallet = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const [checkOTP, setCheckOTP] = useState();
  const [otpTimestamp, setOtpTimestamp] = useState(null);
  const [loginEmail, setLoginEmail] = useState();
  const [addressPhrase, setAddressPhrase] = useState("");
  const [registerData, setRegisterData] = useState({ email: "", username: "" });
  console.log("registerData->", registerData);
  // Helper function to check OTP expiration
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
    publickeyId,
    rawId,
    wallet,
    bitcoinWallet,
    secretEmail,
    secretCredentialId,
    secretStorageKey,
    liquidBitcoinWallet,
    liquidBitcoinWallet_2,
    liquidBitcoinWallet_3
  ) => {
    try {
      try {
        console.log(
          email,
          username,
          passkey,
          publickeyId,
          rawId,
          bitcoinWallet,
          secretEmail,
          secretCredentialId,
          secretStorageKey,
          liquidBitcoinWallet,
          liquidBitcoinWallet_2,
          liquidBitcoinWallet_3
        );
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
            bitcoinWallet,
            secretEmail,
            secretCredentialId,
            secretStorageKey,
            liquidBitcoinWallet,
            liquidBitcoinWallet_2,
            liquidBitcoinWallet_3
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

  const sendOTP = async ({ email, name, otp, subject, type }) => {
    try {
      console.log(
        "process.env.NEXT_PUBLIC_DOMAIN",
        process.env.NEXT_PUBLIC_DOMAIN
      );
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


  const setSecretInPasskey = async (userName, data) => {
    try {
      let registerCheck = await registerCredential(userName, userName)
      if (registerCheck?.status) {
        let storeSecretCheck = await storeSecret(registerCheck?.data?.credentialId, data)
        if (storeSecretCheck?.status) {
          return {
            status: true,
            storageKey: storeSecretCheck?.data?.storageKey,
            credentialId: registerCheck?.data?.credentialId
          }
        } else {
          console.log(" storeSecretCheck error-->", storeSecretCheck?.msg)
          return {
            status: false,
            msg: storeSecretCheck?.msg
          }
        }
      } else {
        console.log(" registerCheck error-->", registerCheck?.msg)
        return {
          status: false,
          msg: registerCheck?.msg
        }
      }
    } catch (error) {
      return {
        status: false,
        msg: "Facing issue in storing secret"
      }
    }
  }

  const registerFn = async () => {
    try {
      let userExist = await getUser(registerData.email);
      if (userExist.status && userExist.status == "success") {
        toast.error("User Already Exist!");
        return false;
      }
      const createdWebAuthKey = await registerPasskey(
        registerData.email + "_passkey_1"
      );
      if (!createdWebAuthKey.status) {
        toast.error(createdWebAuthKey.msg);
        return false;
      } else {
        const {
          newPasskeyValidator = "",
          msg = "",
          status = "",
        } = await passkeyValidator(createdWebAuthKey.webAuthnKey);
        //webAuthnKey
        if (!status) {
          toast.error(msg);
          return false;
        } else {
          let {
            msg = "",
            status = true,
            account = "",
            kernelClient = "",
            address = "",
          } = await createAccount(newPasskeyValidator, addressPhrase);
          if (!status) {
            toast.error(msg);
            return false;
          } else {
            console.log("new account-->", account, address);
            let webAuthKeyStringObj = await webAuthKeyStore(
              createdWebAuthKey.webAuthnKey
            );
            let userExist = await getUser(registerData.email);
            if (userExist.status && userExist.status == "success") {
              toast.error("User Already Exist!");
              return false;
            }

            const cleanEmail = registerData?.email?.replace(
              /[^a-zA-Z0-9]/g,
              ""
            );

            let registerCoinos = await registerCoinosUser(
              cleanEmail,
              "testttttttt"
            );

            console.log("registerCoinos", registerCoinos);
            localStorage.setItem("coinosToken", registerCoinos?.token);
            // const result = await createCoinosInvoice(
            //   registerCoinos?.token,
            //   "1",
            //   "bitcoin"
            // );
            // console.log("result-----result", result);
            const resultLiquid = await createCoinosInvoice(
              registerCoinos?.token,
              "1",
              "liquid",
              "lbtcusdc"
            );
            console.log("resultLiquid-->", resultLiquid)

            const resultLiquid1 = await createCoinosInvoice(
              registerCoinos?.token,
              "1",
              "liquid",
              "lbtctbtc"
            );
            console.log("resultLiquid1-->", resultLiquid1)

            const resultLiquid2 = await createCoinosInvoice(
              registerCoinos?.token,
              "1",
              "liquid",
              "tbtclbtc"
            );
            console.log("resultLiquid2-->", resultLiquid2)

            // console.log("resultLiquid-->", resultLiquid)
            // let secretObj = {
            //   coinosToken: (registerCoinos?.token || ""),
            //   seedPhrase: addressPhrase
            // }
            // console.log("secretObj-->", secretObj, JSON.stringify(secretObj))

            // let storageKeySecret = "";
            // let credentialIdSecret = "";
            // let storeData = await setSecretInPasskey((registerData.email + "_secret"), JSON.stringify(secretObj));
            // if (storeData.status) {
            //   console.log("storeData-->", storeData)
            //   storageKeySecret = storeData?.storageKey
            //   credentialIdSecret = storeData?.credentialId
            // }

            let getWallet = await getBitcoinAddress();

            let bitcoinWallet = "";
            if (getWallet.status && getWallet.status == "success") {
              bitcoinWallet = getWallet?.data?.wallet || "";
            }

            let secretObj = {
              coinosToken: (registerCoinos?.token || ""),
              privateKey: getWallet?.data?.privateKey || "",
              publicKey: getWallet?.data?.publicKey || "",
              wif: getWallet?.data?.wif || "",
              seedPhrase: addressPhrase
            }
            console.log("secretObj-->", secretObj, JSON.stringify(secretObj))
            let storageKeySecret = "";
            let credentialIdSecret = "";
            let storeData = await setSecretInPasskey((registerData.email + "_secret"), JSON.stringify(secretObj));
            if (storeData.status) {
              console.log("storeData-->", storeData)
              storageKeySecret = storeData?.storageKey
              credentialIdSecret = storeData?.credentialId
            }

            // let bitcoinWallet = "";
            let liquidBitcoinWallet = "";
            let liquidBitcoinWallet_2 = "";
            let liquidBitcoinWallet_3 = "";
            // if (result) {
            //   bitcoinWallet = result?.hash || "";
            // }
            if (resultLiquid) {
              liquidBitcoinWallet = resultLiquid?.hash || "";
            }
            if (resultLiquid1) {
              liquidBitcoinWallet_2 = resultLiquid1?.hash || "";
            }
            if (resultLiquid2) {
              liquidBitcoinWallet_3 = resultLiquid2?.hash || "";
            }
            

            let data = await addUser(
              registerData.email,
              registerData.username,
              [webAuthKeyStringObj],
              "",
              "",
              address,
              bitcoinWallet,
              (registerData.email + "_secret"),
              credentialIdSecret,
              storageKeySecret,
              liquidBitcoinWallet,
              liquidBitcoinWallet_2,
              liquidBitcoinWallet_3
            );
            toast.success("Sign Up Successfully!");
            console.log(
              "data-->",
              data,
              createdWebAuthKey,
              newPasskeyValidator
            );
            dispatch(
              loginSet({
                login: true,
                walletAddress: address || "",
                bitcoinWallet: bitcoinWallet || "",
                signer: "",
                username: registerData.username,
                email: registerData.email,
                passkeyCred: newPasskeyValidator,
                webauthKey: createdWebAuthKey.webAuthnKey,
                id: data.userData._id,
                multisigAddress: data.userData.multisigAddress,
                passkey2: data.userData.passkey2,
                passkey3: data.userData.passkey3,
                ensName: data.userData.ensName || "",
                ensSetup: data.userData.ensSetup || false,
                multisigSetup: data.userData.multisigSetup,
                multisigActivate: data.userData.multisigActivate,
              })
            );
            let webAuthKeyStringObj2 = "";
            let webAuthKeyStringObj3 = "";
            if (data.userData.passkey2) {
              webAuthKeyStringObj2 = await webAuthKeyStore(
                data.userData.passkey2
              );
            }
            if (data.userData.passkey3) {
              webAuthKeyStringObj3 = await webAuthKeyStore(
                data.userData.passkey3
              );
            }

            storedataLocalStorage(
              {
                login: true,
                walletAddress: address || "",
                bitcoinWallet: bitcoinWallet || "",
                signer: "",
                username: registerData.username,
                email: registerData.email,
                passkeyCred: "",
                webauthKey: webAuthKeyStringObj,
                id: data.userData._id,
                multisigAddress: data.userData.multisigAddress,
                passkey2: webAuthKeyStringObj2,
                passkey3: webAuthKeyStringObj3,
                ensName: data.userData.ensName || "",
                ensSetup: data.userData.ensSetup || false,
                multisigSetup: data.userData.multisigSetup,
                multisigActivate: data.userData.multisigActivate,
              },
              "authUser"
            );
            return true;
          }
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
      // console.log("OTP-->", OTP)
      let obj = {
        email: registerData.email,
        name: registerData.username,
        otp: OTP,
        subject: "Madhouse Account Verification OTP",
        type: "registerOtp",
      };
      let sendEmailData = await sendOTP(obj);
      if (sendEmailData.status && sendEmailData.status == "success") {
        // toast.success(sendEmailData?.message);
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
