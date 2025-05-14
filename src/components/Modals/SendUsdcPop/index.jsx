import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { toast } from "react-toastify";
// import { getProvider, getAccount } from "@/lib/zeroDevWallet";
import { getRpcProvider, getProvider, getAccount } from "@/lib/zeroDev.js";

import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import TransactionApprovalPop from "@/components/Modals/TransactionApprovalPop";
import LoadingScreen from "@/components/LoadingScreen";
import QRScannerModal from "./qRScannerModal.jsx";
import {
  retrieveSecret,
} from "../../../utils/webauthPrf";

const SendUSDCPop = ({ setSendUsdc, setSuccess, sendUsdc, success }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [toAddress, setToAddress] = useState("");
  const [trxnApproval, settrxnApproval] = useState();
  const [amount, setAmount] = useState("");
  const [openCam, setOpenCam] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [providerr, setProviderr] = useState(null);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleClose = () => setSendUsdc(false);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!isValidAddress) {
      toast.error("Please enter a valid address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast.error("Insufficient USDC balance");
      return;
    }
    let data = JSON.parse(userAuth?.webauthKey)
    let retrieveSecretCheck = await retrieveSecret(
      data?.storageKeySecret,
      data?.credentialIdSecret
    );
    if (!retrieveSecretCheck?.status) {
      toast.error(retrieveSecretCheck?.msg);
      return;
    }
    //  else {
    // return {
    //   status: true,
    //   secret: retrieveSecretCheck?.data?.secret,
    // };
    // }
    let secretData = JSON.parse(retrieveSecretCheck?.data?.secret)
    // console.log("retrieveSecretCheck?.data?.secret-->",retrieveSecretCheck?.data?.secret?.seedPhrase)
    // return ;
    setIsLoading(true);
    try {
      let getAccountCli = await getAccount(secretData?.seedPhrase)
      if (!getAccountCli.status) {
        toast.error(getAccountCli?.msg);
        return;
      }
      let signerProvider = await getProvider(getAccountCli?.kernelClient)
      const web3 = new Web3Interaction("sepolia", signerProvider?.ethersProvider);

      const result = await web3.sendUSDC(
        process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
        toAddress,
        amount,
        signerProvider?.ethersProvider
      );

      if (result.success) {
        setSuccess(true);
        setSendUsdc(false);
        toast.success("USDC sent successfully!");
        setTimeout(fetchBalance, 2000);
      } else {
        toast.error(result.error || "Transaction failed");
      }
    } catch (error) {
      toast.error(error.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   const connectWallet = async () => {
  //     if (userAuth?.passkeyCred) {
  //       console.log("userAuth?.passkeyCred-->", userAuth?.passkeyCred)
  //       try {
  //         let account = await getAccount(userAuth?.passkeyCred);
  //         if (account) {
  //           let provider = await getProvider(account.kernelClient);
  //           if (provider) {
  //             setProviderr(provider?.ethersProvider);
  //           } else {
  //             throw new Error("Provider not detected");
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Wallet connection error:", error);
  //         toast.error("Failed to connect wallet. Please try again.");
  //       }
  //     }
  //   };

  // connectWallet();
  // }, [userAuth?.passkeyCred]);

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalance();
    }
  }, [userAuth?.walletAddress]);

  const fetchBalance = async () => {
    try {
      // if (!providerr || !userAuth?.walletAddress) return;
      const provider = await getRpcProvider();
      const web3 = new Web3Interaction("sepolia", provider);
      const result = await web3.getUSDCBalance(
        process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS, // USDC contract address
        userAuth?.walletAddress,
        // "0xEdc625B74537eE3a10874f53D170E9c17A906B9c",
        provider
      );

      if (result.success && result.balance) {
        setBalance(parseFloat(result.balance).toFixed(2));
      } else {
        toast.error(result.error || "Failed to fetch balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch USDC balance");
    }
  };

  return (
    <>
      {trxnApproval &&
        createPortal(
          <TransactionApprovalPop
            trxnApproval={trxnApproval}
            settrxnApproval={settrxnApproval}
            amount={amount}
            toAddress={toAddress}
            handleSend={handleSend}
            handleClose={handleClose}
          />,
          document.body
        )}
      {isLoading && <LoadingScreen />}
      <Modal className="fixed inset-0 flex items-center justify-center cstmModal z-[99999]">
        <buttonbuy
          onClick={handleClose}
          className="bg-black/50 h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </buttonbuy>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div className="modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20 z-10">
          <div className="relative rounded px-3">
            <div className="top pb-3">
              <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                Send USDC
              </h5>
            </div>
            {openCam ? (
              <>
                <QRScannerModal
                  setOpenCam={setOpenCam}
                  openCam={openCam}
                  onScan={(data) => {
                    setToAddress(data);
                    setOpenCam(!openCam);
                  }}
                />
              </>
            ) : (
              <>
                <div className="modalBody">
                  <div className="py-2">
                    <label className="form-label m-0 font-semibold text-xs ps-3">
                      To
                    </label>
                    <div className="relative">
                      <input
                        placeholder="Address"
                        type="text"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        className="border-white/10 bg-white/4 hover:bg-white/6 text-white/40 flex text-xs w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full"
                      />
                      <button
                        onClick={() => {
                          if (openCam) {
                            setOpenCam(false);
                          } else {
                            setOpenCam(true);
                          }
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                      >
                        {scanIcn}
                      </button>
                    </div>
                  </div>
                  <div className="py-2">
                    <label className="form-label m-0 font-semibold text-xs ps-3">
                      Balance: {balance} USDC
                    </label>
                    <div className="iconWithText relative">
                      <div className="absolute icn left-2 flex items-center gap-2 text-xs">
                        {usdcIcn}
                        USDC
                      </div>
                      <input
                        placeholder="Amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        className="border-white/10 bg-white/4 hover:bg-white/6 text-white/40 flex text-xs w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full pl-20"
                      />
                    </div>
                  </div>
                  <div className="py-2 mt-4">
                    <button
                      type="button"
                      onClick={() => settrxnApproval(!trxnApproval)}
                      disabled={!isValidAddress || !amount || isLoading}
                      className="flex items-center justify-center commonBtn rounded-full w-full h-[50px] disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

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

export default SendUSDCPop;

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

const usdcIcn = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_2_2)">
      <path
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
        fill="#3E73C4"
      />
      <path
        d="M10.011 9.062C10.011 8 9.371 7.636 8.091 7.484C7.177 7.3625 6.9945 7.12 6.9945 6.695C6.9945 6.27 7.2995 5.997 7.9085 5.997C8.457 5.997 8.762 6.179 8.914 6.6345C8.92996 6.67847 8.95894 6.71652 8.99709 6.74359C9.03524 6.77066 9.08073 6.78545 9.1275 6.786H9.615C9.64316 6.78675 9.67117 6.78178 9.69735 6.77138C9.72353 6.76098 9.74732 6.74537 9.76728 6.7255C9.78724 6.70563 9.80297 6.68191 9.81349 6.65578C9.82401 6.62966 9.82912 6.60166 9.8285 6.5735V6.5435C9.76892 6.21395 9.60217 5.9133 9.35417 5.68826C9.10616 5.46322 8.79077 5.32638 8.457 5.299V4.571C8.457 4.4495 8.3655 4.3585 8.2135 4.328H7.756C7.6345 4.328 7.543 4.419 7.5125 4.571V5.269C6.598 5.39 6.0195 5.997 6.0195 6.756C6.0195 7.757 6.6285 8.1515 7.9085 8.3035C8.762 8.455 9.036 8.6375 9.036 9.123C9.036 9.608 8.6095 9.942 8.0305 9.942C7.238 9.942 6.964 9.6085 6.8725 9.153C6.8425 9.032 6.7505 8.971 6.659 8.971H6.141C6.11288 8.97032 6.08492 8.97535 6.0588 8.98578C6.03268 8.99621 6.00895 9.01183 5.98904 9.03169C5.96913 9.05155 5.95346 9.07525 5.94297 9.10134C5.93247 9.12744 5.92738 9.15539 5.928 9.1835V9.2135C6.0495 9.9725 6.5375 10.5185 7.543 10.6705V11.399C7.543 11.52 7.6345 11.6115 7.7865 11.6415H8.244C8.3655 11.6415 8.457 11.5505 8.4875 11.399V10.67C9.402 10.5185 10.011 9.881 10.011 9.0615V9.062Z"
        fill="white"
      />
      <path
        d="M6.44599 12.2485C4.06899 11.3985 2.84999 8.7585 3.73399 6.422C4.19099 5.147 5.19649 4.1765 6.44599 3.721C6.56799 3.6605 6.62849 3.5695 6.62849 3.4175V2.9925C6.62849 2.8715 6.56799 2.7805 6.44599 2.75C6.41549 2.75 6.35449 2.75 6.32399 2.78C5.63821 2.99416 5.00156 3.34186 4.4507 3.80309C3.89985 4.26431 3.44567 4.82994 3.11431 5.46741C2.78296 6.10489 2.58098 6.80161 2.51999 7.51746C2.45901 8.23332 2.54024 8.95417 2.75899 9.6385C3.30699 11.3385 4.61749 12.6435 6.32399 13.1895C6.44599 13.25 6.56799 13.1895 6.59799 13.068C6.62849 13.038 6.62849 13.007 6.62849 12.9465V12.5215C6.62849 12.4305 6.53749 12.3095 6.44599 12.2485ZM9.67599 2.7805C9.55399 2.7195 9.43199 2.7805 9.40199 2.9015C9.37149 2.932 9.37149 2.9625 9.37149 3.023V3.448C9.37149 3.5695 9.46249 3.6905 9.55399 3.7515C11.931 4.6015 13.15 7.2415 12.266 9.578C11.809 10.853 10.8035 11.8235 9.55399 12.279C9.43199 12.3395 9.37149 12.4305 9.37149 12.5825V13.0075C9.37149 13.1285 9.43199 13.2195 9.55399 13.25C9.58449 13.25 9.64549 13.25 9.67599 13.22C10.3618 13.0058 10.9984 12.6581 11.5493 12.1969C12.1001 11.7357 12.5543 11.1701 12.8857 10.5326C13.217 9.89511 13.419 9.19839 13.48 8.48254C13.541 7.76668 13.4597 7.04583 13.241 6.3615C12.693 4.6315 11.352 3.3265 9.67599 2.7805Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_2_2">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const scanIcn = (
  <svg
    height={24}
    width={24}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path
      d="m62 215c-8 0-15-7-15-16l0-47c0-56 45-101 100-101l48 0c9 0 16 7 16 16 0 9-7 16-16 16l-48 0c-38 0-69 31-69 69l0 47c0 9-7 16-16 16z m379 0c-9 0-16-7-16-16l0-47c0-38-31-69-69-69l-48 0c-9 0-16-7-16-16 0-9 7-16 16-16l48 0c55 0 100 45 100 101l0 47c0 9-7 16-15 16z m-85 246l-29 0c-9 0-16-7-16-16 0-9 7-16 16-16l29 0c38 0 69-31 69-69l0-28c0-9 7-16 16-16 8 0 15 7 15 16l0 28c0 56-45 101-100 101z m-161 0l-48 0c-55 0-100-45-100-101l0-47c0-9 7-16 15-16 9 0 16 7 16 16l0 47c0 38 31 69 69 69l48 0c8 0 16 7 16 16 0 9-7 16-16 16z m189-221l-265 0c-9 0-16 7-16 16 0 9 7 16 16 16l265 0c9 0 16-7 16-16 0-9-7-16-16-16z m-237 56l0 6c0 34 28 62 62 62l86 0c34 0 61-28 61-62l0-6c0-3-2-5-4-5l-201 0c-2 0-4 2-4 5z m0-80l0-6c0-34 28-62 62-62l86 0c34 0 61 28 61 62l0 6c0 3-2 5-4 5l-201 0c-2 0-4-2-4-5z"
      fill="white"
    />
  </svg>
);
