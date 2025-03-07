import { useRouter } from "next/router";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/ContextApi/ThemeContext";
import { BackBtn } from "@/components/common";
import Link from "next/link";
import Web3Authh from "../../components/web3Auth/web3Auth";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";

import {
  generateOTP,
  isValidEmail,
  storedataLocalStorage,
  webAuthKeyStore
} from "../../utils/globals";

import {
  createMultisigSocialLoginAccount,
  getAccount,
  getMnemonic,
  registerPasskey,
  passkeyValidator,
  loginPasskey
} from "../../lib/zeroDevWallet";


const Welcome = () => {
  const { theme, toggleTheme } = useTheme();
  const [web3AuthProviderC, setWeb3AuthProviderC] = useState("");
  const [loading, setLoading] = useState(false);

  const [userInfo, setUserInfo] = useState("");
  const dispatch = useDispatch();
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
  const registerFn = async (web3Auth, userInfo) => {
    try {
      setLoading(true)
      console.log("userInfo-->", userInfo?.email)
      // await web3Auth.logout();
      let userExist = await getUser(userInfo?.email);
      if (userExist.status && userExist.status == "success") {
        const createdWebAuthKey = await loginPasskey(userInfo?.email);
        if (!createdWebAuthKey.status) {
          toast.error(createdWebAuthKey.msg);
          return false;
        } 
        const { newPasskeyValidator = "", msg = "", status = "" } = await passkeyValidator(createdWebAuthKey.webAuthnKey);
          //webAuthnKey
          if (!status) {
            toast.error(msg);
            return false;
          } else {
            let { msg = "", status = true, account = "", kernelClient = "", address = "" } = await getAccount(newPasskeyValidator);
            if (!status) {
              toast.error(msg);
              return false;
            } else {
              let webAuthKeyStringObj = await webAuthKeyStore(createdWebAuthKey.webAuthnKey)
              userExist = await getUser(userInfo?.email, "passkeyCheck",
                webAuthKeyStringObj);
              if (userExist.status && userExist.status == "failure") {
                toast.error("Login failed! Please use the correct email and passkey. Account not found.");
                return false;
              }
              // if (userExist.userId.wallet == address) {
              toast.success("Login Successfully!");
              console.log("data-->", userExist, createdWebAuthKey, newPasskeyValidator)
              dispatch(
                loginSet({
                  login: true,
                  walletAddress: address || "",
                  pos:false,
                  signer: "",
                  username: (userExist.userId.username || ""),
                  web3Auth: web3Auth,
                  email: userExist.userId.email,
                  passkeyCred: newPasskeyValidator,
                  webauthKey: createdWebAuthKey.webAuthnKey,
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


              let webAuthKeyStringObj2 = ""
              let webAuthKeyStringObj3 = ""
              if (userExist.userId.passkey2) {
                webAuthKeyStringObj2 = await webAuthKeyStore(userExist.userId.passkey2)
              }
              if (userExist.userId.passkey3) {
                webAuthKeyStringObj3 = await webAuthKeyStore(userExist.userId.passkey3)
              }

              storedataLocalStorage({
                login: true,
                walletAddress: address || "",
                pos:false,
                signer: "",
                username: (userExist.userId.username || ""),
                email: userExist.userId.email,
                passkeyCred: "",
                webauthKey: webAuthKeyStringObj,
                id: userExist.userId._id,
                multisigAddress: (userExist.userId.multisigAddress || ""),
                passkey2: webAuthKeyStringObj2,
                passkey3: webAuthKeyStringObj3,
                ensName: userExist.userId.ensName || "",
                ensSetup: userExist.userId.ensSetup || false,
                multisigSetup: (userExist.userId.multisigSetup || false),
                multisigActivate: (userExist.userId.multisigActivate || false)
              }, "authUser")
              setLoading(false)
              router.push("/");
              return true;
              // } else {
              //   toast.error("Login failed! Please use the correct email and passkey. Account not found.");
              //   return false;
              // }
            }
      } 
    }else {
        let addressPhrase = await getMnemonic();
        const createdWebAuthKey = await registerPasskey(userInfo?.email + "_passkey_6");
        if (!createdWebAuthKey.status) {
          toast.error(createdWebAuthKey.msg);
          return false;
        } else {
          const { newPasskeyValidator = "", msg = "", status = "" } = await passkeyValidator(createdWebAuthKey.webAuthnKey);
          //webAuthnKey
          if (!status) {
            toast.error(msg);
            return false;
          } else {
            console.log("web3AuthProviderC->", web3AuthProviderC, web3Auth.provider)
            const privateKey = await web3Auth.provider.request({
              method: "eth_private_key",
            });
            // console.log("privateKey-->", privateKey)
            const eoaAccount1 = privateKeyToAccount(`0x${privateKey}`)
            console.log("eoaAccount1-->", eoaAccount1)



            let { msg = "", status = true, account = "", kernelClient = "", address = "" } = await createMultisigSocialLoginAccount(
              addressPhrase,
              createdWebAuthKey.webAuthnKey,
              eoaAccount1
            );
            if (!status) {
              toast.error(msg);
              return false;
            } else {
              console.log("new account-->", account, address);
              let webAuthKeyStringObj = await webAuthKeyStore(createdWebAuthKey.webAuthnKey);
              let userExist = await getUser(userInfo?.email);
              if (userExist.status && userExist.status == "success") {
                toast.error("User Already Exist!");
                return false;
              }
              let data = await addUser(
                userInfo?.email,
                "",
                [webAuthKeyStringObj],
                "",
                "",
                address
              );
              toast.success("Sign Up Successfully!");
              console.log("data-->", data, createdWebAuthKey, newPasskeyValidator)
              dispatch(
                loginSet({
                  login: true,
                  walletAddress: address || "",
                  signer: "",
                  username: "",
                  email: userInfo?.email,
                  passkeyCred: newPasskeyValidator,
                  webauthKey: createdWebAuthKey.webAuthnKey,
                  id: data.userData._id,
                  multisigAddress: data.userData.multisigAddress,
                  passkey2: data.userData.passkey2,
                  passkey3: data.userData.passkey3,
                  ensName: data.userData.ensName || "",
                  web3Auth: web3Auth,
                  ensSetup: data.userData.ensSetup || false,
                  multisigSetup: data.userData.multisigSetup,
                  multisigActivate: data.userData.multisigActivate
                })
              );
              let webAuthKeyStringObj2 = ""
              let webAuthKeyStringObj3 = ""
              if (data.userData.passkey2) {
                webAuthKeyStringObj2 = await webAuthKeyStore(data.userData.passkey2)
              }
              if (data.userData.passkey3) {
                webAuthKeyStringObj3 = await webAuthKeyStore(data.userData.passkey3)
              }

              storedataLocalStorage({
                login: true,
                walletAddress: address || "",
                signer: "",
                username: "",
                email: userInfo?.email,
                passkeyCred: "",
                webauthKey: webAuthKeyStringObj,
                id: data.userData._id,
                multisigAddress: data.userData.multisigAddress,
                passkey2: webAuthKeyStringObj2,
                passkey3: webAuthKeyStringObj3,
                ensName: data.userData.ensName || "",
                ensSetup: data.userData.ensSetup || false,
                multisigSetup: data.userData.multisigSetup,
                multisigActivate: data.userData.multisigActivate
              }, "authUser")
              setLoading(false)
              router.push("/");
            }
          }
        }
      }

    } catch (error) {
      console.log("registerFn error---->", error);
      setLoading(false)
      return false;
    }
  };

  const router = useRouter();
  return (
    <>
      {" "}
      <div className="mx-auto max-w-sm">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center justify-center mb-2 gap-3">
                <BackBtn />
                <Image
                  src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow.png"}
                  alt="logo"
                  className="max-w-full mx-auto w-auto "
                  height={100000}
                  width={10000}
                  style={{ height: 40 }}
                />
              </div>
              <h1 className="text-center text-base font-medium  m-0">
                Madhouse Wallet
              </h1>
              <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
              </p>
            </div>
          </div>
        </div>
        <div className="btnWrpper pt-4 mt-4 text-center flex gap-3 justify-center">
          <button
            onClick={() => router.push("/create-wallet")}
            type="submit"
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
          >
            Create Wallet
          </button>
          <button
            onClick={() => router.push("/login")}
            type="submit"
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
          >
            Log in
          </button>
        </div>
        <div className="mt-2 text-center flex gap-3 justify-center">
          <Link href={"/pos-login"}
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
          >
            POS Login</Link>
          <Link href={"/recover-wallet"}
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
          >
            Recover Wallet</Link>

          {/* <div className="py-1">
          </div>
          <div className="py-1">
          </div> */}
        </div>
        <div className="mt-2">
          {
            (loading && (<button disabled={true}
              className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}>
              Please Wait...
            </button>)) || (<Web3Authh setWeb3AuthProviderC={setWeb3AuthProviderC} registerFn={registerFn} setUserInfo={setUserInfo} />)
          }

        </div>
      </div>
    </>
  );
};
Welcome.authRoute = true;
export default Welcome;
