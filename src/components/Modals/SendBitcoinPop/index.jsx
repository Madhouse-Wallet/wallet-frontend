import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { getProvider, getAccount } from "@/lib/zeroDev";
import { useSelector } from "react-redux";
import LoadingScreen from "@/components/LoadingScreen";
import { fetchBitcoinBalance } from "./../../../pages/api/bitcoinBalance.js";
import { getUser, btcSat } from "@/lib/apiCall.js";
import { sendBitcoinFunction } from "@/utils/bitcoinSend.js";
import { retrieveSecret } from "@/utils/webauthPrf.js";

const SendBitcoinPop = ({
  setSendBitcoin,
  sendBitcoin,
  success,
  setSuccess,
}) => {
  const userAuth = useSelector((state) => state.Auth);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [providerr, setProviderr] = useState(null);

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers with decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleClose = () => setSendBitcoin(false);

  const getSecretData = async (storageKey, credentialId) => {
    try {
      let retrieveSecretCheck = await retrieveSecret(storageKey, credentialId);
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

  const recoverSeedPhrase = async () => {
    try {
      let userExist = await getUser(userAuth?.email);
      if (
        userExist?.userId?.secretCredentialId &&
        userExist?.userId?.secretStorageKey
      ) {
        let callGetSecretData = await getSecretData(
          userExist?.userId?.secretStorageKey,
          userExist?.userId?.secretCredentialId
        );
        if (callGetSecretData?.status) {
          return JSON.parse(callGetSecretData?.secret);
        } else {
          return false;
        }
      }
    } catch (error) {
      console.log("Error in Fetching secret!", error);
      return false;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    let userExist = await getUser(userAuth?.email);

    setLoading(true);
    if (!isValidAddress) {
      setLoading(false);
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setLoading(false);
      return;
    }
    // Check if amount is less than 0.1
    const privateKey = await recoverSeedPhrase();
    if (!privateKey) {
      setLoading(false);
      return;
    }
    const sendLnbitWithdraw = await btcSat(amount, privateKey?.publicKey);
    if (sendLnbitWithdraw.status && sendLnbitWithdraw.status == "failure") {
      setLoading(false);
    } else {
      const satoshis = Math.round(parseFloat(amount) * 100000000);
      const result = await sendBitcoinFunction({
        fromAddress: userAuth?.bitcoinWallet,
        toAddress: sendLnbitWithdraw.data.data.address,
        amountSatoshi: satoshis,
        privateKeyHex: privateKey?.wif,
        network: "main", // Use 'main' for mainnet
      });
      if (result.status) {
        toast.success(result.transactionHash);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const connectWallet = async () => {
      if (userAuth?.passkeyCred) {
        try {
          let account = await getAccount(userAuth?.passkeyCred);
          if (account) {
            let provider = await getProvider(account.kernelClient);
            if (provider) {
              setProviderr(provider?.ethersProvider);
            } else {
              throw new Error("Provider not detected");
            }
          }
        } catch (error) {
          console.error("Wallet connection error:", error);
        }
      }
    };

    connectWallet();
  }, [userAuth?.passkeyCred]);

  useEffect(() => {
    if (providerr && userAuth?.bitcoinWallet) {
      fetchBalance();
    }
  }, [providerr, userAuth?.bitcoinWallet]);

  const fetchBalance = async () => {
    try {
      if (!userAuth?.bitcoinWallet) return;

      const result = await fetchBitcoinBalance(userAuth?.bitcoinWallet);

      if (result.error) {
        return;
      } else {
        setBalance(result.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      return;
    }
  };

  return (
    <>
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
          {step == 1 ? (
            <>
              <div className="grid gap-3 grid-cols-12 pt-1">
                <div className="col-span-12">
                  <button
                    onClick={() => setStep(2)}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Brdge To Madhouse
                  </button>
                </div>
                <div className="col-span-12">
                  <button
                    onClick={() => setStep(2)}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Bridge To Spend Wallet
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative rounded px-3">
                <div className="top pb-3">
                  <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                    Bridge Bitcoin
                  </h5>
                </div>
                <div className="modalBody">
                  <div className="py-2">
                    <label className="form-label m-0 font-semibold text-xs ps-3">
                      Balance: {balance} Bitcoin
                    </label>
                    <div className="iconWithText relative">
                      <div className="absolute icn left-2 flex items-center gap-2 text-xs">
                        {btc}
                        Bitcoin
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
                      onClick={handleSend}
                      disabled={loading}
                      className="flex items-center justify-center commonBtn rounded-full w-full h-[50px] disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send"}
                    </button>
                  </div>
                  {/* </form> */}
                </div>
                {/* </>
            )} */}
              </div>
            </>
          )}
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
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default SendBitcoinPop;

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

const btc = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.6707 13.661C20.2014 19.5539 14.2322 23.1402 8.33802 21.6707C2.4462 20.2015 -1.14053 14.2327 0.329506 8.34018C1.79816 2.44665 7.76733 -1.14 13.6598 0.32917C19.5537 1.79834 23.1401 7.76785 21.6707 13.661Z"
      fill="#F7931A"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16.0129 9.56296C16.2418 8.02184 15.0769 7.19338 13.484 6.6407L14.0007 4.55306L12.7392 4.23637L12.2361 6.269C11.9045 6.18575 11.5639 6.10721 11.2254 6.02939L11.732 3.98338L10.4712 3.66669L9.95415 5.7536C9.67963 5.69062 9.41015 5.62837 9.14857 5.56286L9.15001 5.55635L7.41021 5.11877L7.07462 6.47602C7.07462 6.47602 8.01063 6.6921 7.99086 6.70549C8.50181 6.83397 8.59415 7.17456 8.5787 7.44456L7.99015 9.82283C8.02536 9.83188 8.07099 9.84491 8.12129 9.86518L8.07855 9.85442L8.07852 9.85441C8.04927 9.84703 8.01895 9.83937 7.98799 9.83188L7.16301 13.1635C7.10049 13.3198 6.94203 13.5544 6.58487 13.4653C6.59745 13.4838 5.66791 13.2348 5.66791 13.2348L5.04163 14.6894L6.68333 15.1016C6.86666 15.1479 7.04779 15.1955 7.22704 15.2426C7.34639 15.2739 7.46491 15.3051 7.58268 15.3355L7.0606 17.447L8.32071 17.7637L8.83776 15.6746C9.18199 15.7687 9.51615 15.8556 9.84312 15.9373L9.32787 18.0167L10.5894 18.3334L11.1115 16.2258C13.2627 16.6359 14.8803 16.4705 15.5612 14.5106C16.1099 12.9326 15.5339 12.0223 14.4021 11.4287C15.2263 11.2373 15.8472 10.6911 16.0129 9.56296ZM13.1305 13.6344C12.7728 15.0821 10.5231 14.4836 9.49368 14.2097C9.40107 14.1851 9.31833 14.1631 9.24774 14.1454L9.94049 11.348C10.0264 11.3696 10.1315 11.3934 10.2504 11.4203C11.3151 11.6609 13.497 12.1541 13.1305 13.6344ZM10.4643 10.1221C11.3226 10.3528 13.1946 10.856 13.5207 9.54016C13.8537 8.19424 12.0342 7.78851 11.1456 7.59037C11.0457 7.56808 10.9575 7.54842 10.8855 7.53034L10.2574 10.0675C10.3167 10.0824 10.3864 10.1011 10.4643 10.1221Z"
      fill="white"
    />
  </svg>
);
