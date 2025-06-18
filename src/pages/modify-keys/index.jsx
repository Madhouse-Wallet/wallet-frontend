import React, { useState } from "react";
import Image from "next/image";
import { BackBtn } from "@/components/common";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { webAuthKeyStore } from "../../utils/globals";
import { getRecoverAccount, doRecovery } from "../../lib/zeroDev";
import { doAccountRecovery, checkMenmonic } from "../../lib/zeroDev";
import { getUser, updtUser, decodeBitcoinAddress } from "../../lib/apiCall";
import styled from "styled-components";
import { filterHexxInput, filterAlphaWithSpaces } from "../../utils/helper";

const ModifyKeys = () => {
  const [step, setStep] = useState(1);
  const [edit, setEdit] = useState({});
  const [editData, setEditData] = useState({});
  const [loadingNewSigner, setLoadingNewSigner] = useState(false);
  const [phrase, setPhrase] = useState();
  const [address, setAddress] = useState();
  const [email, setEmail] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [safePrivateKey, setSafePrivateKey] = useState();
  const [wif, setWif] = useState();
  const [passkeyData, setPasskeyData] = useState([]);
  const [passkeyDataOrig, setPasskeyDataOrig] = useState([]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [commonError, setCommonError] = useState("");
  const [privateKeyError, setPrivateKeyError] = useState("");
  const [safePrivateKeyError, setSafePrivateKeyError] = useState("");
  const [seedPhrase, setSeedPhrase] = useState();
  const [seedError, setSeedError] = useState("");
  const [wifError, setWifError] = useState("");


  const checkAddress = async () => {
    try {
      setLoadingNewSigner(true);
      setCommonError("")
      if (email && privateKey && safePrivateKey && wif && seedPhrase) {
        let userExist = await getUser(email);
        if (userExist.status && userExist.status == "failure") {
          setCommonError("User Not Found!");
          setLoadingNewSigner(false);
        } else {
          let testMenmonic = await checkMenmonic(seedPhrase, privateKey);
          if (!testMenmonic.status) {
            setSeedError(testMenmonic.msg);
            setLoadingNewSigner(false);
            return;
          }
          let recoveryBitcoin = await decodeBitcoinAddress(wif);
          if (recoveryBitcoin?.status == "error" || recoveryBitcoin?.data?.address != userExist?.userId?.bitcoinWallet) {
            setWifError("Invalid Wif!");
            setLoadingNewSigner(false);
            return;
          }
          setEmail(userExist?.userId?.email);
          setAddress(userExist?.userId?.wallet);
          setPasskeyData(userExist?.userId?.passkey);
          setPasskeyDataOrig(userExist?.userId?.passkey);
          let recoverAccount = await doAccountRecovery(
            privateKey,
            safePrivateKey,
            userExist?.userId?.wallet
          );
          if (recoverAccount && recoverAccount.status) {
            setLoadingNewSigner(false);
            setStep(3);
          } else {
            setCommonError("User Not Found!");
            setLoadingNewSigner(false);
          }
          // setLoadingNewSigner(false);
          // setStep(2);
        }
      } else {
        if (!privateKey) {
          setLoadingNewSigner(false);
          setCommonError("Invalid Private Keys!");
        } else {
          setCommonError("Invalid Email!");
          setLoadingNewSigner(false);
        }
      }
    } catch (error) {
      setLoadingNewSigner(false);
    }
  };


  const checkEmail = async () => {
    try {
      setLoadingNewSigner(true);
      if (email) {
        let userExist = await getUser(email);
        if (userExist.status && userExist.status == "failure") {
          setError("User Not Found!");
          setLoadingNewSigner(false);
        } else {
          setAddress(userExist?.userId?.wallet);
          setLoadingNewSigner(false);
          setStep(2);
        }
      } else {
        setLoadingNewSigner(false);
        setError("Invalid Address!");
      }
    } catch (error) {
      setLoadingNewSigner(false);
    }
  }

  const cancelEdit = async () => {
    setPasskeyData(passkeyDataOrig);
    setEdit(false);
  };

  const saveEdit = async () => {
    try {
      const cleanData = passkeyData
        .filter((item) => item.deleteStatus != true) // Step 1: filter
        .map(({ edit, deleteStatus, ...rest }) => rest); // Step 2: remove fields
      let data = await updtUser(
        { email: email },
        {
          $set: {
            passkey: cleanData,
            totalPasskey: cleanData.length,
          }, // Ensure this is inside `$set`
        }
      );
      toast.success("Successfully Updated!");
      setPasskeyData(cleanData);
      setPasskeyDataOrig(cleanData);
      setEdit(false);
    } catch (e) {
      console.log("saveEdit Error-->", e);
    }
  };

  const editDataFunc = (index, value) => {
    setPasskeyData((prevData) =>
      prevData.map((item, i) =>
        i === index ? { ...item, displayName: value } : item
      )
    );
    setEdit(true);
  };

  const allowDelFunc = (index, value) => {
    setPasskeyData((prevData) =>
      prevData.map((item, i) =>
        i === index ? { ...item, deleteStatus: value } : item
      )
    );
    setEdit(true);
  };

  const allowEditFunc = async (key) => {
    try {
      setPasskeyData((prevData) =>
        prevData.map((item, index) => ({
          ...item,
          edit: index === key, // true for selected, false for others
        }))
      );
    } catch (e) {
      console.error("Error in allowEditFunc:", e);
    }
  };

  const handleEmailChange = (e) => {
    let value = e.target.value;

    // Allow only common email characters (letters, numbers, @ . _ -)
    const filteredValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");

    // Optional max length limit
    const maxLength = 50;
    const limitedValue = filteredValue.slice(0, maxLength);

    setEmail(limitedValue);
    setError("");

    // Optional: Validate email only after user finishes typing
    if (limitedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limitedValue)) {
      setError("Invalid email format");
    }
  };

  const handlePrivateInputChange = (e) => {
    const value = e.target.value;

    const filteredValue = filterHexxInput(value, /[^0-9a-fA-Fx]/g, 66);

    setPrivateKey(filteredValue);

    const isValidPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(filteredValue);

    if (!isValidPrivateKey) {
      setPrivateKeyError("Invalid private key");
    } else {
      setPrivateKeyError("");
    }
  };

  const handleSafePrivateInputChange = (e) => {
    const value = e.target.value;

    const filteredValue = filterHexxInput(value, /[^0-9a-fA-Fx]/g, 66);

    setSafePrivateKey(filteredValue);

    const isValidPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(filteredValue);

    if (!isValidPrivateKey) {
      setSafePrivateKeyError("Invalid safe private key");
    } else {
      setSafePrivateKeyError("");
    }
  };


  const handlePhraseInput = (e) => {
    const value = e.target.value;
    const filtered = filterAlphaWithSpaces(value, 250); // Adjust max length as needed
    setSeedPhrase(filtered); // Or whatever your state setter is
    if (
      filtered.trim().split(/\s+/).length !== 12 &&
      filtered.trim().split(/\s+/).length !== 24
    ) {
      setSeedError("Seed phrase should be 12 or 24 words");
    } else {
      setSeedError("");
    }
  };


  const handleWifInput = (e) => {
    const value = e.target.value;
    const disallowedChars =
      /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g;
    const filtered = filterHexxInput(value, disallowedChars, 52); // WIF length usually ≤52

    setWif(filtered); // Or whatever your state setter is

    if (!/^([KL5][1-9A-HJ-NP-Za-km-z]{51,52})$/.test(filtered)) {
      setWifError("Invalid WIF format");
    } else {
      setWifError("");
    }
  };


  return (
    <>
      <div className="mx-auto ">
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
              <div className="pb-3">
                <h1 className="text-center text-base font-medium  m-0">
                  Modify Passkeys
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="contentBody">
          {step == 1 ? (<>
            <div className="mx-auto max-w-sm">
              <form action="">
                <div className="py-2">
                  <input
                    type="text"
                    name="emailx"
                    onChange={handleEmailChange}
                    value={email}
                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-full h-[45px] pr-11`}
                    placeholder="Enter Email"
                  />
                  {error && (
                    <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                      {error}
                    </div>
                  )}
                </div>
                <div className="btnWrpper mt-3 text-center">
                  <button
                    type="button"
                    onClick={checkEmail}
                    disabled={loadingNewSigner || error || !email}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    {loadingNewSigner ? (
                      <Image
                        src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                        alt={""}
                        height={100000}
                        width={10000}
                        className={"max-w-full h-[40px] object-contain w-auto"}
                      />
                    ) : (
                      "Next"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>) : (step == 2 ? (
            <>
              <div className="mx-auto max-w-sm">
                <div className="py-2">
                  <input
                    type="text"
                    name="privateKey"
                    onChange={handlePrivateInputChange}
                    // value={privateKey}
                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-full h-[45px] pr-11`}
                    placeholder="Enter Private Key"
                  />
                  {privateKeyError && (
                    <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                      {privateKeyError}
                    </div>
                  )}
                </div>
                <div className="py-2">
                  <input
                    type="text"
                    name="safePrivateKey"
                    onChange={handleSafePrivateInputChange}
                    // value={safePriva02teKey}
                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-full h-[45px] pr-11`}
                    placeholder="Enter Safe Private Key"
                  />
                  {safePrivateKeyError && (
                    <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                      {safePrivateKeyError}
                    </div>
                  )}
                </div>
                <div className="py-2">
                  <input
                    type="text"
                    name="seedphrase"
                    onChange={handlePhraseInput}
                    value={seedPhrase}
                    // value={safePriva02teKey}
                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-full h-[45px] pr-11`}
                    placeholder="Enter Seed Phrase"
                  />
                  {seedError && (
                    <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                      {seedError}
                    </div>
                  )}
                </div>
                <div className="py-2">
                  <input
                    type="text"
                    name="wif"
                    onChange={handleWifInput}
                    value={wif}
                    // value={safePriva02teKey}
                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-full h-[45px] pr-11`}
                     placeholder="Enter wif"
                  />
                  {wifError && (
                    <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                      {wifError}
                    </div>
                  )}
                </div>
                {commonError && (
                  <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                    {commonError}
                  </div>)}
                <div className="btnWrpper mt-3 text-center">
                  <button
                    type="button"
                    onClick={checkAddress}
                    disabled={
                      loadingNewSigner ||
                      commonError ||
                      privateKeyError ||
                      safePrivateKeyError || seedError ||
                      wifError ||
                      !email ||
                      !privateKey ||
                      !safePrivateKey ||
                      !wif ||
                      !seedPhrase
                    }
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    {loadingNewSigner ? (
                      <Image
                        src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                        alt={""}
                        height={100000}
                        width={10000}
                        className={"max-w-full h-[40px] object-contain w-auto"}
                      />
                    ) : (
                      "Next"
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : step == 3 ? (
            <>
              <div className="mx-auto max-w-[700px]">
                <div className="grid gap-3 grid-cols-12">
                  {passkeyData.map((item, key) => (
                    <div
                      key={key}
                      // onClick={() => (setSelectOption(key))}
                      className="md:col-span-6 col-span-12"
                    >
                      <div className="relative mt-3">
                        <PassKeyCard
                          className={`${item.deleteStatus ? `active` : ``} border-white/10 bg-white/4 hover:bg-white/6 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:border-white/50"
                        : "bg-[#fff3ed] border border-[#ffad84] cursor-pointer border rounded-10 py-2 px-3 flex items-center justify-between
                      border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300  focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <div className="left flex items-center gap-2">
                            <div
                              className={`keyBox border-white/10 bg-white/4 hover:bg-white/6 placeholder:text-white/30 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:bg-white/10 focus-visible:border-white/50 cursor-pointer border h-[60px] w-[60px] rounded-10 py-2 px-3 flex items-center justify-between
                      border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300  focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                              {keyIcn}
                            </div>
                            <div className="content">
                              <h4 className="m-0 font-bold text-xl truncate max-w-[150px]">
                                {!item?.edit ? (
                                  <>
                                    {" "}
                                    {item?.displayName || "Key " + (key + 1)}
                                  </>
                                ) : (
                                  <>
                                    <input
                                      name={"key" + key}
                                      value={item.displayName || ""}
                                      onChange={(e) =>
                                        editDataFunc(key, e.target.value)
                                      }
                                      readOnly={item?.deleteStatus}
                                      type="text"
                                      className="border-0 bg-transparent w-auto max-w-[150px] outline-0 p-0"
                                    />
                                  </>
                                )}
                              </h4>
                              <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                                {item.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ">
                            <button
                              disabled={item?.deleteStatus}
                              onClick={() => allowEditFunc(key)}
                              className="border-0 p-0"
                            >
                              {editIcn}
                            </button>
                            <button
                              onClick={() =>
                                allowDelFunc(
                                  key,
                                  item.deleteStatus ? false : true
                                )
                              }
                              className="border-0 p-0"
                            >
                              {deleteIcn}
                            </button>
                          </div>
                        </PassKeyCard>
                      </div>
                    </div>
                  ))}
                </div>
                {edit && (
                  <>
                    {" "}
                    <div className="btnWrpper mt-3 text-center mx-auto gap-3 flex items-center justify-center">
                      <button
                        type="button"
                        disabled={loadingNewSigner}
                        // onClick={checkPhrase}
                        onClick={saveEdit}
                        className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={loadingNewSigner}
                        // onClick={checkPhrase}
                        onClick={cancelEdit}
                        className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {!edit && (
                  <>
                    <div className="btnWrpper mt-3 text-center max-w-[300px] mx-auto">
                      <button
                        type="button"
                        // onClick={checkPhrase}
                        onClick={() => router.push("/welcome")}
                        className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <></>
          ))}
        </div>
      </div>
    </>
  );
};

const PassKeyCard = styled.div`
  &.active {
    .keyBox {
      position: relative;
      &:after {
        position: absolute;
        left: 0;
        content: "";
        top: 50%;
        transform: translateY(-50%);
        height: 2px;
        width: 100%;
        background: red;
      }
    }
  }
`;

ModifyKeys.authRoute = true;

export default ModifyKeys;

const keyIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M21 10H12.65C12.2381 8.83048 11.4733 7.81762 10.4613 7.10116C9.44934 6.3847 8.23994 5.99995 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C8.23994 18 9.44934 17.6153 10.4613 16.8988C11.4733 16.1824 12.2381 15.1695 12.65 14H13L15 16L17 14L19 16L23 11.96L21 10ZM7 15C5.35 15 4 13.65 4 12C4 10.35 5.35 9 7 9C8.65 9 10 10.35 10 12C10 13.65 8.65 15 7 15Z"
        fill="currentColor"
      />
    </g>
  </svg>
);
const check = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.33917 12.7758C11.6023 14.2065 13.2933 16.7632 13.2933 16.7632H13.3272C13.3272 16.7632 16.9195 10.4063 23.5935 6.49683"
      stroke="#34C759"
      stroke-width="1.5"
      stroke-linecap="square"
    />
    <path
      opacity="0.4"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.9688 23.6001C18.5031 23.6001 22.9896 19.1136 22.9896 13.5792C22.9896 8.04485 18.5031 3.55838 12.9688 3.55838C7.43442 3.55838 2.94794 8.04485 2.94794 13.5792C2.94794 19.1136 7.43442 23.6001 12.9688 23.6001Z"
      stroke="#34C759"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
);
const editIcn = (
  <svg
    width="18"
    height="16"
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_6_2)">
      <path
        d="M12.5719 10.7781L13.5719 9.77813C13.7281 9.62188 14 9.73125 14 9.95625V14.5C14 15.3281 13.3281 16 12.5 16H1.5C0.671875 16 0 15.3281 0 14.5V3.5C0 2.67188 0.671875 2 1.5 2H10.0469C10.2687 2 10.3813 2.26875 10.225 2.42812L9.225 3.42812C9.17813 3.475 9.11563 3.5 9.04688 3.5H1.5V14.5H12.5V10.9531C12.5 10.8875 12.525 10.825 12.5719 10.7781ZM17.4656 4.47188L9.25937 12.6781L6.43437 12.9906C5.61562 13.0813 4.91875 12.3906 5.00938 11.5656L5.32188 8.74063L13.5281 0.534375C14.2437 -0.18125 15.4 -0.18125 16.1125 0.534375L17.4625 1.88438C18.1781 2.6 18.1781 3.75938 17.4656 4.47188ZM14.3781 5.4375L12.5625 3.62188L6.75625 9.43125L6.52812 11.4719L8.56875 11.2438L14.3781 5.4375ZM16.4031 2.94688L15.0531 1.59688C14.925 1.46875 14.7156 1.46875 14.5906 1.59688L13.625 2.5625L15.4406 4.37813L16.4062 3.4125C16.5312 3.28125 16.5313 3.075 16.4031 2.94688Z"
        fill="#118C1F"
      />
    </g>
    <defs>
      <clipPath id="clip0_6_2">
        <rect width="18" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const deleteIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.61601 20C7.17134 20 6.79101 19.8417 6.47501 19.525C6.15901 19.2083 6.00067 18.8287 6.00001 18.386V6H5.50001C5.35801 6 5.23934 5.952 5.14401 5.856C5.04867 5.76 5.00067 5.641 5.00001 5.499C4.99934 5.357 5.04734 5.23833 5.14401 5.143C5.24067 5.04766 5.35934 5 5.50001 5H9.00001C9.00001 4.79333 9.07667 4.61333 9.23001 4.46C9.38334 4.30666 9.56334 4.23 9.77001 4.23H14.23C14.4367 4.23 14.6167 4.30666 14.77 4.46C14.9233 4.61333 15 4.79333 15 5H18.5C18.642 5 18.7607 5.048 18.856 5.144C18.9513 5.24 18.9993 5.359 19 5.501C19.0007 5.643 18.9527 5.76166 18.856 5.857C18.7593 5.95233 18.6407 6 18.5 6H18V18.385C18 18.829 17.8417 19.209 17.525 19.525C17.2083 19.841 16.8283 19.9993 16.385 20H7.61601ZM10.308 17C10.45 17 10.569 16.952 10.665 16.856C10.761 16.76 10.8087 16.6413 10.808 16.5V8.5C10.808 8.358 10.76 8.23933 10.664 8.144C10.568 8.04866 10.449 8.00066 10.307 8C10.165 7.99933 10.0463 8.04733 9.95101 8.144C9.85567 8.24066 9.80801 8.35933 9.80801 8.5V16.5C9.80801 16.642 9.85601 16.7607 9.95201 16.856C10.048 16.952 10.1667 17 10.308 17ZM13.693 17C13.835 17 13.9537 16.952 14.049 16.856C14.1443 16.76 14.192 16.6413 14.192 16.5V8.5C14.192 8.358 14.144 8.23933 14.048 8.144C13.952 8.048 13.8333 8 13.692 8C13.55 8 13.431 8.048 13.335 8.144C13.239 8.24 13.1913 8.35866 13.192 8.5V16.5C13.192 16.642 13.24 16.7607 13.336 16.856C13.432 16.9513 13.551 16.9993 13.693 17Z"
      fill="#C70808"
    />
  </svg>
);
