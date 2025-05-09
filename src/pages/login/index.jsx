import React, { useState } from "react";
import KeyStep from "./KeyStep";
import EmailStep from "./EmailStep";

import {
  getAccount,
  passkeyValidator,
  loginPasskey,
} from "../../lib/zeroDevWallet";

import { useDispatch } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { toast } from "react-toastify";

import {
  isValidEmail,
  webAuthKeyStore,
  storedataLocalStorage,
} from "../../utils/globals";

const Login = () => {
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();

  const getUser = async (email, type = "", webAuthKey = "") => {
    try {
      try {
        return await fetch(`/api/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            type,
            webAuthKey,
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
        const createdWebAuthKey = await loginPasskey(data.email);
        if (!createdWebAuthKey.status) {
          toast.error(createdWebAuthKey.msg);
          return false;
        } else {
          const {
            newPasskeyValidator = "",
            msg = "",
            status = "",
          } = await passkeyValidator(createdWebAuthKey.webAuthnKey);
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
            } = await getAccount(newPasskeyValidator);
            if (!status) {
              toast.error(msg);
              return false;
            } else {
              let webAuthKeyStringObj = await webAuthKeyStore(
                createdWebAuthKey.webAuthnKey
              );
              userExist = await getUser(
                data.email,
                "passkeyCheck",
                webAuthKeyStringObj
              );
              if (userExist.status && userExist.status == "failure") {
                toast.error(
                  "Login failed! Please use the correct email and passkey. Account not found."
                );
                return false;
              }
              toast.success("Login Successfully!");
              // console.log(
              //   "data-->",
              //   data,
              //   userExist,
              //   createdWebAuthKey,
              //   newPasskeyValidator
              // );
              dispatch(
                loginSet({
                  login: true,
                  walletAddress: address || "",
                  bitcoinWallet: userExist?.userId?.bitcoinWallet || "",
                  pos: false,
                  signer: "",
                  username: userExist.userId.username || "",
                  email: userExist.userId.email,
                  passkeyCred: newPasskeyValidator,
                  webauthKey: createdWebAuthKey.webAuthnKey,
                  id: userExist.userId._id,
                  multisigAddress: userExist.userId.multisigAddress || "",
                  passkey2: userExist.userId.passkey2 || "",
                  passkey3: userExist.userId.passkey3 || "",
                  ensName: userExist.userId.ensName || "",
                  ensSetup: userExist.userId.ensSetup || false,
                  multisigSetup: userExist.userId.multisigSetup || false,
                  multisigActivate: userExist.userId.multisigActivate || false,
                })
              );

              let webAuthKeyStringObj2 = "";
              let webAuthKeyStringObj3 = "";
              if (userExist.userId.passkey2) {
                webAuthKeyStringObj2 = await webAuthKeyStore(
                  userExist.userId.passkey2
                );
              }
              if (userExist.userId.passkey3) {
                webAuthKeyStringObj3 = await webAuthKeyStore(
                  userExist.userId.passkey3
                );
              }

              storedataLocalStorage(
                {
                  login: true,
                  walletAddress: address || "",
                  bitcoinWallet: userExist?.userId?.bitcoinWallet || "",
                  pos: false,
                  signer: "",
                  username: userExist.userId.username || "",
                  email: userExist.userId.email,
                  passkeyCred: "",
                  webauthKey: webAuthKeyStringObj,
                  id: userExist.userId._id,
                  multisigAddress: userExist.userId.multisigAddress || "",
                  passkey2: webAuthKeyStringObj2,
                  passkey3: webAuthKeyStringObj3,
                  ensName: userExist.userId.ensName || "",
                  ensSetup: userExist.userId.ensSetup || false,
                  multisigSetup: userExist.userId.multisigSetup || false,
                  multisigActivate: userExist.userId.multisigActivate || false,
                },
                "authUser"
              );
              return true;
            }
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
      return false;
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
