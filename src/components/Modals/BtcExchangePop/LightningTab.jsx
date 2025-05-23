import Image from "next/image";
import React, { useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import QRCode from "qrcode";
import { receiveBtc } from "../../../lib/apiCall"
import { useSelector } from "react-redux";
const LightningTab = (walletAddress) => {
  const [step, setStep] = useState(1);
  const [qrCode, setQRCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(""); // State for amount
  const [error, setError] = useState("");
  const userAuth = useSelector((state) => state.Auth);


  const [invoice, setInvoice] = useState("");
  const handleCopy = async (address, type) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const generateQRCode = async (text) => {
    try {
      const qr = await QRCode.toDataURL(text);
      setQRCode(qr);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
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
    const result = await receiveBtc(
      Number(amount),
      userAuth?.email
    );
    // console.log("result--->", result)
    if (result.status === "error") {
      setError(result.error);
      setLoading(false);
      return;
    }
    setStep(2);
    generateQRCode(result?.data?.invoice);
    setInvoice(result?.data?.invoice);
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
              Enter BTC Amount
            </label>
            <input
              id="btcAmount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control text-[var(--textColor)] focus:text-[var(--textColor)] bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)] border-gray-600 text-xs font-medium"
            />
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
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
                disabled={loading}
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
            className="max-w-full mx-auto h-auto w-full mb-3"
            style={{ maxWidth: 200 }}
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
        </div>
      ) : null}
    </>
  );
};

export default LightningTab;
