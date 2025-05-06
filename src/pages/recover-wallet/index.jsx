import React, { useState } from 'react'
import Image from "next/image";
import { useTheme } from "@/ContextApi/ThemeContext";
import { BackBtn } from "@/components/common";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ethers } from 'ethers';
import {
    webAuthKeyStore,
    storedataLocalStorage
} from "../../utils/globals";
import {
    getRecoverAccount,
    doRecovery,
} from "../../lib/zeroDevWallet";
// @dev add your BUNDLER_URL, PAYMASTER_URL, and PASSKEY_SERVER_URL here
import {
    getUser,
    updtUser,
    getUserWallet
} from "../../lib/apiCall";




const RecoverWallet = () => {
    const [step, setStep] = useState(1)
    const userAuth = useSelector((state) => state.Auth);
    const dispatch = useDispatch();
    const [loadingNewSigner, setLoadingNewSigner] = useState(false);
    const [phrase, setPhrase] = useState();
    const [address, setAddress] = useState();
    const [email, setEmail] = useState();
    console.log(userAuth);
    const router = useRouter();

    const checkAddress = async () => {
        try {
            setLoadingNewSigner(true)
            if (email) {
                let userExist = await getUser(email);
                if (userExist.status && userExist.status == "failure") {
                    toast.error("User Not Found!");
                    setLoadingNewSigner(false)
                } else {
                    setAddress(userExist?.userId?.wallet)
                    setLoadingNewSigner(false)
                    setStep(2);
                }
            } else {
                setLoadingNewSigner(false)
                toast.error("Invalid Address!");
            }
        } catch (error) {
            setLoadingNewSigner(false)
            console.log(" checkAddress error -->", error)
        }
    }



    const checkPhrase = async () => {
        try {
            setLoadingNewSigner(true)
            // console.log(
            //   "ph",
            //   phrase.trim().split(" ").length,
            //   phrase.trim().split(" ")
            // );

            if (phrase && phrase.trim().split(" ").length == 12) {
                // console.log(userAuth);
                let checkAccount = await getRecoverAccount(
                    address,
                    "",
                    phrase.trim()
                );
                if (checkAccount && checkAccount.address == address) {
                    setStep(3);
                } else {
                    toast.error("Invalid Phrase!");
                }
            } else {
                toast.error("Invalid Phrase!");
            }
            setLoadingNewSigner(false)
        } catch (error) {
            toast.error("Invalid Phrase!");
            setLoadingNewSigner(false)
            console.log("error-->", error);
            // setStep(1);
        }
    };


    const createNewSigner = async () => {
        try {
            setLoadingNewSigner(true)
            // updtUser
            let userExist = await getUser(email);
            if (userExist.status && userExist.status == "failure") {
                toast.error("User Not Found!");
            } else {
                let passkeyNo = ((userExist?.userId?.passkey_number && (userExist?.userId?.passkey_number + 1)) || 2);
                let checkAccount = await doRecovery(
                    address,
                    "",
                    phrase.trim(),
                    (userExist?.userId?.email + "_passkey_" + passkeyNo)
                );
                if (checkAccount.status) {
                    // console.log("checkAccount--<?>", checkAccount)
                    let webAuthKeyStringObj = await webAuthKeyStore(checkAccount.newwebAuthKey)
                    let data = await updtUser({ email: userExist?.userId?.email }, {
                        $push: { passkey: webAuthKeyStringObj },
                        $set: { passkey_number: passkeyNo } // Ensure this is inside `$set`
                    })
                    console.log("updated data==>", data)
                    // passkeyValidatorNew: passkeyValidator1.newPasskeyValidator, newwebAuthKey: 
                    toast.success("New Key Recovered!");
                    router.push("/welcome");
                } else {
                    toast.error(checkAccount.msg);
                }
            }

            setLoadingNewSigner(false)
            // doRecoveryNewSigner
        } catch (error) {
            setLoadingNewSigner(false)
            console.log("error new sigenr -->", error);
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
                                    Wallet Recovery

                                </h1>
                                {/* <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                                    Please select each phone in order to make sure it is correct
                                </p> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="contentBody">
                    {step == 1 ? <>

                        <form action="">
                            <div className="py-2">
                                <input type='text'
                                    name=""
                                    onChange={(e) => (setEmail(e.target.value))}
                                    value={email}
                                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg h-[45px] pr-11`}
                                    placeholder="Enter Email"
                                ></input>
                            </div>
                            <div className="btnWrpper mt-3 text-center">
                                <button
                                    type="button"
                                    // onClick={checkPhrase}
                                    onClick={checkAddress}
                                    disabled={loadingNewSigner}
                                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                                >
                                    {loadingNewSigner ? "Please Wait ..." : "Next"}
                                </button>
                            </div>
                        </form>
                    </> : step == 2 ? <>
                        <form action="">
                            <div className="py-2">
                                <textarea
                                    name=""
                                    value={phrase}
                                    onChange={(e) => setPhrase(e.target.value)}
                                    rows={5}
                                    id=""
                                    className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg pr-11`}
                                    placeholder="Enter Recovery Phrase"
                                ></textarea>
                            </div>
                            <div className="btnWrpper mt-3 text-center">
                                <button
                                    type="button"
                                    disabled={loadingNewSigner}
                                    // onClick={checkPhrase}
                                    onClick={checkPhrase}
                                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                                >
                                    {loadingNewSigner ? "Please Wait ..." : "Next"}
                                </button>
                            </div>
                        </form>
                    </> : step == 3 ? <>
                        <div className="grid gap-3 grid-cols-12">
                            {/* {phrase.split(" ").map((item, key) => ( */}

                            {phrase.split(" ").map((item, key) => (
                                <div key={key} className="col-span-6">
                                    <div className="iconWithText relative">
                                        <div className="flex items-center justify-center rounded-full left-1 absolute icn h-[40px] w-[40px] bg-white text-black text-xs">{key + 1}</div>
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

                            <div
                                //   onClick={createNewSigner}
                                className="col-span-12 text-center my-2"
                            >
                                <button
                                    disabled={loadingNewSigner}
                                    onClick={createNewSigner}
                                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}>
                                    {/* {loadingNewSigner ? ("Creating...") : ("Create a new Signer")} {" "} */}
                                    {loadingNewSigner ? ("Creating...") : ("Create a new Signer")}
                                </button>
                            </div>
                        </div></> : <></>}
                </div>
            </div>

        </>
    )
}
RecoverWallet.authRoute = true;

export default RecoverWallet