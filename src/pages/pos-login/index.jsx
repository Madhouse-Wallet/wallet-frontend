import React, { useState } from "react";

import { useRouter } from "next/router";


import {
  getAccount,
  passkeyValidator,
  loginPasskey
} from "../../lib/zeroDevWallet";

import { useDispatch } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { toast } from "react-toastify";

import {
  isValidEmail,
  webAuthKeyStore,
  storedataLocalStorage
} from "../../utils/globals";

import EmailStep from "./EmailStep";


const POSLogin = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [registerData, setRegisterData] = useState({ email: "" });
  const dispatch = useDispatch();




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
  const getUser = async (email, type = "", webAuthKey = "") => {
    try {
      try {
        // console.log(email)
        return await fetch(`/api/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            type,
            webAuthKey
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
        toast.success("Pos Login Successfully!");
        console.log("data-->",userExist)
        dispatch(
          loginSet({
            login: true,
            pos:true,
            walletAddress: userExist.userId.wallet || "",
            bitcoinWallet: userExist.userId.bitcoinWallet || "",
            signer: "",
            username: (userExist.userId.username || ""),
            email: userExist.userId.email,
            passkeyCred: "",
            webauthKey: "",
            id: userExist.userId._id,
            multisigAddress: (userExist.userId.multisigAddress || ""),
            passkey2: (userExist.userId.passkey2 || ""),
            passkey3: (userExist.userId.passkey3 || ""),
            ensName: userExist.userId.ensName || "",
            ensSetup: userExist.userId.ensSetup || false,
            multisigSetup: (userExist.userId.multisigSetup || false),
            multisigActivate: (userExist.userId.multisigActivate || false)
          })
        );
        storedataLocalStorage({
          login: true,
          walletAddress: userExist.userId.wallet || "",
          bitcoinWallet: userExist.userId.bitcoinWallet || "",
          signer: "",
          pos:true,
          username: (userExist.userId.username || ""),
          email: userExist.userId.email,
          passkeyCred: "",
          webauthKey: "",
          id: userExist.userId._id,
          multisigAddress: (userExist.userId.multisigAddress || ""),
          passkey2: "",
          passkey3: "",
          ensName: userExist.userId.ensName || "",
          ensSetup: userExist.userId.ensSetup || false,
          multisigSetup: (userExist.userId.multisigSetup || false),
          multisigActivate: (userExist.userId.multisigActivate || false)
        }, "authUser")
        return true;
      }
    } catch (error) {
      console.log("error---->", error);
      toast.error(error.message);
      return false;
    }
  };

  return (
    <>
          <EmailStep loginFn={loginFn} step={step} setStep={setStep} />
      
    </>
  );
};

POSLogin.authRoute = true;
export default POSLogin;
