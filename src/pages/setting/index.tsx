"use client";
import ChangeEmailPop from "@/components/Modals/ChangeEmail";
import ConfirmationPop from "@/components/Modals/ConfirmationPop";
import MultiSignPop from "@/components/Modals/multisignPop";
import SetupRecoveryPop from "@/components/Modals/SetupRecovery";
import RecoverPopup from "@/components/Modals/RecoverPopup";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useBackground } from "@/ContextApi/backgroundContent";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { logoutStorage } from "../../utils/globals";

import { retrieveSecret, verifyUser } from "../../utils/webauthPrf";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { splitAddress } from "../../utils/globals";
import { getUser, addProvisionData } from "../../lib/apiCall";
import { useToast } from "@/ContextApi/ToastContext";
const Setting: React.FC = () => {
  const { showToast } = useToast();

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
  const dispatch = useDispatch();
  const userAuth = useSelector((state: any) => state.Auth);
  const [setUp, setSetUp] = useState<boolean>(false);
  const [recover, setRecover] = useState<boolean>(false);
  const [ensDomain, setEnsDomain] = useState<boolean>(false);
  const [sign, setSign] = useState<boolean>(false);
  const [changeEmail, setChangeEmail] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [recoverSeedStatus, setRecoverSeedStatus] = useState<any>(false);
  const [recoverSeed, setRecoverSeed] = useState<any>("");
  const [lnbitLink, setLnbitLink] = useState("");
  const [lnbitLink2, setLnbitLink2] = useState("");
  const [adminId, setAdminId] = useState<any>("");
  const [tposId1, setTposId1] = useState<any>("");
  const [tposId2, setTposId2] = useState<any>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [step, setStep] = useState(1);
  const [loading, setloading] = useState(false);
  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      let userExist = await getUser(userAuth.email);
      // setTposId1(userExist?.userId?.lnbitLinkId || "");
      // setTposId2(userExist?.userId?.lnbitLinkId_2 || "");
      // setAdminId(userExist?.userId?.lnbitAdminKey_3 || "");
    };
    if (userAuth.email) {
      getUserData();
    }
  }, []);

  // const getPreview = async () => {
  //   try {
  //     return await fetch(`/api/get-preview`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         url: "https://devstack.madhousewallet.com/dashboard",
  //       }),
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         return data;
  //       });
  //   } catch (error) {
  //     return false;
  //   }
  // };

  const getSecretData = async (storageKey: any, credentialId: any) => {
    try {
      let retrieveSecretCheck = (await retrieveSecret(
        storageKey,
        credentialId
      )) as any;
      if (retrieveSecretCheck?.status) {
        return {
          status: true,
          secret: retrieveSecretCheck?.data?.secret,
        };
      } else {
        return {
          status: false,
          msg: retrieveSecretCheck?.msg,
        };
      }
    } catch (error) {
      return {
        status: false,
        msg: "Error in Getting secret!",
      };
    }
  };

  // settingindex.tsx
  const recoverSeedPhrase = async () => {
    try {
      setLoader(true);
      let data = JSON.parse(userAuth?.webauthnData);
      let callGetSecretData = (await getSecretData(
        data?.encryptedData,
        data?.credentialID
      )) as any;
      if (callGetSecretData?.status) {
        setRecoverSeed(JSON.parse(callGetSecretData?.secret));
        setStep(1);
        setRecoverSeedStatus(true);
        setRecover(!recover);
      } else {
        setRecoverSeed(callGetSecretData?.msg);
        setRecoverSeedStatus(false);
        setLoader(false);
      }
    } catch (error) {
      setRecoverSeed("Error in Fetching secret!");
      setRecoverSeedStatus(false);
      setLoader(false);
    }
  };

  const verifyingUser = async () => {
    setloading(true);
    let data = JSON.parse(userAuth?.webauthnData);
    let userData = await verifyUser(data?.credentialID);
    if (
      userData.status === true &&
      userData.msg === "User verified successfully"
    ) {
      setStep(4);
      setRecover(!recover);
    } else {
      setloading(false);
    }
  };

  useEffect(() => {
    const data = async () => {
      let userExist = await getUser(userAuth.email);
      setLnbitLink(userExist?.userId?.lnbitLinkId || "");
      setLnbitLink2(userExist?.userId?.lnbitLinkId_2 || "");
    };
    data();
  }, []);

  const router = useRouter();
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const clearSettings = async () => {
    selectBg(0, false);
    changeBgOpacity(1, false);
    selectWm(0, false);
    changeWmOpacity(0.5, false);
  };
  const LogoutFuc = async () => {
    try {
      // addProvisionData(userAuth.email);
      logoutStorage();
      showToast("Logout Successfully");
      dispatch(
        loginSet({
          login: false,
          walletAddress: "",
          bitcoinWallet: "",
          email: "",
          passkeyCred: "",
          webauthnData: "",

          multisigAddress: "",
          passkey2: "",
          passkey3: "",
          multisigSetup: false,
          multisigActivate: false,
          ensName: "",
          ensSetup: false,
        })
      );

      clearSettings();
    } catch (error) {
      console.log("logout error --->", error);
    }
  };
  return (
    <>
      {sign &&
        createPortal(
          <MultiSignPop sign={sign} setSign={setSign} />,
          document.body
        )}

      {recover &&
        createPortal(
          <RecoverPopup
            recover={recover}
            setRecover={setRecover}
            adminId={adminId}
            phrase={recoverSeed}
            phraseStatus={recoverSeedStatus}
            setLoader={setLoader}
            step={step}
            setloading={setloading}
          />,
          document.body
        )}

      {setUp &&
        createPortal(
          <SetupRecoveryPop setUp={setUp} setSetUp={setSetUp} />,
          document.body
        )}
      {changeEmail &&
        createPortal(
          <ChangeEmailPop
            changeEmail={changeEmail}
            setChangeEmail={setChangeEmail}
          />,
          document.body
        )}
      {confirm &&
        createPortal(
          <ConfirmationPop confirm={confirm} setConfirm={setConfirm} />,
          document.body
        )}
      <section className="relative dashboard  h-full flex items-center py-[30px] sm:flex-row flex-col">
        <div className="absolute inset-0 backdrop-blur-xl h-full"></div>

        <div className="container relative">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[12px] right-[25px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <header className="siteHeader top-0 py-2 w-full z-[999]">
            <div className="container mx-auto">
              <Nav className=" px-3 py-3 rounded-[20px] shadow relative flex items-center justify-center flex-wrap gap-2">
                <div className="left">
                  <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                    Setting & Support
                  </h4>
                </div>
              </Nav>
            </div>
          </header>
          <div
            className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 datbackg
          a-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]"
          >
            <div className="grid gap-3 md:gap-4 grid-cols-12 lg:px-8 px-3 py-10">
              <div className=" col-span-12">
                <div
                  className={` bg-white/5 h-full rounded-12 relative overflow-hidden  px-3 py-4 flex-wrap  lg:p-6 flex justify-between gap-3`}
                >
                  <div className="left sm:w-[340px] w-full">
                    <h4 className="m-0 font-bold text-xl">Information</h4>
                    <ul className="list-none pl-0 mb-0 text-xs">
                      <li className="flex gap-2 py-1">
                        <div
                          className="block text-gray-500"
                          style={{ width: 160 }}
                        >
                          wallet ID:
                        </div>
                        {/* {userAuth?.walletAddress && ( */}
                        <span className="text-white flex items-center truncate w-[calc(100%-170px)] ">
                          {userAuth?.walletAddress ? (
                            <>
                              {splitAddress(userAuth?.walletAddress)}
                              <button
                                onClick={() =>
                                  handleCopy(userAuth?.walletAddress)
                                }
                                className="border-0 p-0 bg-transparent pl-1"
                              >
                                {copyIcn}
                              </button>
                            </>
                          ) : (
                            "--"
                          )}
                        </span>
                        {/* )} */}
                      </li>
                      {
                        <>
                          {" "}
                          <li className="flex gap-2 py-1">
                            <div
                              className="block text-gray-500"
                              style={{ width: 160 }}
                            >
                              Bitcoin wallet ID:
                            </div>
                            {/* {userAuth?.walletAddress && ( */}
                            <span className="text-white flex items-center truncate w-[calc(100%-170px)]">
                              {userAuth?.bitcoinWallet ? (
                                <>
                                  {splitAddress(userAuth?.bitcoinWallet)}
                                  <button
                                    onClick={() =>
                                      handleCopy(userAuth?.bitcoinWallet)
                                    }
                                    className="border-0 p-0 bg-transparent pl-1"
                                  >
                                    {copyIcn}
                                  </button>
                                </>
                              ) : (
                                "--"
                              )}
                            </span>
                            {/* )} */}
                          </li>
                        </>
                      }
                      <li className="flex gap-2 py-1">
                        <div
                          className="block text-gray-500"
                          style={{ width: 160 }}
                        >
                          Email Address:
                        </div>
                        {/* {userAuth?.email && ( */}
                        <span className="text-white block items-center truncate w-[calc(100%-170px)]">
                          {userAuth?.email ? userAuth?.email : "--"}
                        </span>
                        {/* )} */}
                      </li>
                      {
                        // tposId1 tposId2
                        <>
                          {/* <li className="flex gap-2 py-1">
                            <div
                              className="block text-gray-500"
                              style={{ width: 160 }}
                            >
                              USD Tpos ID:
                            </div>
                            <span className="text-white block items-center truncate w-[calc(100%-170px)]">
                              {userAuth?.email && tposId1 ? tposId1 : "--"}
                            </span>
                          </li> */}
                          {/* <li className="flex gap-2 py-1">
                            <div
                              className="block text-gray-500"
                              style={{ width: 160 }}
                            >
                              Bitcoin Tpos ID:
                            </div>
                            <span className="text-white block items-center truncate w-[calc(100%-170px)]">
                              {userAuth?.email && tposId2 ? tposId2 : "--"}
                            </span>
                          </li> */}
                        </>
                      }
                    </ul>
                  </div>
                  <div className="right">
                    {userAuth?.login ? (
                      <button
                        onClick={LogoutFuc}
                        className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-10 h-[40px] px-[15px] text-13 text-destructive/90 hover:text-destructive2-lightest focus:text-destructive2-lightest"
                      >
                        {logoutIcn} Logout
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push("/welcome")}
                          className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-10 h-[40px] px-[15px] text-13 text-destructive/90 hover:text-destructive2-lightest focus:text-destructive2-lightest"
                        >
                          Login
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-12">
                <div className="rounded-12 bg-white/5 px-3 py-4 max-lg:min-h-[95px] lg:p-6 umbrel-divide-y overflow-hidden !py-0">
                  <div
                    tabIndex={-1}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-medium leading-none -tracking-2">
                        Wallpaper
                      </h3>
                      <p className="text-xs leading-none -tracking-2 text-white/40">
                        Your Madhouse wallpaper and theme
                      </p>
                    </div>
                    <div className="-mx-2 max-w-full">
                      <div className="flex-grow-1 flex h-7 max-w-full items-center animate-in fade-in">
                        <ul className="list-none pl-0 mb-0 flex items-center gap-2">
                          {backgrounds.map((bg: string, index: number) => (
                            <li className="" key={index}>
                              <button
                                onClick={() => {
                                  selectBg(index);
                                  // getPreview();
                                }}
                                className={`${
                                  selectedBackground === bg ? "border-2 " : ""
                                } border-0 p-0 bg-transparent rounded`}
                              >
                                <Image
                                  src={bg}
                                  height={10000}
                                  width={10000}
                                  alt=""
                                  style={{ height: 30, width: 40 }}
                                  className="max-w-full object-cover rounded"
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div
                    tabIndex={-1}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-medium leading-none -tracking-2">
                        Wallpaper Opacity
                      </h3>
                      <p className="text-xs leading-none -tracking-2 text-white/40">
                        Your Madhouse wallpaper opacity
                      </p>
                    </div>
                    <div className="-mx-2 max-w-full">
                      <div className="flex-grow-1 flex h-7 max-w-full items-center animate-in fade-in">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={bgOpacity}
                          onChange={(e) => {
                            changeBgOpacity(parseFloat(e.target.value));
                            // getPreview();
                          }}
                          className="w-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    tabIndex={-1}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-medium leading-none -tracking-2">
                        Watermark
                      </h3>
                    </div>
                    <div className="-mx-2 max-w-full">
                      <div className="flex-grow-1 flex h-7 max-w-full items-center animate-in fade-in">
                        <ul className="list-none pl-0 mb-0 flex items-center gap-2">
                          {watermarks.map((wm: string, index: number) => (
                            <li className="" key={index}>
                              <button
                                onClick={() => selectWm(index)}
                                className={`${
                                  selectedWatermark === wm ? "border-2 " : ""
                                } border-0 p-0 bg-transparent rounded`}
                              >
                                <Image
                                  src={wm}
                                  height={10000}
                                  width={10000}
                                  alt=""
                                  style={{ height: 30, width: 40 }}
                                  className="max-w-full object-contain rounded"
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div
                    tabIndex={-1}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-medium leading-none -tracking-2">
                        Watermark Opacity
                      </h3>
                    </div>
                    <div className="-mx-2 max-w-full">
                      <div className="flex-grow-1 flex h-7 max-w-full items-center animate-in fade-in">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={wmOpacity}
                          onChange={(e) =>
                            changeWmOpacity(parseFloat(e.target.value))
                          }
                          className="w-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {userAuth?.login && !userAuth?.pos && (
                    <>
                      <div
                        tabIndex={-1}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                      >
                        {userAuth?.login && (
                          <>
                            <div className="flex flex-col gap-1">
                              <h3 className="text-xs font-medium leading-none -tracking-2">
                                View Secrets
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => recoverSeedPhrase()}
                                className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                              >
                                {loader ? (
                                  <Image
                                    src={
                                      process.env.NEXT_PUBLIC_IMAGE_URL +
                                      "loading.gif"
                                    }
                                    alt={""}
                                    height={40}
                                    width={40}
                                    className={"h-[20px] object-contain w-auto"}
                                  />
                                ) : (
                                  "View Secrets"
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div
                        tabIndex={-1}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                      >
                        {/* {userAuth?.login && (
                          <>
                            <div className="flex flex-col gap-1">
                              <h3 className="text-xs font-medium leading-none -tracking-2">
                                Lndhub URL
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={verifyingUser}
                                className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                              >
                                {loading ? (
                                  <Image
                                    src={
                                      process.env.NEXT_PUBLIC_IMAGE_URL +
                                      "loading.gif"
                                    }
                                    alt={""}
                                    height={40}
                                    width={40}
                                    className={"h-[20px] object-contain w-auto"}
                                  />
                                ) : (
                                  "View"
                                )}
                              </button>
                            </div>
                          </>
                        )} */}
                      </div>
                    </>
                  )}
                  {userAuth?.login &&
                    !userAuth?.pos &&
                    !userAuth.multisigSetup && (
                      <div
                        tabIndex={-1}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                      ></div>
                    )}
                  {userAuth?.login &&
                    !userAuth?.pos &&
                    userAuth.multisigSetup && (
                      <div
                        tabIndex={-1}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                      >
                        <div className="flex flex-col gap-1">
                          <h3 className="text-xs font-medium leading-none -tracking-2">
                            Multisign Trxn
                          </h3>
                          <p className="text-xs leading-none -tracking-2 text-white/40"></p>
                        </div>
                        <button
                          onClick={() => setSign(!sign)}
                          className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                        >
                          Trxn
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const Nav = styled.nav`
  // background: var(--cardBg);
  background: #5c2a28a3;
  backdrop-filter: blur(12.8px);
`;

export default Setting;

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);

const copyIcn = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.60001 11.397C6.60001 8.671 6.60001 7.308 7.44301 6.461C8.28701 5.614 9.64401 5.614 12.36 5.614H15.24C17.955 5.614 19.313 5.614 20.156 6.461C21 7.308 21 8.671 21 11.397V16.217C21 18.943 21 20.306 20.156 21.153C19.313 22 17.955 22 15.24 22H12.36C9.64401 22 8.28701 22 7.44301 21.153C6.59901 20.306 6.60001 18.943 6.60001 16.217V11.397Z"
      fill="currentColor"
    />
    <path
      opacity="0.5"
      d="M4.172 3.172C3 4.343 3 6.229 3 10V12C3 15.771 3 17.657 4.172 18.828C4.789 19.446 5.605 19.738 6.792 19.876C6.6 19.036 6.6 17.88 6.6 16.216V11.397C6.6 8.671 6.6 7.308 7.443 6.461C8.287 5.614 9.644 5.614 12.36 5.614H15.24C16.892 5.614 18.04 5.614 18.878 5.804C18.74 4.611 18.448 3.792 17.828 3.172C16.657 2 14.771 2 11 2C7.229 2 5.343 2 4.172 3.172Z"
      fill="currentColor"
    />
  </svg>
);

const logoutIcn = (
  <svg
    height={14}
    width={14}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.2713 2 18.1757 3.57078 20.0002 5.99923L17.2909 5.99931C15.8807 4.75499 14.0285 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C14.029 20 15.8816 19.2446 17.2919 17.9998L20.0009 17.9998C18.1765 20.4288 15.2717 22 12 22ZM19 16V13H11V11H19V8L24 12L19 16Z"></path>
  </svg>
);
