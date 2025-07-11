import React, { useState } from "react";
import styled from "styled-components";
import { loginSet } from "../../../lib/redux/slices/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";

import { webAuthKeyStore, storedataLocalStorage } from "../../../utils/globals";
import { getRecoverAccount, doRecovery } from "../../../lib/zeroDev";
import { getUser, updtUser } from "../../../lib/apiCall";

const SetupRecoveryPop = ({ setUp, setSetUp }) => {
  const userAuth = useSelector((state) => state.Auth);
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loadingNewSigner, setLoadingNewSigner] = useState(false);
  const [phrase, setPhrase] = useState();

  const checkPhrase = async () => {
    try {
      setLoadingNewSigner(true);
      if (!userAuth?.login) {
        setLoadingNewSigner(false);
        return;
      }
      if (phrase && phrase.trim().split(" ").length == 12) {
        let checkAccount = await getRecoverAccount(
          userAuth?.walletAddress,
          userAuth?.passkeyCred,
          phrase.trim()
        );
        if (checkAccount && checkAccount.address == userAuth.walletAddress) {
          setStep(2);
        } else {
          return;
        }
      } else {
        return;
      }
      setLoadingNewSigner(false);
    } catch (error) {
      setLoadingNewSigner(false);
      console.log("error-->", error);
      setStep(1);
    }
  };

  const createNewSigner = async () => {
    try {
      setLoadingNewSigner(true);
      let userExist = await getUser(userAuth.email);
      if (userExist.status && userExist.status == "failure") {
        return;
      } else {
        let passkeyNo =
          (userExist?.userId?.passkey_number &&
            userExist?.userId?.passkey_number + 1) ||
          2;
        let checkAccount = await doRecovery(
          userAuth?.walletAddress,
          userAuth?.passkeyCred,
          phrase.trim(),
          userAuth.email + "_passkey_" + passkeyNo
        );
        if (checkAccount.status) {
          let webAuthKeyStringObj = await webAuthKeyStore(
            checkAccount.newwebAuthKey
          );
          let data = await updtUser(
            { email: userAuth.email },
            {
              $push: { passkey: webAuthKeyStringObj },
              $set: { passkey_number: passkeyNo }, // Ensure this is inside `$set`
            }
          );
          dispatch(
            loginSet({
              login: userAuth.login,
              bitcoinWallet: userAuth.bitcoinWallet,
              email: userAuth.email,
              walletAddress: userAuth.walletAddress,
              passkeyCred: checkAccount.passkeyValidatorNew,
              webauthnData: checkAccount.newwebAuthKey,
              ensName: userAuth.ensName || "",
              ensSetup: userAuth.ensSetup || false,
              multisigAddress: userAuth.multisigAddress,
              passkey2: userAuth.passkey2,
              passkey3: userAuth.passkey3,
              multisigSetup: userAuth.multisigSetup,
              multisigActivate: userAuth.multisigActivate,
            })
          );

          let webAuthKeyStringObj2 = "";
          let webAuthKeyStringObj3 = "";
          if (userAuth.passkey2) {
            webAuthKeyStringObj2 = await webAuthKeyStore(userAuth.passkey2);
          }
          if (userAuth.passkey3) {
            webAuthKeyStringObj3 = await webAuthKeyStore(userAuth.passkey3);
          }

          storedataLocalStorage(
            {
              login: true,
              walletAddress: userAuth.walletAddress || "",
              bitcoinWallet: userAuth.bitcoinWallet || "",
              email: userAuth.email,
              passkeyCred: "",
              webauthnData: webAuthKeyStringObj,

              multisigAddress: userAuth.multisigAddress,
              passkey2: webAuthKeyStringObj2,
              passkey3: webAuthKeyStringObj3,
              ensName: userAuth.ensName || "",
              ensSetup: userAuth.ensSetup || false,
              multisigSetup: userAuth.multisigSetup,
              multisigActivate: userAuth.multisigActivate,
            },
            "authUser"
          );
          setSetUp(!setUp);
        } else {
          return;
        }
      }

      setLoadingNewSigner(false);
    } catch (error) {
      setLoadingNewSigner(false);
    }
  };

  const handleSetupRecovery = () => setSetUp(!setUp);
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          <button
            onClick={handleSetupRecovery}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
            // style={{ border: "1px solid #5f5f5f59" }}
          >
            {closeIcn}
          </button>
          <div className={`relative rounded px-3`}>
            <div className="modalBody">
              {step == 1 ? (
                <>
                  <div className="py-2 text-center">
                    <h5 className="m-0 text-xl font-bold">
                      Your Recovery Phrase
                    </h5>
                    <p className="m-0 text-xs ">
                      Please select each phone in order to make sure it is
                      correct
                    </p>
                  </div>
                  <form action="">
                    <div className="py-2">
                      <textarea
                        name=""
                        value={phrase}
                        onChange={(e) => setPhrase(e.target.value)}
                        rows={5}
                        id=""
                        className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg pr-11`}
                        placeholder="message"
                      ></textarea>
                    </div>
                    <div className="btnWrpper mt-3 text-center">
                      <button
                        type="button"
                        onClick={checkPhrase}
                        className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        Paste
                      </button>
                    </div>
                  </form>
                </>
              ) : step == 2 ? (
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

                    <div
                      onClick={createNewSigner}
                      className="col-span-12 text-center my-2"
                    >
                      <button
                        disabled={loadingNewSigner}
                        className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                      >
                        {loadingNewSigner
                          ? "Creating..."
                          : "Create a new Signer"}{" "}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  ${"" /* padding-bottom: 100px; */}

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 550px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default SetupRecoveryPop;

const closeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 15"
    fill="none"
  >
    <g clip-path="url(#clip0_0_6282)">
      <path
        d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
        fill="currentColor"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="currentColor"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);
