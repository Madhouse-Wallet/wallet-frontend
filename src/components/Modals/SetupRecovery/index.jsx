import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// css

// img

import {
  PasskeyValidatorContractVersion,
  WebAuthnMode,
  toPasskeyValidator,
  toWebAuthnKey
} from "@zerodev/passkey-validator"
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { useDispatch, useSelector } from "react-redux";

import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem"
import { sepolia } from "viem/chains"

import {
  generateOTP,
  bufferToBase64,
  base64ToBuffer,
} from "../../../utils/globals";

import { createAccount, getAccount, getMnemonic } from "../../../lib/zeroDevWallet"
// @dev add your BUNDLER_URL, PAYMASTER_URL, and PASSKEY_SERVER_URL here
const BUNDLER_URL = "https://rpc.zerodev.app/api/v2/bundler/d6e742a7-f666-4f0d-b1cf-7e70c5a4e443"
const PAYMASTER_RPC = "https://rpc.zerodev.app/api/v2/paymaster/d6e742a7-f666-4f0d-b1cf-7e70c5a4e443"
const PASSKEY_SERVER_URL = "https://passkeys.zerodev.app/api/v3/d6e742a7-f666-4f0d-b1cf-7e70c5a4e443"
const CHAIN = sepolia
const entryPoint = getEntryPoint("0.7")

const contractAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863"
const contractABI = parseAbi([
  "function mint(address _to) public",
  "function balanceOf(address owner) external view returns (uint256 balance)"
])
const publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
  chain: CHAIN
})


const SetupRecoveryPop = ({ setUp, setSetUp }) => {
  const userAuth = useSelector((state) => state.Auth);

  const [step, setStep] = useState(1)
  const [phrase, setPhrase] = useState()

  const checkPhrase = async () => {
    try {
      console.log("ph",phrase.trim().split(" ").length, phrase.trim().split(" "))
      if (!userAuth?.login) return toast.error("Please Login!")
      if (phrase && phrase.trim().split(" ") == 12) {
        setStep(2)
      } else {
        toast.error("Invalid Phrase!")
      }
    } catch (error) {
      toast.error("Invalid Phrase!")
      console.log("error-->", error)
      setStep(1)
    }
  }


  const handleSetupRecovery = () => setSetUp(!setUp);
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div
          className={`modalDialog relative p-2 mx-auto w-full rounded-lg z-10 bg-[var(--backgroundColor)]`}
        >
          <div className={`position-relative rounded px-3`}>
            <button
              onClick={handleSetupRecovery}
              className="border-0 p-0 absolute"
              variant="transparent"
              style={{ right: 10, top: 0 }}
            >
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
                    fill="var(--textColor)"
                  />
                  <path
                    d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
                    fill="var(--textColor)"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_0_6282">
                    <rect
                      width="15"
                      height="15"
                      fill="var(--textColor)"
                      transform="translate(0.564453)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
            {/* <div className="top pb-3">
            </div> */}
            <div className="modalBody">
              {step == 1 ? <>
                <div className="py-2 text-center">
                  <h5 className="m-0 text-xl fw-bold">Your Recovery Phrase</h5>
                  <p className="m-0 text-gray-400">Please select each phone in order to make sure it is correct</p>
                </div>
                <form action="">
                  <div className="py-2">
                    <textarea name="" value={phrase} onChange={(e) => (setPhrase(e.target.value))} rows={5} id="" className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)] text-white text-xs h-auto p-2" placeholder="message"></textarea>
                  </div>
                  <div className="btnWrpper mt-3 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center btn commonBtn border-0"
                      onClick={checkPhrase}
                    >
                      Paste
                    </button>
                  </div>
                </form></> : step == 2 ? <>
                  <div className="grid gap-3 grid-cols-12">

                    {[1, 2, 3, 4].map((item, key) => (
                      <div className="col-span-6 " key={key}>
                        <div className="iconWithText relative">
                          <label htmlFor="" className="form-label rounded-circle flex items-center justify-center m-0 text-dark font-medium absolute left-1 icn" style={{ height: 40, width: 40, background: "#ff8735" }}>{key + 1}</label>
                          <input type="text" value={item} readOnly={true} className="form-control pl-12 text-xs rounded-pill w-full bg-[#ff87352e] focus:bg-[#ff87352e]" style={{ border: "1px solid #ff8735" }} />
                        </div>
                      </div>
                    ))}
                    <div className="col-span-12 text-center my-2">
                      <button className="inline-flex items-center justify-center btn commonBtn rounded-pill">
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                </> : <></>}

            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  .modalDialog {
    max-width: 500px;
    input {
      color: var(--textColor);
    }
  }
`;

const RadioList = styled.ul`
  button {
    font-size: 12px;
    background: var(--cardBg);
    border-color: var(--cardBg);
  }
  input:checked + button {
    background: #ff8735;
    border-color: #ff8735;
    color: #000;
  }
`;

export default SetupRecoveryPop;
