"use client";
import BTCAddressPop from "@/components/Modals/BtcAddressPop";
import ChangeEmailPop from "@/components/Modals/ChangeEmail";
import ConfirmationPop from "@/components/Modals/ConfirmationPop";
import MultiSignPop from "@/components/Modals/multisignPop";
import SetupRecoveryPop from "@/components/Modals/SetupRecovery";
import EnsDomainPop from "@/components/Modals/EnsDomainPop";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AccordionItem, BackBtn } from "@/components/common/index";
import { useBackground } from "@/ContextApi/backgroundContent";
import Image from "next/image";
import BlogCard from "@/components/BlogCard";
import s1 from "@/Assets/Images/screenshot.png";
import PreviewBox from "./preview";
import { useDispatch, useSelector } from "react-redux";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { logoutStorage } from "../../utils/globals";
import { zeroTrxn, getAccount, multisigSetup } from "@/lib/zeroDevWallet";

import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { splitAddress } from "../../utils/globals";
import { getUser, updtUser } from "../../lib/apiCall";
import { webAuthKeyStore, storedataLocalStorage } from "../../utils/globals";
const Setting: React.FC = () => {
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
  const [ensDomain, setEnsDomain] = useState<boolean>(false);
  const [sign, setSign] = useState<boolean>(false);
  const [changeEmail, setChangeEmail] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Copied Successfully!");
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  const getPreview = async () => {
    try {
      console.log("email");
      return await fetch(`/api/get-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://devstack.madhousewallet.com/dashboard",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log(error);
      return false;
    }
  };
  console.log("userAuth-->", userAuth);
  const setupMultisig = async () => {
    try {
      let userExist = await getUser(userAuth.email);
      let passkeyNo =
        (userExist?.userId?.passkey_number &&
          userExist?.userId?.passkey_number + 1) ||
        2;
      let result = await multisigSetup(
        userAuth?.webauthKey,
        userAuth.email,
        passkeyNo
      );
      console.log("result-->", result);
      if (result.status) {
        let webAuthKeyStringObj2: any = "";
        let webAuthKeyStringObj3: any = "";
        if (result.publicKey2) {
          webAuthKeyStringObj2 = await webAuthKeyStore(result.publicKey2);
        }
        if (result.publicKey3) {
          webAuthKeyStringObj3 = await webAuthKeyStore(result.publicKey3);
        }
        let webAuthKeyStringObj = await webAuthKeyStore(userAuth.webauthKey);
        dispatch(
          loginSet({
            login: userAuth.login,
            username: userAuth.username,
            email: userAuth.email,
            walletAddress: userAuth.walletAddress,
            passkeyCred: userAuth.passkeyValidatorNew,
            webauthKey: userAuth.webauthKey,
            ensName: userAuth.ensName || "",
            ensSetup: userAuth.ensSetup || false,
            id: userAuth.id,
            signer: userAuth.signer,
            multisigAddress: result.address,
            passkey2: result.publicKey2,
            passkey3: result.publicKey3,
            multisigSetup: true,
            multisigActivate: true,
          })
        );
        let data = await updtUser(
          { email: userAuth.email },
          {
            $set: {
              multisigAddress: result.address,
              passkey2: webAuthKeyStringObj2,
              passkey3: webAuthKeyStringObj3,
              multisigSetup: true,
              multisigActivate: true,
              passkey_number: passkeyNo + 2,
            }, // Ensure this is inside `$set`
          }
        );
        storedataLocalStorage(
          {
            login: true,
            walletAddress: userAuth.walletAddress || "",
            signer: "",
            username: userAuth.username,
            email: userAuth.email,
            passkeyCred: "",
            webauthKey: webAuthKeyStringObj,
            id: userAuth.id,
            multisigAddress: userAuth.multisigAddress,
            ensName: userAuth.ensName || "",
            ensSetup: userAuth.ensSetup || false,
            passkey2: webAuthKeyStringObj2,
            passkey3: webAuthKeyStringObj3,
            multisigSetup: true,
            multisigActivate: true,
          },
          "authUser"
        );

        toast.success(result.msg);
      } else {
        toast.error(result.msg);
      }
    } catch (error) {
      console.log("error-->", error);
    }
  };

  // useEffect(() => {
  //   getPreview(); // Call the function
  // }, []);

  const accordionTabs = [
    {
      title: "Whitelisted Address Book",
      content: (
        <>
          <form action="" className="pb-3">
            <div className="grid gap-3 grid-cols-12">
              <div className=" sm:col-span-6 col-span-12">
                <label
                  htmlFor=""
                  className="form-label m-0 text-xs font-medium"
                >
                  Whitelisted Address
                </label>
                <input
                  type="text"
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                />
              </div>
              <div className=" sm:col-span-6 col-span-12 self-end">
                <button className="flex h-[42px] text-xs items-center rounded-full bg-white px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </>
      ),
    },
    {
      title: "Configure Subdomain Name",
      content: (
        <>
          {" "}
          <form action="" className="pb-3">
            <div className="grid gap-3 grid-cols-12">
              <div className=" sm:col-span-6 col-span-12">
                <label
                  htmlFor=""
                  className="form-label m-0 text-xs font-medium"
                >
                  ENS username
                </label>
                <input
                  type="text"
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                />
              </div>
              <div className=" sm:col-span-6 col-span-12 self-end">
                <button className="flex h-[42px] text-xs items-center rounded-full bg-white px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </>
      ),
    },
    {
      title: "Set Login Email/Phone",
      content: (
        <>
          <form action="" className="pb-3">
            <div className="grid gap-3 grid-cols-12">
              <div className=" sm:col-span-6 col-span-12">
                <label
                  htmlFor=""
                  className="form-label m-0 text-xs font-medium"
                >
                  Login Email/Phone
                </label>
                <input
                  type="text"
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                />
              </div>
              <div className=" sm:col-span-6 col-span-12 self-end">
                <button className="flex h-[42px] text-xs items-center rounded-full bg-white px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </>
      ),
    },
    {
      title: "Update Owners",
      content: (
        <>
          {" "}
          <form action="" className="pb-3">
            <div className="grid gap-3 grid-cols-12">
              <div className=" sm:col-span-6 col-span-12">
                <label
                  htmlFor=""
                  className="form-label m-0 text-xs font-medium"
                >
                  Update Owners
                </label>
                <input
                  type="text"
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                />
              </div>
              <div className=" sm:col-span-6 col-span-12 self-end">
                <button className="flex h-[42px] text-xs items-center rounded-full bg-white px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </>
      ),
    },
    // {
    //   title: "Autopay loan",
    //   content: (
    //     <>
    //       <form action="" className="pb-3">
    //         <div className="grid gap-3 grid-cols-12">
    //           <div className=" sm:col-span-6 col-span-12">
    //             <label
    //               htmlFor=""
    //               className="form-label m-0 text-xs font-medium"
    //             >
    //               Autopay loan
    //             </label>
    //             <input
    //               type="text"
    //               className="form-control text-xs border-gray-600 bg-[var(--backgroundColor2)] focus:border-gray-600 focus:bg-[var(--backgroundColor2)]"
    //             />
    //           </div>
    //           <div className=" sm:col-span-6 col-span-12 self-end">
    //             <button className="btn flex items-center justify-center commonBtn text-xs h-[45px]">
    //               Submit
    //             </button>
    //           </div>
    //         </div>
    //       </form>
    //     </>
    //   ),
    // },
    {
      title: "Scheduled Transfer ",
      content: (
        <>
          {" "}
          <form action="" className="pb-3">
            <div className="grid gap-3 grid-cols-12">
              <div className=" sm:col-span-6 col-span-12">
                <label
                  htmlFor=""
                  className="form-label m-0 text-xs font-medium"
                >
                  Transfer
                </label>
                <input
                  type="text"
                  className="flex text-xs w-full border-px md:border-hpx border-white/10 bg-white/4 hover:bg-white/6 px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                />
              </div>
              <div className=" sm:col-span-6 col-span-12 self-end">
                <button className="flex h-[42px] text-xs items-center rounded-full bg-white px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </>
      ),
    },
  ];
  const [activeTab, setActiveTab] = useState(1);
  const showTab = (tab: number) => {
    console.log(tab, "tab");

    setActiveTab(tab);
  };
  const router = useRouter();
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleAccordionClick = (index: number) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  const LogoutFuc = async () => {
    try {
      logoutStorage();
      dispatch(
        loginSet({
          login: false,
          walletAddress: "",
          signer: "",
          username: "",
          email: "",
          passkeyCred: "",
          webauthKey: "",
          id: "",
          multisigAddress: "",
          passkey2: "",
          passkey3: "",
          multisigSetup: false,
          multisigActivate: false,
          ensName: "",
          ensSetup: false,
        })
      );
      toast.success("Logout Successfully!");
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
      {ensDomain &&
        createPortal(
          <EnsDomainPop ensDomain={ensDomain} setEnsDomain={setEnsDomain} />,
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
      <section className="relative dashboard pt-12">
        <div className="container relative">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <div
            className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 datbackg
          a-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]"
          >
            <div className="grid gap-3 md:gap-4 grid-cols-12 lg:px-8 px-3 pt-3">
              <div className="col-span-12 ">
                <div className="sectionHeader p-2 ">
                  <div className="flex items-center gap-3">
                    {/* <BackBtn /> */}
                    <h4 className="m-0 text-24 font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Setting & Support
                    </h4>
                  </div>
                </div>
              </div>
              {/* <div className="sm:col-span-4 col-span-12">
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-12">
                    <div className="rounded-20 bg-white/5 px-3 py-3 relative overflow-hidden z-[99]">
                      <div className="relative">
                        <Image
                          src={selectedBackground}
                          height={100000}
                          width={100000}
                          quality={100}
                          alt="Background"
                          className="transition-opacity fill-mode-both pointer-events-none rounded-12 inset-0 w-full object-cover object-center blur-[var(--wallpaper-blur)] duration-700"
                          style={{
                            opacity: bgOpacity,
                            height: 200, 
                          }}
                        />
                        <Image
                          src={selectedWatermark}
                          height={100000}
                          width={100000}
                          quality={100}
                          alt=""
                          className=" fill-mode-both mx-auto opacity-100 pointer-events-none absolute inset-0 w-auto h-auto top-[50%] transform -translate-y-1/2 object-container object-center blur-[var(--wallpaper-blur)] duration-700  z-[-1]"
                          style={{ opacity: wmOpacity, height: "50%" }}
                        />
                        <div
                          className="absolute left-0 right-0 bottom-0 w-full h-full flex-col justify-between flex"
                          style={{ pointerEvents: "none" }}
                        >
                          <PreviewBox />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className=" col-span-12">
                <div
                  className={` bg-white/5 h-full rounded-12 relative overflow-hidden  px-3 py-4 flex-wrap  lg:p-6 flex justify-between gap-3`}
                >
                  <div className="left">
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
                        <span className="text-white flex items-center">
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
                      <li className="flex gap-2 py-1">
                        <div
                          className="block text-gray-500"
                          style={{ width: 160 }}
                        >
                          Email Address:
                        </div>
                        {/* {userAuth?.email && ( */}
                        <span className="text-white flex items-center">
                          {userAuth?.email ? userAuth?.email : "--"}
                        </span>
                        {/* )} */}
                      </li>
                      <li className="flex gap-2 py-1">
                        <div
                          className="block text-gray-500"
                          style={{ width: 160 }}
                        >
                          Subdomain Name:
                        </div>
                        <span className="text-white flex items-center">
                          {" "}
                          {userAuth?.ensName ? userAuth?.ensName : "--"}
                        </span>
                      </li>
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
                  {userAuth?.login && !userAuth?.pos ? (
                    <div
                      tabIndex={-1}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-medium leading-none -tracking-2">
                          Account
                        </h3>
                        <p className="text-xs leading-none -tracking-2 text-white/40">
                          Your email
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setChangeEmail(!changeEmail)}
                          className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12"
                        >
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth={0}
                            viewBox="0 0 24 24"
                            className="shrink-0 opacity-80"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ width: 14, height: 14 }}
                          >
                            <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" />
                          </svg>
                          Change email
                        </button>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

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
                                  getPreview();
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
                            getPreview();
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
                  {/* {userAuth?.login && !userAuth?.pos && (
                    <div
                      tabIndex={-1}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-medium leading-none -tracking-2">
                          Test Trxn
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            let account = await getAccount(
                              userAuth?.passkeyCred,
                              userAuth?.walletAddress
                            );

                            let data = await zeroTrxn(account?.kernelClient);
                            if (data) {
                              toast.success("Trxn Success!");
                            } else {
                              toast.error(
                                "Trxn Failure. Please Check console for log!"
                              );
                            }
                          }}
                          className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                        >
                          Zero Trxn
                        </button>
                      </div>
                    </div>
                  )} */}

                  {userAuth?.login && !userAuth?.pos && (
                    <div
                      tabIndex={-1}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-medium leading-none -tracking-2">
                          Setup Recovery
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSetUp(!setUp)}
                          className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                        >
                          Backup Wallet
                        </button>
                      </div>
                    </div>
                  )}

                  {userAuth?.login && !userAuth?.pos && (
                    <div
                      tabIndex={-1}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-medium leading-none -tracking-2">
                          Delete Account
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setConfirm(!confirm)}
                          className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                  {userAuth?.login &&
                    !userAuth?.pos &&
                    !userAuth.multisigSetup && (
                      <div
                        tabIndex={-1}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                      >
                        {/* <div className="flex flex-col gap-1">
                          <h3 className="text-xs font-medium leading-none -tracking-2">
                            Multifactor Authentication
                          </h3>
                          <p className="text-xs leading-none -tracking-2 text-white/40">
                            A second layer of security for your Madhouse Wallet
                            login
                          </p>
                        </div> */}
                        {/* <button
                        type="button"
                        role="switch"
                        aria-checked="false"
                        data-state="unchecked"
                        value="on"
                        className="peer inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-[background,color,box-shadow] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/6 focus-visible:ring-offset-1 focus-visible:ring-offset-white/20 disabled:opacity-50 data-[state=checked]:bg-brand data-[state=unchecked]:bg-white/10"
                      >
                        <span
                          data-state="unchecked"
                          className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                        />
                      </button> */}
                        {/* <button
                          onClick={setupMultisig}
                          className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                        >
                          Setup
                        </button> */}
                      </div>
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
                  {/* {userAuth?.login && (!(userAuth?.pos)) && (<>
                    <div
                    tabIndex={-1}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 py-3 outline-none bg-gradient-to-r from-transparent to-transparent hover:via-white/4"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-medium leading-none -tracking-2">
                        Setup ENS Domain
                      </h3>
                      <p className="text-xs leading-none -tracking-2 text-white/40">
                        Eth naming service
                      </p>
                    </div>
                   
                    <button
                    onClick={()=> setEnsDomain(!ensDomain)}
                      className="inline-flex items-center justify-center font-medium transition-[color,background-color,scale,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 -tracking-2 leading-inter-trimmed gap-1.5 focus:outline-none focus:ring-3 shrink-0 disabled:shadow-none duration-300 umbrel-button bg-clip-padding bg-white/6 active:bg-white/3 hover:bg-white/10 focus:bg-white/10 border-[0.5px] border-white/6 ring-white/6 data-[state=open]:bg-white/10 shadow-button-highlight-soft-hpx focus:border-white/20 focus:border-1 data-[state=open]:border-1 data-[state=open]:border-white/20 rounded-full h-[30px] px-2.5 text-12 min-w-[80px]"
                    >
                      Setup
                    </button>
                  </div>
                  </>)} */}

                  {/* <AccordionWrpper className="grid gap-3 grid-cols-12 py-3">
                    {accordionTabs && accordionTabs.length > 0 && (
                      <>
                        <div className="md:col-span-6 col-span-12">
                          {accordionTabs
                            .slice(0, Math.ceil(accordionTabs.length / 2))
                            .map((item, key) => (
                              <AccordionItem
                                key={key}
                                svg={false}
                                wrpperClass={
                                  "my-2 bg-white/5 px-lg-4 AccordionItem"
                                }
                                onClick={() => handleAccordionClick(key)}
                                isOpen={openIndex === key}
                                btnClass={`accordionBtn text-white flex items-center text-xs text-left gap-2 px-3 rounded py-3 h-[50px] relative text-white font-medium`}
                                btnIcnClass={``}
                                title={item.title}
                              >
                                <div className="px-3">{item.content}</div>
                              </AccordionItem>
                            ))}
                        </div>
                        <div className="md:col-span-6 col-span-12">
                          {accordionTabs
                            .slice(Math.ceil(accordionTabs.length / 2))
                            .map((item, key) => (
                              <AccordionItem
                                key={key + Math.ceil(accordionTabs.length / 2)}
                                svg={false}
                                wrpperClass={
                                  "my-2 bg-white/5 px-lg-4 AccordionItem"
                                }
                                onClick={() =>
                                  handleAccordionClick(
                                    key + Math.ceil(accordionTabs.length / 2)
                                  )
                                }
                                isOpen={
                                  openIndex ===
                                  key + Math.ceil(accordionTabs.length / 2)
                                }
                                btnClass={`accordionBtn text-white flex items-center text-xs text-left gap-2 px-3 rounded py-3 h-[50px] relative text-white font-medium`}
                                btnIcnClass={``}
                                title={item.title}
                              >
                                <div className="px-3">{item.content}</div>
                              </AccordionItem>
                            ))}
                        </div>
                      </>
                    )}
                  </AccordionWrpper> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const AccordionWrpper = styled.div`
  .AccordionItem {
    border-radius: 8px;
    border: 1px solid #5252525e;
    .accordionBtn {
      justify-content: start;
      ${"" /* color: var(--textColor) !important; */}
    }
    input {
      color: var(--textColor);
      height: 45px;
    }
  }
`;
// const NavList = styled(Nav)`
//   font-size: 12px;
//   a {
//     color: currentColor;
//     &.active,
//     &:hover {
//       color: #76fc93 !important;
//     }
//   }
// `;

export default Setting;

const helpIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.95 18C12.3 18 12.596 17.879 12.838 17.637C13.08 17.395 13.2007 17.0993 13.2 16.75C13.1993 16.4007 13.0787 16.1047 12.838 15.862C12.5973 15.6193 12.3013 15.4987 11.95 15.5C11.5987 15.5013 11.303 15.6223 11.063 15.863C10.823 16.1037 10.702 16.3993 10.7 16.75C10.698 17.1007 10.819 17.3967 11.063 17.638C11.307 17.8793 11.6027 18 11.95 18ZM11.05 14.15H12.9C12.9 13.6 12.9627 13.1667 13.088 12.85C13.2133 12.5333 13.5673 12.1 14.15 11.55C14.5833 11.1167 14.925 10.704 15.175 10.312C15.425 9.92 15.55 9.44933 15.55 8.9C15.55 7.96666 15.2083 7.25 14.525 6.75C13.8417 6.25 13.0333 6 12.1 6C11.15 6 10.3793 6.25 9.788 6.75C9.19667 7.25 8.784 7.85 8.55 8.55L10.2 9.2C10.2833 8.9 10.471 8.575 10.763 8.225C11.055 7.875 11.5007 7.7 12.1 7.7C12.6333 7.7 13.0333 7.846 13.3 8.138C13.5667 8.43 13.7 8.75066 13.7 9.1C13.7 9.43333 13.6 9.746 13.4 10.038C13.2 10.33 12.95 10.6007 12.65 10.85C11.9167 11.5 11.4667 11.9917 11.3 12.325C11.1333 12.6583 11.05 13.2667 11.05 14.15ZM12 22C10.6167 22 9.31667 21.7377 8.1 21.213C6.88334 20.6883 5.825 19.9757 4.925 19.075C4.025 18.1743 3.31267 17.116 2.788 15.9C2.26333 14.684 2.00067 13.384 2 12C1.99933 10.616 2.262 9.316 2.788 8.1C3.314 6.884 4.02633 5.82566 4.925 4.925C5.82367 4.02433 6.882 3.312 8.1 2.788C9.318 2.264 10.618 2.00133 12 2C13.382 1.99866 14.682 2.26133 15.9 2.788C17.118 3.31466 18.1763 4.027 19.075 4.925C19.9737 5.823 20.6863 6.88133 21.213 8.1C21.7397 9.31866 22.002 10.6187 22 12C21.998 13.3813 21.7353 14.6813 21.212 15.9C20.6887 17.1187 19.9763 18.177 19.075 19.075C18.1737 19.973 17.1153 20.6857 15.9 21.213C14.6847 21.7403 13.3847 22.0027 12 22Z"
      fill="currentColor"
    />
  </svg>
);

const settingIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13.984 2.542C14.071 2.711 14.093 2.928 14.136 3.362C14.218 4.182 14.259 4.592 14.431 4.818C14.5382 4.95832 14.6806 5.06777 14.8437 5.13522C15.0069 5.20266 15.185 5.2257 15.36 5.202C15.64 5.165 15.96 4.904 16.598 4.382C16.935 4.105 17.104 3.967 17.285 3.909C17.5155 3.83534 17.7649 3.84777 17.987 3.944C18.162 4.02 18.317 4.174 18.624 4.482L19.518 5.376C19.826 5.684 19.98 5.838 20.056 6.013C20.1522 6.23506 20.1647 6.48447 20.091 6.715C20.033 6.896 19.895 7.065 19.619 7.402C19.096 8.041 18.835 8.36 18.797 8.641C18.7736 8.8159 18.7969 8.99387 18.8645 9.15686C18.9321 9.31985 19.0417 9.46204 19.182 9.569C19.407 9.741 19.818 9.782 20.639 9.864C21.072 9.907 21.289 9.929 21.459 10.016C21.6735 10.1272 21.8404 10.3123 21.929 10.537C22 10.714 22 10.932 22 11.368V12.632C22 13.068 22 13.286 21.93 13.462C21.8411 13.6874 21.6734 13.8729 21.458 13.984C21.289 14.071 21.072 14.093 20.638 14.136C19.818 14.218 19.408 14.259 19.182 14.431C19.0417 14.5382 18.9322 14.6806 18.8648 14.8437C18.7973 15.0069 18.7743 15.185 18.798 15.36C18.836 15.64 19.097 15.96 19.619 16.598C19.895 16.935 20.033 17.103 20.091 17.285C20.1647 17.5155 20.1522 17.7649 20.056 17.987C19.98 18.162 19.826 18.316 19.518 18.624L18.624 19.517C18.316 19.826 18.162 19.98 17.987 20.055C17.7649 20.1512 17.5155 20.1637 17.285 20.09C17.104 20.032 16.935 19.894 16.598 19.618C15.959 19.096 15.64 18.835 15.36 18.798C15.185 18.7743 15.0069 18.7973 14.8437 18.8648C14.6806 18.9322 14.5382 19.0417 14.431 19.182C14.259 19.407 14.218 19.817 14.136 20.638C14.093 21.072 14.071 21.289 13.984 21.458C13.8732 21.6732 13.6881 21.8409 13.463 21.93C13.286 22 13.068 22 12.632 22H11.368C10.932 22 10.714 22 10.538 21.93C10.3126 21.8411 10.1271 21.6734 10.016 21.458C9.929 21.289 9.907 21.072 9.864 20.638C9.782 19.818 9.741 19.408 9.569 19.182C9.46192 19.0418 9.31968 18.9325 9.1567 18.8651C8.99372 18.7976 8.81581 18.7745 8.641 18.798C8.36 18.835 8.041 19.096 7.402 19.618C7.065 19.895 6.896 20.033 6.715 20.091C6.48447 20.1647 6.23506 20.1522 6.013 20.056C5.838 19.98 5.683 19.826 5.376 19.518L4.482 18.624C4.174 18.316 4.02 18.162 3.944 17.987C3.84777 17.7649 3.83534 17.5155 3.909 17.285C3.967 17.104 4.105 16.935 4.381 16.598C4.904 15.959 5.165 15.64 5.202 15.359C5.22552 15.1842 5.20239 15.0063 5.13495 14.8433C5.06751 14.6803 4.95816 14.5381 4.818 14.431C4.593 14.259 4.182 14.218 3.361 14.136C2.928 14.093 2.711 14.071 2.541 13.984C2.32655 13.8728 2.1596 13.6877 2.071 13.463C2 13.286 2 13.068 2 12.632V11.368C2 10.932 2 10.714 2.07 10.538C2.15889 10.3126 2.32661 10.1271 2.542 10.016C2.711 9.929 2.928 9.907 3.362 9.864C4.182 9.782 4.593 9.741 4.818 9.569C4.95834 9.46204 5.06788 9.31985 5.1355 9.15686C5.20312 8.99387 5.22641 8.8159 5.203 8.641C5.165 8.36 4.903 8.041 4.381 7.401C4.105 7.064 3.967 6.896 3.909 6.714C3.83534 6.48347 3.84777 6.23406 3.944 6.012C4.02 5.838 4.174 5.683 4.482 5.375L5.376 4.482C5.684 4.174 5.838 4.019 6.013 3.944C6.23506 3.84777 6.48447 3.83534 6.715 3.909C6.896 3.967 7.065 4.105 7.402 4.381C8.041 4.903 8.36 5.164 8.64 5.202C8.81521 5.22578 8.9936 5.20267 9.15697 5.13504C9.32034 5.06741 9.46286 4.95766 9.57 4.817C9.74 4.592 9.782 4.182 9.864 3.361C9.907 2.928 9.929 2.711 10.016 2.541C10.127 2.32617 10.3121 2.15884 10.537 2.07C10.714 2 10.932 2 11.368 2H12.632C13.068 2 13.286 2 13.462 2.07C13.6874 2.15889 13.8729 2.32661 13.984 2.542ZM12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16Z"
      fill="currentColor"
    />
  </svg>
);

const alertIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.299 3.14799L21.933 18.102C22.0646 18.33 22.134 18.5887 22.134 18.852C22.134 19.1153 22.0646 19.374 21.933 19.602C21.8014 19.83 21.612 20.0194 21.384 20.151C21.156 20.2827 20.8973 20.352 20.634 20.352H3.36599C3.10269 20.352 2.84403 20.2827 2.616 20.151C2.38798 20.0194 2.19863 19.83 2.06698 19.602C1.93533 19.374 1.86603 19.1153 1.86603 18.852C1.86603 18.5887 1.93534 18.33 2.06699 18.102L10.701 3.14799C11.278 2.14799 12.721 2.14799 13.299 3.14799ZM12 15C11.7348 15 11.4804 15.1054 11.2929 15.2929C11.1053 15.4804 11 15.7348 11 16C11 16.2652 11.1053 16.5196 11.2929 16.7071C11.4804 16.8946 11.7348 17 12 17C12.2652 17 12.5196 16.8946 12.7071 16.7071C12.8946 16.5196 13 16.2652 13 16C13 15.7348 12.8946 15.4804 12.7071 15.2929C12.5196 15.1054 12.2652 15 12 15ZM12 8C11.7551 8.00003 11.5187 8.08995 11.3356 8.25271C11.1526 8.41547 11.0356 8.63974 11.007 8.883L11 9V13C11.0003 13.2549 11.0979 13.5 11.2728 13.6854C11.4478 13.8707 11.6869 13.9822 11.9414 13.9972C12.1958 14.0121 12.4464 13.9293 12.6418 13.7657C12.8373 13.6021 12.9629 13.3701 12.993 13.117L13 13V9C13 8.73478 12.8946 8.48043 12.7071 8.29289C12.5196 8.10535 12.2652 8 12 8Z"
      fill="currentColor"
    />
  </svg>
);

const walletIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 20C4.9 20 3.95833 19.6083 3.175 18.825C2.39167 18.0417 2 17.1 2 16V8C2 6.9 2.39167 5.95833 3.175 5.175C3.95833 4.39167 4.9 4 6 4H18C19.1 4 20.0417 4.39167 20.825 5.175C21.6083 5.95833 22 6.9 22 8V16C22 17.1 21.6083 18.0417 20.825 18.825C20.0417 19.6083 19.1 20 18 20H6ZM6 8H18C18.3667 8 18.7167 8.04167 19.05 8.125C19.3833 8.20833 19.7 8.34167 20 8.525V8C20 7.45 19.8043 6.97933 19.413 6.588C19.0217 6.19667 18.5507 6.00067 18 6H6C5.45 6 4.97933 6.196 4.588 6.588C4.19667 6.98 4.00067 7.45067 4 8V8.525C4.3 8.34167 4.61667 8.20833 4.95 8.125C5.28333 8.04167 5.63333 8 6 8ZM4.15 11.25L15.275 13.95C15.425 13.9833 15.575 13.9833 15.725 13.95C15.875 13.9167 16.0167 13.85 16.15 13.75L19.625 10.85C19.4417 10.6 19.2083 10.396 18.925 10.238C18.6417 10.08 18.3333 10.0007 18 10H6C5.56667 10 5.18767 10.1127 4.863 10.338C4.53833 10.5633 4.30067 10.8673 4.15 11.25Z"
      fill="currentColor"
    />
  </svg>
);

const whitelistIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 1H1.5C0.671875 1 0 1.67188 0 2.5V13.5C0 14.3281 0.671875 15 1.5 15H16.5C17.3281 15 18 14.3281 18 13.5V2.5C18 1.67188 17.3281 1 16.5 1ZM5.5 4C6.60312 4 7.5 4.89688 7.5 6C7.5 7.10312 6.60312 8 5.5 8C4.39688 8 3.5 7.10312 3.5 6C3.5 4.89688 4.39688 4 5.5 4ZM9 11.4C9 11.7312 8.6875 12 8.3 12H2.7C2.3125 12 2 11.7312 2 11.4V10.8C2 9.80625 2.94062 9 4.1 9H4.25625C4.64062 9.15937 5.05937 9.25 5.5 9.25C5.94063 9.25 6.3625 9.15937 6.74375 9H6.9C8.05938 9 9 9.80625 9 10.8V11.4ZM16 9.75C16 9.8875 15.8875 10 15.75 10H11.25C11.1125 10 11 9.8875 11 9.75V9.25C11 9.1125 11.1125 9 11.25 9H15.75C15.8875 9 16 9.1125 16 9.25V9.75ZM16 7.75C16 7.8875 15.8875 8 15.75 8H11.25C11.1125 8 11 7.8875 11 7.75V7.25C11 7.1125 11.1125 7 11.25 7H15.75C15.8875 7 16 7.1125 16 7.25V7.75ZM16 5.75C16 5.8875 15.8875 6 15.75 6H11.25C11.1125 6 11 5.8875 11 5.75V5.25C11 5.1125 11.1125 5 11.25 5H15.75C15.8875 5 16 5.1125 16 5.25V5.75Z"
      fill="currentColor"
    />
  </svg>
);

const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
);

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
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
    stroke-width="0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.2713 2 18.1757 3.57078 20.0002 5.99923L17.2909 5.99931C15.8807 4.75499 14.0285 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C14.029 20 15.8816 19.2446 17.2919 17.9998L20.0009 17.9998C18.1765 20.4288 15.2717 22 12 22ZM19 16V13H11V11H19V8L24 12L19 16Z"></path>
  </svg>
);
