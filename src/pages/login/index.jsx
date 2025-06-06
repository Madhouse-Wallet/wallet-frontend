import React, { useState } from "react";
import KeyStep from "./KeyStep";
import EmailStep from "./EmailStep";
import { retrieveSecret } from "@/utils/webauthPrf";
import { useBackground } from "@/ContextApi/backgroundContent";
import { addProvisionData } from "../../lib/apiCall";
import { useDispatch } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { toast } from "react-toastify";

import {
  isValidEmail,
  webAuthKeyStore,
  storedataLocalStorage,
} from "../../utils/globals";

const Login = () => {
  const {
    selectBg,
    backgrounds,
    bgOpacity,
    setBgOpacity,
    selectWm,
    watermarks,
    setSelectedWatermark,
    wmOpacity,
    setWmOpacity,
    changeBgOpacity,
    changeWmOpacity,
    selectedBackground,
    selectedWatermark,
  } = useBackground();
  const [step, setStep] = useState(1);
  const [passkeyData, setPasskeyData] = useState([]);
  const [email, setEmail] = useState("");
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
        // userExist?.userId?
        if (userExist?.userId?.passkey?.length == 1) {
          let retrieveSecretCheck = await retrieveSecret(userExist?.userId?.passkey[0].storageKeySecret, userExist?.userId?.passkey[0].credentialIdSecret);
          if (retrieveSecretCheck?.status) {
            toast.success("Login Successfully!");
            dispatch(
              loginSet({
                login: true,
                walletAddress: userExist?.userId?.wallet || "",
                bitcoinWallet: userExist?.userId?.bitcoinWallet || "",
                signer: "",
                username: userExist?.userId?.username,
                email: userExist?.userId?.email,
                webauthKey: JSON.stringify(userExist?.userId?.passkey[0]),
                id: userExist?.userId?._id,
                totalPasskey: 1
              })
            );
            //       passkeyEmail: userExist?.userId?.passkey[0].name,\\
            if (userExist?.userId?.backgroundIndex != null) {
              selectBg(userExist.userId.backgroundIndex);
              localStorage.setItem("backgroundIndex", userExist.userId.backgroundIndex);
            }
  
            if (userExist?.userId?.watermarkIndex != null) {
              selectWm(parseFloat(userExist.userId.watermarkIndex)); 
              localStorage.setItem("watermarkIndex", userExist.userId.watermarkIndex);
            }
  
  
            if (userExist?.userId?.bgOpacity != null) {
              changeBgOpacity(parseFloat(userExist.userId.bgOpacity));
              localStorage.setItem("bgOpacity", userExist.userId.bgOpacity);
            }
  
  
            if (userExist?.userId?.bgOpacity != null) {
              changeWmOpacity(parseFloat(userExist.userId.wmOpacity))
              localStorage.setItem("wmOpacity", userExist.userId.wmOpacity);
            }



            storedataLocalStorage(
              {
                login: true,
                walletAddress: userExist?.userId?.wallet || "",
                bitcoinWallet: userExist?.userId?.bitcoinWallet || "",
                signer: "",
                username: userExist?.userId?.username,
                email: userExist?.userId?.email,
                webauthKey: userExist?.userId?.passkey[0],
                id: userExist?.userId?._id,
                totalPasskey: 1
              },
              "authUser"
            );
            addProvisionData(userExist?.userId?.email);

            return true;
          } else {
            toast.error(
              "Login failed! Please use the correct email and passkey. Account not found."
            );
            return false;
          }
        } else if (userExist?.userId?.passkey?.length == 0) {
          toast.error(
            "Please Add Passkey!"
          );
          return false;
        } else {
          setStep(2)
          setEmail(data.email)
          setPasskeyData(userExist?.userId?.passkey)
        }
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const loginFn2nd = async (email, passkey) => {
    try {
      let userExist = await getUser(email);
      if (userExist.status && userExist.status == "failure") {
        toast.error("User Not Found!");
        return false;
      } else {
        let retrieveSecretCheck = await retrieveSecret(passkey.storageKeySecret, passkey.credentialIdSecret);
        if (retrieveSecretCheck?.status) {
          toast.success("Login Successfully!");
          dispatch(
            loginSet({
              login: true,
              walletAddress: userExist?.userId?.wallet || "",
              bitcoinWallet: userExist?.userId?.bitcoinWallet || "",
              signer: "",
              username: userExist?.userId?.username,
              email: userExist?.userId?.email,
              webauthKey: JSON.stringify(passkey),
              id: userExist?.userId?._id,
              totalPasskey: 1
            })
          );
          //       passkeyEmail: userExist?.userId?.passkey[0].name,

          if (userExist?.userId?.backgroundIndex != null) {
            selectBg(userExist.userId.backgroundIndex);
            localStorage.setItem("backgroundIndex", userExist.userId.backgroundIndex);
          }

          if (userExist?.userId?.watermarkIndex != null) {
            selectWm(parseFloat(userExist.userId.watermarkIndex)); 
            localStorage.setItem("watermarkIndex", userExist.userId.watermarkIndex);
          }


          if (userExist?.userId?.bgOpacity != null) {
            changeBgOpacity(parseFloat(userExist.userId.bgOpacity));
            localStorage.setItem("bgOpacity", userExist.userId.bgOpacity);
          }


          if (userExist?.userId?.bgOpacity != null) {
            changeWmOpacity(parseFloat(userExist.userId.wmOpacity))
            localStorage.setItem("wmOpacity", userExist.userId.wmOpacity);
          }




          storedataLocalStorage(
            {
              login: true,
              walletAddress: userExist?.userId?.wallet || "",
              bitcoinWallet: userExist?.userId?.bitcoinWallet || "",
              signer: "",
              username: userExist?.userId?.username,
              email: userExist?.userId?.email,
              webauthKey: passkey,
              id: userExist?.userId?._id,
              totalPasskey: 1
            },
            "authUser"
          );
            addProvisionData(userExist?.userId?.email);
          return true;
        } else {
          toast.error(
            "Login failed! Please use the correct email and passkey. Account not found."
          );
          return false;
        }
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  }

  return (
    <>
      {step == 1 ? (
        <>
          <EmailStep loginFn={loginFn} step={step} setStep={setStep} />
        </>
      ) : step == 2 ? (
        <>
          <KeyStep step={step} loginFn2nd={loginFn2nd} email={email} passkeyData={passkeyData} loginFn={loginFn} setStep={setStep} />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

Login.authRoute = true;
export default Login;
