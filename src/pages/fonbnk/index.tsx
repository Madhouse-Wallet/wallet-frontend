import { filterAmountInput } from "@/utils/helper";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { katonipayApi, updtUser } from "@/lib/apiCall";
import {
  getAccount,
  sendTransaction,
  USDC_ABI,
  publicClient,
  usdc,
  calculateGasPriceInUSDC,
} from "@/lib/zeroDev.js";
import { parseUnits, parseAbi } from "viem";
import { getUser } from "../api/lnbit";
import { retrieveSecret } from "@/utils/webauthPrf";
import TransactionFailedPop from "@/components/Modals/TransactionFailedPop";
import { createPortal } from "react-dom";
import SuccessPop from "@/components/Modals/SuccessPop";
export default function Fonbnk() {
  const router = useRouter();
  const userAuth = useSelector((state: any) => state.Auth);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ghanaLoading, setGhanaLoading] = useState(false);
  const [error, setError] = useState<any>("");
  const [balance, setBalance] = useState("0");
  const [txError, setTxError] = useState<any>("");
  const [kenyaBtnText, setKenyaBtnText] = useState<any>("");
  const [ghanaBtnText, setGhanaBtnText] = useState<any>("");
  const [gasPrice, setGasPrice] = useState<any>(null);
  const [gasPriceError, setGasPriceError] = useState<any>("");
  const [maxAmount, setMaxAmount] = useState<any>(null);
  const [feeAmount, setFeeAmount] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);

  const [onRampForm, setOnRampForm] = useState({
    amount: "",
    phoneNumber: "",
    finalPhone: "",
    currency: "USDC", // Default to USDC
  });
  const fetchBalance = async () => {
    try {
      const senderUsdcBalance = await publicClient.readContract({
        abi: parseAbi([
          "function balanceOf(address account) returns (uint256)",
        ]),
        address: usdc as any,
        functionName: "balanceOf",
        args: [userAuth?.walletAddress],
      });
      const balance = String(
        Number(BigInt(senderUsdcBalance)) / Number(BigInt(1e6))
      );
      setBalance(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    if (userAuth?.walletAddress) {
      fetchBalance();
    }
  }, [userAuth?.walletAddress]);
  const [offRampForm, setOffRampForm] = useState({
    amount: "",
    phoneNumber: "",
    finalPhone: "",
    currency: "USDC", // Default to USDC
  });

  const currencyOptions = [
    { value: "usdc", label: "USD" },
    // { value: "airtime", label: "KES" },
  ];
  const handleOnRampChange = (e: any) => {
    const { id, value } = e.target;
    setError("");
    if (id === "amount") {
      const filteredValue = filterAmountInput(value, 2, 20);
      const FEE_PERCENTAGE = parseFloat(
        process.env.NEXT_PUBLIC_FEE_PERCENTAGE as any
      );
      const FeeAmount = (filteredValue as any) * FEE_PERCENTAGE;
      setFeeAmount(FeeAmount);
      setOnRampForm((prev) => ({ ...prev, [id]: filteredValue }));
    } else if (id == "phoneNumber") {
      // Keep only digits
      let digits = value.replace(/\D/g, "");

      // Remove leading 0 or 254 if user tries typing them
      if (digits.startsWith("254")) {
        digits = digits.slice(3);
      } else if (digits.startsWith("0")) {
        digits = digits.slice(1);
      }

      // Enforce max 9 digits
      if (digits.length > 9) {
        digits = digits.slice(0, 9);
      }

      // Always prepend +254
      const formatted = "+254" + digits;
      setOnRampForm((prev) => ({
        ...prev,
        [id]: digits,
        finalPhone: formatted,
      }));
    }
  };

  const handleOffRampChange = (e: any) => {
    const { id, value } = e.target;

    if (id === "amount") {
      const filteredValue = filterAmountInput(value, 2, 20);
      const FEE_PERCENTAGE = parseFloat(
        process.env.NEXT_PUBLIC_FEE_PERCENTAGE as any
      );
      const FeeAmount = (filteredValue as any) * FEE_PERCENTAGE;
      setFeeAmount(FeeAmount);
      setOffRampForm((prev) => ({ ...prev, [id]: filteredValue }));
    } else if (id == "phoneNumber") {
      // Keep only digits
      let digits = value.replace(/\D/g, "");

      // Remove leading 0 or 233 if user tries typing them
      if (digits.startsWith("233")) {
        digits = digits.slice(3);
      } else if (digits.startsWith("0")) {
        digits = digits.slice(1);
      }

      // Enforce max 9 digits
      if (digits.length > 9) {
        digits = digits.slice(0, 9);
      }

      // Always prepend +233
      const formatted = "+233" + digits;
      setOffRampForm((prev) => ({
        ...prev,
        [id]: digits,
        finalPhone: formatted,
      }));
    }
  };

  const handleOnRampSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setKenyaBtnText("Please wait...");
    const data = await katonipayApi({
      phoneNumber: onRampForm.finalPhone,
      accountName: onRampForm.finalPhone,
      networkProvider: "MPESA",
      currency: "KES",
      cryptoAmount: parseFloat(onRampForm.amount),
      senderAddress: userAuth?.walletAddress,
    });
    console.log(data);
    if (data?.status == "success") {
      let escrowAddress = data?.data?.data?.escrowAddress;
      console.log("escrowAddress-->", escrowAddress);
      setKenyaBtnText("Sending USDC...");
      let result = await handleSend(
        escrowAddress,
        parseFloat(onRampForm.amount)
      );

      setLoading(false);
      // escrowAddress
    } else {
      setLoading(false);
      setError(
        data?.error?.message || "Something went wrong, please try again."
      );
    }
    // const fonbnkUrl = `${process.env.NEXT_PUBLIC_FONBNK_ONRAMP_URL}&source=${process.env.NEXT_PUBLIC_FONBNK_ONRAMP_SOURCE}&address=${userAuth?.walletAddress}&amount=${onRampForm.amount}&currency=${onRampForm.currency}`;

    // window.open(fonbnkUrl, "_blank");
  };

  const handleSend = async (toAddress: any, amount: any) => {
    let user = await getUser(userAuth?.email);

    if (!user) {
      setError("User not found");
      return;
    }

    const data = JSON.parse(userAuth?.webauthnData);
    const retrieveSecretCheck = await retrieveSecret(
      data?.encryptedData,
      data?.credentialID
    );
    if (!retrieveSecretCheck?.status) {
      setError("Error retrieving wallet credentials. Please try again.");
      return;
    }

    const secretData = JSON.parse(retrieveSecretCheck?.data?.secret as any);

    setGasPriceError("");
    try {
      const getAccountCli = await getAccount(
        secretData?.privateKey,
        secretData?.safePrivateKey
      );
      if (!getAccountCli.status) {
        setError("Error getting account client. Please try again.");
        return;
      }

      let COMMISSION_FEES;
      if (!user?.userId?.commission_fees) {
        let data = await updtUser(
          { email: userAuth.email },
          {
            $set: { commission_fees: process.env.NEXT_PUBLIC_MADHOUSE_FEE },
          }
        );
        COMMISSION_FEES = process.env.NEXT_PUBLIC_MADHOUSE_FEE;
      } else {
        COMMISSION_FEES = user?.userId?.commission_fees;
      }

      const gasPriceResult = await calculateGasPriceInUSDC(
        getAccountCli?.kernelClient,
        [
          {
            to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [toAddress, parseUnits(amount.toString(), 6)],
          },
          {
            to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [
              process.env.NEXT_PUBLIC_MADHOUSE_FEE,
              parseUnits(feeAmount.toString(), 6),
            ],
          },
          {
            to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: "transfer",
            args: [COMMISSION_FEES, parseUnits(feeAmount.toString(), 6)],
          },
        ]
      );
      // Round gas price to 2 decimals
      const value = Number.parseFloat(gasPriceResult.formatted);
      const roundedGasPrice = (Math.ceil(value * 100) / 100).toFixed(2);
      setGasPrice(roundedGasPrice);

      // Check if amount + gas price exceeds balance
      const totalRequired =
        Number.parseFloat(amount) + Number.parseFloat(roundedGasPrice);
      if (totalRequired > Number.parseFloat(balance)) {
        setError(
          `Insufficient balance. Required: ${totalRequired.toFixed(2)} USDC (Amount: ${amount} + Max Gas Fee: ${roundedGasPrice})`
        );
        return;
      }
      const tx = await sendTransaction(getAccountCli?.kernelClient, [
        {
          to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [toAddress, parseUnits(amount.toString(), 6)],
        },
        {
          to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [
            process.env.NEXT_PUBLIC_MADHOUSE_FEE,
            parseUnits(feeAmount.toString(), 6),
          ],
        },
        {
          to: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [COMMISSION_FEES, parseUnits(feeAmount.toString(), 6)],
        },
      ]);
      if (tx && !tx.error) {
        console.log("Transaction successful:", tx);
        // tx is a transaction hash (success)
        setSuccess(true);
        setTimeout(fetchBalance, 2000);
      } else {
        // tx is an error object (failure)
        setFailed(true);
        setError(tx.error || tx);
      }
    } catch (error: any) {
      console.error("Transaction error:", error);
      setError(error?.message || "Transaction failed");

      setTxError({
        message: error.message || "Transaction failed",
        type: "UNKNOWN_ERROR",
      });
      setFailed(!failed);
    } finally {
      setLoading(false);
    }
  };

  const handleOffRampSubmit = async (e: any) => {
    e.preventDefault();

    setGhanaLoading(true);
    setGhanaBtnText("Please wait...");
    const data = await katonipayApi({
      phoneNumber: offRampForm.finalPhone,
      accountName: offRampForm.finalPhone,
      networkProvider: "AIRTEL",
      currency: "GHS",
      cryptoAmount: parseFloat(offRampForm.amount),
      senderAddress: userAuth?.walletAddress,
    });
    console.log(data);
    if (data?.status == "success") {
      let escrowAddress = data?.data?.data?.escrowAddress;
      console.log("offRampForm escrowAddress-->", escrowAddress);
      setGhanaBtnText("Sending USDC...");
      let result = await handleSend(
        escrowAddress,
        parseFloat(offRampForm.amount)
      );
      setGhanaLoading(false);
      // escrowAddress
    } else {
      setGhanaLoading(false);
      setError(
        data?.error?.message || "Something went wrong, please try again."
      );
    }

    // const fonbnkUrl = `${process.env.NEXT_PUBLIC_FONBNK_OFFRAMP_URL}&source=${process.env.NEXT_PUBLIC_FONBNK_OFFRAMP_SOURCE}&amount=${offRampForm.amount}&asset=${offRampForm.currency}`;

    // window.open(fonbnkUrl, "_blank");
  };

  const tabData = [
    {
      title: "Kenya",
      component: (
        <>
          <div className="px-3">
            <div className="bg-black/50 mx-auto max-w-[500px] rounded-xl p-5 lg:p-8">
              <div className="top pb-3">
                <h4 className="m-0 font-bold text-2xl">Receive</h4>
              </div>
              <form onSubmit={handleOnRampSubmit}>
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-12">
                    <label
                      htmlFor="amount"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Enter Amount
                    </label>
                    <input
                      id="amount"
                      placeholder="0.00"
                      type="text"
                      value={onRampForm.amount}
                      onChange={handleOnRampChange}
                      className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                    />
                  </div>
                  <div className="col-span-12">
                    <label
                      htmlFor="phoneNumber"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Enter Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none">
                        +254
                      </span>
                      <input
                        id="phoneNumber"
                        placeholder="712345678"
                        type="text"
                        value={onRampForm.phoneNumber}
                        onChange={handleOnRampChange}
                        className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx pl-14 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                      />
                    </div>
                  </div>
                  <div className="col-span-12">
                    <label
                      htmlFor="currency"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Select Currency
                    </label>
                    <select
                      id="currency"
                      value={onRampForm.currency}
                      onChange={handleOnRampChange}
                      className="border-white/10 border bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                    >
                      {currencyOptions.map((option) => (
                        <option
                          className="text-black"
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <label className="from-label pl-3 text-xs m-0 font-medium">
                      Balance:{" "}
                      {Number(balance) < 0.01
                        ? "0"
                        : Number.parseFloat(balance).toFixed(2)}{" "}
                      USDC
                    </label>
                  </div>
                  <div className="col-span-12 mt-3">
                    <button
                      type="submit"
                      disabled={!onRampForm.amount || loading || error}
                      className={`flex btn font-medium rounded-full items-center justify-center commonBtn w-full ${
                        !onRampForm.amount
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {loading ? kenyaBtnText : "Submit"}
                    </button>
                    {error && (
                      <label className="from-label text-red-500 pl-3 text-xs m-0 font-medium">
                        {error}
                      </label>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Ghana",
      component: (
        <>
          <div className="px-3">
            <div className="bg-black/50 mx-auto max-w-[500px] rounded-xl p-5 lg:p-8">
              <div className="top pb-3">
                <h4 className="m-0 font-bold text-2xl">Send</h4>
              </div>
              <form onSubmit={handleOffRampSubmit}>
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-12">
                    <label
                      htmlFor="amount"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Enter Amount
                    </label>
                    <input
                      id="amount"
                      placeholder="0.00"
                      type="text"
                      value={offRampForm.amount}
                      onChange={handleOffRampChange}
                      className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                    />
                  </div>
                  <div className="col-span-12">
                    <label
                      htmlFor="phoneNumber"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Enter Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none">
                        +233
                      </span>
                      <input
                        id="phoneNumber"
                        placeholder="712345678"
                        type="text"
                        value={offRampForm.phoneNumber}
                        onChange={handleOffRampChange}
                        className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx pl-14 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                      />
                    </div>
                  </div>
                  <div className="col-span-12">
                    <label
                      htmlFor="currency"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Currency
                    </label>
                    <input
                      id="currency"
                      type="text"
                      value="USDC"
                      disabled
                      className="border-white/10 border bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full"
                    />
                    <label className="from-label pl-3 text-xs m-0 font-medium">
                      Balance:{" "}
                      {Number(balance) < 0.01
                        ? "0"
                        : Number.parseFloat(balance).toFixed(2)}{" "}
                      USDC
                    </label>
                  </div>
                  <div className="col-span-12 mt-3">
                    <button
                      type="submit"
                      disabled={!offRampForm.amount || ghanaLoading || error}
                      className={`flex btn font-medium rounded-full items-center justify-center commonBtn w-full ${
                        !offRampForm.amount
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {ghanaLoading ? ghanaBtnText : "Submit"}
                    </button>
                    {error && (
                      <label className="from-label text-red-500 pl-3 text-xs m-0 font-medium">
                        {error}
                      </label>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      {failed &&
        createPortal(
          <TransactionFailedPop
            failed={failed}
            symbol={""}
            hash={""}
            setFailed={setFailed}
            txError={txError?.details?.shortMessage}
          />,
          document.body
        )}
      {success &&
        createPortal(
          <SuccessPop success={success} setSuccess={setSuccess} />,
          document.body
        )}
      <section className="ifrmae   relative h-full flex items-center py-[30px] sm:flex-row flex-col">
        <div className="absolute inset-0 backdrop-blur-xl h-full"></div>

        <div className="px-3 mx-auto relative w-full sm:min-w-[500px] sm:max-w-[max-content]">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <header className="siteHeader top-0 py-2 w-full z-[999]">
            <div className="container mx-auto">
              <Nav className=" px-3 py-3 rounded-[20px] shadow relative flex items-center justify-between flex-wrap gap-2">
                <div className="left w-full text-center">
                  <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                    Mobile Money
                  </h4>
                </div>
                <div className="right w-full">
                  <ul className="list-none pl-0 mb-0 flex items-center gap-3 ">
                    {tabData.map((item, index) => (
                      <li key={index} className="w-full">
                        <button
                          className={` ${
                            activeTab === index
                              ? "bg-[#ffad84] border-[#ffad84]"
                              : "bg-white border-white"
                          } flex w-full h-[30px]  border-2 text-[10px] sm:h-[40px] sm:text-[12px] items-center rounded-full  px-3 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          onClick={() => {
                            setError("");
                            setActiveTab(index);
                          }}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Nav>
            </div>
          </header>
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="flex h-full flex-col justify-center">
              <div className="grid gap-3 grid-cols-12">
                <div className="col-span-12">
                  <div className="tabContent py-5">
                    <div className="">{tabData[activeTab].component}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const Nav = styled.nav`
  // background: var(--cardBg);
  background: #5c2a28a3;
  backdrop-filter: blur(12.8px);
`;

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
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);
