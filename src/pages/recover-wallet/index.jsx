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

const RecoverWallet = () => {
  const [step, setStep] = useState(1);
  const [loadingNewSigner, setLoadingNewSigner] = useState(false);
  const [phrase, setPhrase] = useState();
  const [address, setAddress] = useState();
  const [email, setEmail] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [safeprivateKey, setSafePrivateKey] = useState();
  const [seedPhrase, setSeedPhrase] = useState();
  const [wif, setWif] = useState();
  const router = useRouter();

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
      if (privateKey && wif && safeprivateKey && seedPhrase) {
        let testMenmonic = await checkMenmonic(seedPhrase, privateKey);
        if (!testMenmonic.status) {
          toast.error(testMenmonic.msg);
          setLoadingNewSigner(false);
          return;
        }
        let recoverAccount = await doAccountRecovery(
          privateKey,
          safeprivateKey,
          address
        );
        let recoveryBitcoin = await decodeBitcoinAddress(wif);
        if (recoveryBitcoin?.status == "error") {
          toast.error("Invalid Wif!");
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
            let storageKeySecret = storeData?.storageKey;
            let credentialIdSecret = storeData?.credentialId;
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
                      storageKeySecret,
                      credentialIdSecret,
                      displayName: "",
                      bitcoinWallet: recoveryBitcoin?.data?.address,
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
            toast.error(storeData.msg);
            setLoadingNewSigner(false);
          }
        } else {
          toast.error(recoverAccount?.msg);
          setLoadingNewSigner(false);
        }
      } else {
        toast.error("Invalid Credentials!");
        setLoadingNewSigner(false);
      }
      setLoadingNewSigner(false);
    } catch (error) {
      toast.error("Invalid Key!");
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
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-full h-[45px] pr-11`}
                    placeholder="Enter Email"
                  ></input>
                </div>
                <div className="btnWrpper mt-3 text-center">
                  <button
                    type="button"
                    onClick={checkAddress}
                    disabled={loadingNewSigner}
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
                  onChange={(e) => setPrivateKey(e.target.value)}
                  value={privateKey}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
                  placeholder="Enter Private Key"
                />
              </div>
              <div className="py-2">
                <input
                  type="text"
                  name="safeprivatekey"
                  onChange={(e) => setSafePrivateKey(e.target.value)}
                  value={safeprivateKey}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
                  placeholder="Enter Safe Private Key"
                />
              </div>
              <div className="py-2">
                <input
                  type="text"
                  name="seedphrasewallet"
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  value={seedPhrase}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
                  placeholder="Enter SeedPhrase"
                />
              </div>
              <div className="py-2">
                <input
                  type="text"
                  name="wif"
                  onChange={(e) => setWif(e.target.value)}
                  value={wif}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
                  placeholder="Enter wif"
                />
              </div>
              <div className="btnWrpper mt-3 text-center">
                <button
                  type="button"
                  disabled={loadingNewSigner}
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
