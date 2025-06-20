import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import QRCode from "qrcode";
import { receiveBtc } from "../../../lib/apiCall";
import { useSelector } from "react-redux";
import { filterAmountInput, filterHexInput } from "@/utils/helper";
const LightningTab = (walletAddress) => {
  const [step, setStep] = useState(1);
  const [qrCode, setQRCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [memo, setMemo] = useState("");
  const [amount, setAmount] = useState(""); // State for amount
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });
  const userAuth = useSelector((state) => state.Auth);

  const [invoice, setInvoice] = useState("");
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (step !== 2 && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [step]);

  const handleCopy = async (address, type) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied((prev) => ({ ...prev, [type]: true }));
      setTimeout(
        () =>
          setIsCopied({
            one: false,
            two: false,
            three: false,
          }),
        2000
      ); // Reset the copied state after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const generateQRCode = async (text) => {
    try {
      const qr = await QRCode.toDataURL(text, {
        margin: 0.5,
      });
      setQRCode(qr);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const createSwap = async (amount, walletAddress) => {
    try {
      const response = await fetch("/api/swap/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceAmount: amount,
          destinationAddress:
            process.env.NEXT_PUBLIC_QUIENCY_BTC_WALLET_ADDRESS,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: "error",
          error: data.error || "Failed to create swap",
        };
      }

      return {
        status: "success",
        data: data.data,
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message || "Something went wrong",
      };
    }
  };

  const handleNext = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError("");
    setLoading(true);
    if (!userAuth.email) {
      setError("Please Login!");
      setLoading(false);
      return;
    }
    const result = await receiveBtc(Number(amount), userAuth?.email, memo);
    if (result.status === "error") {
      setError(result.error);
      setLoading(false);
      return;
    }
    setStep(2);
    generateQRCode(result?.data?.invoice);
    setInvoice(result?.data?.invoice);

    startPolling(userAuth?.email, result?.data?.checking_id);
  };

  const checkPaymentStatus = async (email, checkingId) => {
    try {
      const response = await fetch("/api/success-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          checkingId: checkingId,
        }),
      });

      const data = await response.json();

      if (response.ok && data?.data[0].status === "success") {
        // Payment successful, move to step 3
        setStep(3);
        // Clear the polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return true;
      } else {
        // Payment not yet successful, continue polling
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const startPolling = (email, checkingId) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Start polling every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      await checkPaymentStatus(email, checkingId);
    }, 7000);

    // Also check immediately
    // checkPaymentStatus(email, checkingId);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;

    // Filter input with 2 decimal places
    const filteredValue = filterAmountInput(value, 0);

    setAmount(filteredValue);

    // Validate amount
    if (filteredValue.trim() !== "") {
      if (
        Number.parseFloat(filteredValue) <= 0 ||
        !String(filteredValue || "").trim() ||
        isNaN(Number(filteredValue))
      ) {
        setError("Amount must be greater than 0");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  const handleMemoChange = (e) => {
    const value = e.target.value;

    // const filteredValue = value.replace(/[^0-9a-fA-Fx]/g, "");
    // Filter out invalid characters instead of blocking the entire input
    const filteredValue = filterHexInput(value, /[^a-zA-Z0-9 ]/g, 100);

    // Update the address value with filtered input
    setMemo(filteredValue);
  };

  return (
    <>
      {step == 1 ? (
        <>
          <div className="py-2">
            <label
              htmlFor="btcAmount"
              className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
            >
              Enter Sats Amount
            </label>
            <input
              id="btcAmount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="form-control text-[var(--textColor)] focus:text-[var(--textColor)] bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)] border-gray-600 text-xs font-medium"
            />
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          </div>
          <div className="py-2">
            <label
              htmlFor="btcAmount"
              className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
            >
              Enter Memo
            </label>
            <input
              id="btcAmount"
              type="text"
              value={memo}
              // onChange={(e) => setMemo(e.target.value)}
              onChange={handleMemoChange}
              className="form-control text-[var(--textColor)] focus:text-[var(--textColor)] bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)] border-gray-600 text-xs font-medium"
            />
          </div>
          <div className="py-2">
            <div className="btnWrpper">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                type="button"
                className="flex items-center justify-center btn commonBtn w-full"
                disabled={loading || error !== "" || !amount}
              >
                {loading ? "Processing..." : "Next"}
              </button>
            </div>
          </div>
        </>
      ) : step == 2 ? (
        <div className="py-2">
          <p className="m-0 text-xs text-center font-light text-gray-300 pb-4">
            Use this generated address to send Lightening BTC.
          </p>
          <Image
            src={qrCode}
            height={10000}
            width={10000}
            className="max-w-full md:h-[230px] md:w-auto w-full mx-auto h-auto w-auto"
            // style={{ height: 230 }}
            alt="QR Code"
          />
          <Tooltip id="my-tooltip" />
          <div className="flex max-w-full items-stretch rounded-4 border border-dashed border-white/5 bg-white/4 text-14 leading-none text-white/40 outline-none focus-visible:border-white/40">
            <input
              data-tooltip-id="my-tooltip"
              data-tooltip-content={invoice}
              className="block min-w-0 flex-1 appearance-none truncate bg-transparent py-1.5 pl-2.5 font-mono outline-none"
              type="text"
              defaultValue={"Address"}
              value={invoice}
            />
            <button
              onClick={() => handleCopy(invoice, "one")}
              className="rounded-4 px-1.5 ring-inset transition-colors hover:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              data-state="closed"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.60001 11.397C6.60001 8.671 6.60001 7.308 7.44301 6.461C8.28701 5.614 9.64401 5.614 12.36 5.614H15.24C17.955 5.614 19.313 5.614 20.156 6.461C21 7.308 21 8.671 21 11.397V16.217C21 18.943 21 20.306 20.156 21.153C19.313 22 17.955 22 15.24 22H12.36C9.64401 22 8.28701 22 7.44301 21.153C6.59901 20.306 6.60001 18.943 6.60001 16.217V11.397Z"
                  fill="currentColor"
                />
                <path
                  opacity="0.5"
                  d="M4.172 3.172C3 4.343 3 6.229 3 10V12C3 15.771 3 17.657 4.172 18.828C4.789 19.446 5.605 19.738 6.792 19.876C6.6 19.036 6.6 17.88 6.6 16.216V11.397C6.6 8.671 6.6 7.308 7.443 6.461C8.287 5.614 9.644 5.614 12.36 5.614H15.24C16.892 5.614 18.04 5.614 18.878 5.804C18.74 4.611 18.448 3.792 17.828 3.172C16.657 2 14.771 2 11 2C7.229 2 5.343 2 4.172 3.172Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          {isCopied?.one && (
            <span
              style={{ marginLeft: "10px", color: "green" }}
              className="block text-center"
            >
              Copied!
            </span>
          )}
        </div>
      ) : step == 3 ? (
        <div className="text-center">
          <span className="icn flex items-center justify-center pb-3">
            {tickIcn}
          </span>
          <h4 className="m-0 font-medium text-white text-2xl pb-2">
            🎉 Success!
          </h4>
          <p className="m-0 py-2">
            You've successfully Receive Sats. Thank you for using MadHouse
            Wallet!
          </p>
        </div>
      ) : null}
    </>
  );
};

export default LightningTab;

const tickIcn = (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="50"
      cy="50"
      r="48.5"
      fill="url(#paint0_linear_301_1302)"
      stroke="url(#paint1_linear_301_1302)"
      strokeWidth="3"
    />
    <g clip-path="url(#clip0_301_1302)">
      <path
        d="M36 50L46 60L66 40"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_301_1302"
        x1="50"
        y1="0"
        x2="50"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#11CF8B" />
        <stop offset="1" stopColor="#30EEA9" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_301_1302"
        x1="50"
        y1="0"
        x2="50"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7BF4C8" />
        <stop offset="1" stopColor="#56F1B9" />
      </linearGradient>
      <clipPath id="clip0_301_1302">
        <rect
          width="48"
          height="48"
          fill="white"
          transform="translate(26 26)"
        />
      </clipPath>
    </defs>
  </svg>
);
