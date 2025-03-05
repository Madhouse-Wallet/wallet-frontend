import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTheme } from "@/ContextApi/ThemeContext";

import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { loginSet } from "../../../lib/redux/slices/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import OtpInput from "react-otp-input";
import { getProvider, getAccount } from "@/lib/zeroDevWallet";
import {
  getUser,
  getSubdomainApproval,
  updtUser
} from "@/lib/apiCall";

import {
  webAuthKeyStore,
  storedataLocalStorage
} from "../../../utils/globals";
const EnsDomainPop = ({ ensDomain, setEnsDomain }) => {
  const [providerr, setProviderr] = useState(null);
  const [accountClinet, setAccountClinet] = useState(null);
  const [domainName, setDomainName] = useState(null);
  const [loading, setLoading] = useState(false);
  const userAuth = useSelector((state) => state.Auth);
  const dispatch = useDispatch();


  const handleChangeEmail = () => {
    setEnsDomain(!ensDomain)
  }


  useEffect(() => {
    const connectWallet = async () => {
      if (userAuth?.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        console.log("account---<", account);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          setAccountClinet(account.kernelClient)
          console.log("provider-->", provider);
          if (provider) {
            console.log("provider -line-114", provider);
            setProviderr(provider?.ethersProvider);
          }
        }
      }
      // else {
      //   toast.error("Please Login");
      //   return;
      // }
    };
    connectWallet()
  }, []);


  const submitFunc = async () => {
    try {
      if (!providerr) {
        return toast.error("Please Login!")
      }
      if (!domainName) {
        return toast.error("Please Enter Domain Name!")
      }
      setLoading(true)
      const web3 = new Web3Interaction("sepolia", providerr);
      const contractAddress = process.env.NEXT_PUBLIC_SUBDOMAIN_CONTRACT;
      const resolverAddress = process.env.NEXT_PUBLIC_RESOLVER_CONTRACT;
      const parentDomain = process.env.NEXT_PUBLIC_PARENT_DOMAIN;
      const defApiKey = process.env.NEXT_PUBLIC_DEFENDER_API_KEY;
      const defApiSecret = process.env.NEXT_PUBLIC_DEFENDER_API_SECRET;
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;



      if (!contractAddress) {
        return toast.error("No Contract Address Found")
      }
      // address: string, resolverAddress: string, name: string, kernelClinet: any
      // const checkAvailability = await web3.checkDomainAvailable(contractAddress, domainName, defApiKey, defApiSecret, rpcUrl, userAuth?.walletAddress);
      let SubdomainApproval = await getSubdomainApproval(contractAddress, defApiKey, defApiSecret, userAuth?.walletAddress);
      console.log("SubdomainApproval-->", SubdomainApproval)
      const assignSubdomain = await web3.checkDomainAvailable(contractAddress, domainName, resolverAddress, parentDomain, userAuth?.walletAddress);

      // checkDomainAvailable = async (address: string, name: string, resolverAddress: any, parentDomain: any, userAddress: any):

      if (assignSubdomain) {
        let data = await updtUser({ email: userAuth.email }, {
          $set: {
            ensName: assignSubdomain,
            ensSetup: true
          } // Ensure this is inside `$set`
        })
        console.log("data-->", data, "assignSubdomain-->", assignSubdomain)
        let webAuthKeyStringObj = ""
        let webAuthKeyStringObj2 = ""
        let webAuthKeyStringObj3 = ""
        if (userAuth.webauthKey) {
          webAuthKeyStringObj = await webAuthKeyStore(userAuth.webauthKey)
        }
        if (userAuth.passkey2) {
          webAuthKeyStringObj2 = await webAuthKeyStore(userAuth.passkey2)
        }
        if (userAuth.passkey3) {
          webAuthKeyStringObj3 = await webAuthKeyStore(userAuth.passkey3)
        }


        dispatch(
          loginSet({
            login: userAuth.login,
            username: userAuth.username,
            email: userAuth.email,
            walletAddress: userAuth.walletAddress,
            passkeyCred: userAuth.passkeyCred,
            webauthKey: userAuth.webauthKey,
            id: userAuth.id,
            signer: userAuth.signer,
            multisigAddress: userAuth.multisigAddress,
            passkey2: userAuth.passkey2,
            passkey3: userAuth.passkey3,
            ensName: assignSubdomain,
            ensSetup: true,
            multisigSetup: userAuth.multisigSetup,
            multisigActivate: userAuth.multisigActivate,
          })
        );

        storedataLocalStorage({
          login: true,
          walletAddress: userAuth.walletAddress || "",
          signer: "",
          username: userAuth.username,
          email: userAuth.email,
          passkeyCred: "",
          webauthKey: webAuthKeyStringObj,
          id: userAuth.id,
          multisigAddress: userAuth.multisigAddress,
          passkey2: webAuthKeyStringObj2,
          passkey3: webAuthKeyStringObj3,
          ensName: assignSubdomain,
          ensSetup: true,
          multisigSetup: userAuth.multisigSetup,
          multisigActivate: userAuth.multisigActivate
        }, "authUser")
        setLoading(false)
        toast.success("Setup Done!")
        handleChangeEmail()
      }
    } catch (error) {
      console.log(" setup ens domain error-->", error)
      setLoading(false)

      toast.error((error?.message || error))
    }
  }

  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >

        {/* <button
          onClick={handleChangeEmail}
          className="bg-black/50 h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </button> */}
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          <div className={`relative rounded px-3`}>

            <div className="modalBody">
              <div className="py-2 text-center">
                <h5 className="m-0 text-xl font-bold">
                  Please Setup Ens Domain Name
                </h5>
              </div>
              <div className="py-2">
                <input
                  onChange={(e) => (setDomainName(e.target.value))}
                  value={domainName}
                  name=""
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 rounded-lg pr-11 h-[45px]`}
                  placeholder=""
                />
              </div>
              <div className="btnWrpper mt-3 text-center">
                <button
                  onClick={submitFunc}
                  disabled={loading}
                  type="button"
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >{loading ? "Please wait..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
const OtpWrpper = styled.div`
  div {
    justify-content: center;
    gap: 10px;
    input {
      height: 50px;
      width: 50px !important;
      border-radius: 8px;
      outline: 0;
      ${"" /* color: rgb(255 255 255 / 0.4); */}
      background: ${({ theme }) =>
    theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "#fff3ed"};
      border: 1px solid rgb(255 255 255 / 0.1);
      border-color: ${({ theme }) =>
    theme === "dark" ? "rgb(255 255 255 / 0.1)" : "#ffad84"};
      font-size: 24px;
      font-weight: 600;
    }
  }
`;
const Modal = styled.div`
  padding-bottom: 100px;

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 550px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default EnsDomainPop;


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
);


const copyIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 2H10C8.897 2 8 2.897 8 4V8H4C2.897 8 2 8.897 2 10V20C2 21.103 2.897 22 4 22H14C15.103 22 16 21.103 16 20V16H20C21.103 16 22 15.103 22 14V4C22 2.897 21.103 2 20 2ZM4 20V10H14L14.002 20H4ZM20 14H16V10C16 8.897 15.103 8 14 8H10V4H20V14Z"
      fill="currentColor"
    />
  </svg>
);
