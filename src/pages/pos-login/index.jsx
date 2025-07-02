import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { toast } from "react-toastify";

import { isValidEmail, storedataLocalStorage } from "../../utils/globals";

import EmailStep from "./EmailStep";

const POSLogin = () => {
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
        return false;
      }
    } catch (error) {
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
        // toast.success("Pos Login Successfully!");
        dispatch(
          loginSet({
            login: true,
            pos: true,
            walletAddress: userExist.userId.wallet || "",
            bitcoinWallet: userExist.userId.bitcoinWallet || "",
            email: userExist.userId.email,
            passkeyCred: "",
            webauthnData: "",
         
            multisigAddress: userExist.userId.multisigAddress || "",
            passkey2: userExist.userId.passkey2 || "",
            passkey3: userExist.userId.passkey3 || "",
            ensName: userExist.userId.ensName || "",
            ensSetup: userExist.userId.ensSetup || false,
            multisigSetup: userExist.userId.multisigSetup || false,
            multisigActivate: userExist.userId.multisigActivate || false,
          })
        );
        storedataLocalStorage(
          {
            login: true,
            walletAddress: userExist.userId.wallet || "",
            bitcoinWallet: userExist.userId.bitcoinWallet || "",
            pos: true,
            email: userExist.userId.email,
            passkeyCred: "",
            webauthnData: "",
            id: userExist.userId._id,
            multisigAddress: userExist.userId.multisigAddress || "",
            passkey2: "",
            passkey3: "",
            ensName: userExist.userId.ensName || "",
            ensSetup: userExist.userId.ensSetup || false,
            multisigSetup: userExist.userId.multisigSetup || false,
            multisigActivate: userExist.userId.multisigActivate || false,
          },
          "authUser"
        );
        return true;
      }
    } catch (error) {
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
