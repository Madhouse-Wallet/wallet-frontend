import React, { useState } from "react";
import Image from "next/image";
import { BackBtn } from "@/components/common";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { webAuthKeyStore } from "../../utils/globals";
import { doRecovery } from "../../lib/zeroDev";
import { doAccountRecovery, checkMenmonic } from "../../lib/zeroDev";
import {
  getUser,
  updtUser,
  getUserToken,
  decodeBitcoinAddress,
} from "../../lib/apiCall";
import { registerCredential, storeSecret } from "../../utils/webauthPrf";
import { filterHexxInput, filterAlphaWithSpaces } from "../../utils/helper";

const RecoverWallet = () => {
  const [step, setStep] = useState(1);
  const [loadingNewSigner, setLoadingNewSigner] = useState(false);
  const [phrase, setPhrase] = useState();
  const [address, setAddress] = useState();
  const [bitcoinAddress, setBitcoinAddress] = useState();
  const [email, setEmail] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [safeprivateKey, setSafePrivateKey] = useState();
  const [seedPhrase, setSeedPhrase] = useState();
  const [wif, setWif] = useState();
  const router = useRouter();
  const [error, setError] = useState("");
  const [privateKeyError, setPrivateKeyError] = useState("");
  const [safePrivateKeyError, setSafePrivateKeyError] = useState("");
  const [seedError, setSeedError] = useState("");
  const [wifError, setWifError] = useState("");

  const setSecretInPasskey = async (userName, data) => {
    try {
      let registerCheck = await registerCredential(userName, userName);
      if (registerCheck?.status) {
        let storeSecretCheck = await storeSecret(
          registerCheck?.data?.credentialId,
          data
        );
        if (storeSecretCheck?.status) {
          return {
            status: true,
            storageKey: storeSecretCheck?.data?.storageKey,
            credentialId: registerCheck?.data?.credentialId,
          };
        } else {
          return {
            status: false,
            msg: storeSecretCheck?.msg,
          };
        }
      } else {
        return {
          status: false,
          msg: registerCheck?.msg,
        };
      }
    } catch (error) {
      return {
        status: false,
        msg: "Facing issue in storing secret",
      };
    }
  };

  const checkAddress = async () => {
    try {
      setLoadingNewSigner(true);
      if (email) {
        let userExist = await getUser(email);
        if (userExist.status && userExist.status == "failure") {
          toast.error("User Not Found!");
          setLoadingNewSigner(false);
        } else {
          setAddress(userExist?.userId?.wallet);
          setBitcoinAddress(userExist?.userId?.bitcoinWallet)
          setLoadingNewSigner(false);
          setStep(2);
        }
      } else {
        setLoadingNewSigner(false);
        toast.error("Invalid Address!");
      }
    } catch (error) {
      setLoadingNewSigner(false);
    }
  };

  const checkPhrase = async () => {
    try {
      setLoadingNewSigner(true);
      setError("")
      if (privateKey && wif && safeprivateKey && seedPhrase) {
        let testMenmonic = await checkMenmonic(seedPhrase, privateKey);
        if (!testMenmonic.status) {
          setSeedError(testMenmonic.msg);
          setLoadingNewSigner(false);
          return;
        }
        let recoverAccount = await doAccountRecovery(
          privateKey,
          safeprivateKey,
          address
        );
        let recoveryBitcoin = await decodeBitcoinAddress(wif);
        if (recoveryBitcoin?.status == "error" || (recoveryBitcoin?.data?.address != bitcoinAddress && recoveryBitcoin?.data?.address2 != bitcoinAddress)) {
          setWifError("Invalid Wif!");
          setLoadingNewSigner(false);
          return;
        }
        if (recoverAccount && recoverAccount.status) {
          let userExist = await getUserToken(email);
          let secretObj = {
            coinosToken: userExist?.userId?.coinosToken || "",
            wif: wif || "",
            privateKey: privateKey,
            safePrivateKey: safeprivateKey,
            seedPhrase,
          };
          let storeData = await setSecretInPasskey(
            email + "_passkey_" + (userExist?.userId?.totalPasskey + 1),
            JSON.stringify(secretObj)
          );
          if (storeData.status) {
            let encryptedData = storeData?.storageKey;
            let credentialID = storeData?.credentialId;
            try {
              let data = await updtUser(
                { email: userExist?.userId?.email },
                {
                  $push: {
                    passkey: {
                      name:
                        email +
                        "_passkey_" +
                        (userExist?.userId?.totalPasskey + 1),
                      encryptedData,
                      credentialID,
                      displayName: "",
                      bitcoinWallet: bitcoinAddress
                    },
                  },
                  $set: { totalPasskey: userExist?.userId?.totalPasskey + 1 }, // Ensure this is inside `$set`
                }
              );
            } catch (error) {
              console.log("updtuser error-->", error);
            }

            toast.success("New Key Recovered!");
            router.push("/welcome");
          } else {
            setError(storeData.msg);
            setLoadingNewSigner(false);
          }
        } else {
          setError(recoverAccount?.msg);
          setLoadingNewSigner(false);
        }
      } else {
        setError("Invalid Credentials!");
        setLoadingNewSigner(false);
      }
      setLoadingNewSigner(false);
    } catch (error) {
      setError("Invalid Key!");
      setLoadingNewSigner(false);
    }
  };

  const createNewSigner = async () => {
    try {
      setLoadingNewSigner(true);
      // updtUser
      let userExist = await getUser(email);
      if (userExist.status && userExist.status == "failure") {
        toast.error("User Not Found!");
      } else {
        let passkeyNo =
          (userExist?.userId?.passkey_number &&
            userExist?.userId?.passkey_number + 1) ||
          2;
        let checkAccount = await doRecovery(
          address,
          "",
          phrase.trim(),
          userExist?.userId?.email + "_passkey_" + passkeyNo
        );
        if (checkAccount.status) {
          let webAuthKeyStringObj = await webAuthKeyStore(
            checkAccount.newwebAuthKey
          );
          let data = await updtUser(
            {
              email: {
                $regex: new RegExp(`^${userExist?.userId?.email}$`, "i"),
              },
            },
            {
              $push: { passkey: webAuthKeyStringObj },
              $set: { passkey_number: passkeyNo }, // Ensure this is inside `$set`
            }
          );
          toast.success("New Key Recovered!");
          router.push("/welcome");
        } else {
          toast.error(checkAccount.msg);
        }
      }

      setLoadingNewSigner(false);
    } catch (error) {
      setLoadingNewSigner(false);
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
    setError("")
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
    setError("")
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
    setError("")
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
    setError("")
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
              <div className="pb-3">
                <h1 className="text-center text-base font-medium  m-0">
                  Add Passkey
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="contentBody">
          {step == 1 ? (
            <>
              <form action="">
                <div className="py-2">
                  <input
                    type="text"
                    name="email"
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
                    onClick={checkAddress}
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
            </>
          ) : step == 2 ? (
            <>
              <div className="py-2">
                <input
                  type="text"
                  name="privatekey"
                  onChange={handlePrivateInputChange}
                  value={privateKey}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
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
                  name="safeprivatekey"
                  onChange={handleSafePrivateInputChange}
                  value={safeprivateKey}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
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
                  name="seedphrasewallet"
                  onChange={handlePhraseInput}
                  value={seedPhrase}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
                  placeholder="Enter SeedPhrase"
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
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
                  placeholder="Enter wif"
                />
                {wifError && (
                  <div className="flex items-center gap-1 p-1 text-13 font-normal -tracking-2 text-red-500">
                    {wifError}
                  </div>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-1 p-1 pb-2 pt-2 text-13 font-normal -tracking-2 text-red-500">
                  {error}
                </div>
              )}
              <div className="btnWrpper mt-3 text-center">
                <button
                  type="button"
                  disabled={
                    loadingNewSigner ||
                    !wif ||
                    !seedPhrase ||
                    !privateKey ||
                    !safeprivateKey ||
                    seedError ||
                    wifError ||
                    privateKeyError ||
                    safePrivateKeyError
                  }
                  // onClick={checkPhrase}
                  onClick={checkPhrase}
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
            </>
          ) : step == 3 ? (
            <>
              <div className="grid gap-3 grid-cols-12">
                {phrase.split(" ").map((item, key) => (
                  <div key={key} className="col-span-6">
                    <div className="iconWithText relative">
                      <div className="flex items-center justify-center rounded-full left-1 absolute icn h-[40px] w-[40px] bg-white text-black text-xs">
                        {key + 1}
                      </div>
                      <input
                        readOnly={true}
                        value={item}
                        type="text"
                        className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pl-14`}
                      />
                    </div>
                  </div>
                ))}
                {/* ))} */}

                <div className="col-span-12 text-center my-2">
                  <button
                    disabled={loadingNewSigner}
                    onClick={createNewSigner}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    {loadingNewSigner ? "Creating..." : "Create a new Signer"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};
RecoverWallet.authRoute = true;

export default RecoverWallet;
