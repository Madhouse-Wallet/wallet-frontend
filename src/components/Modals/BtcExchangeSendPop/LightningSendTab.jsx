import Image from "next/image";
import React, { useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import QRCode from "qrcode";
import QRScannerModal from "../../Modals/SendUsdcPop/qRScannerModal";
import { sendBtc } from "../../../lib/apiCall"
import { toast } from "react-toastify";
import { useSelector } from "react-redux";


const LightningSendTab = () => {
  const [step, setStep] = useState(1);
  const [qrCode, setQRCode] = useState("");
  const [openCam, setOpenCam] = useState(false);
  const userAuth = useSelector((state) => state.Auth);

  const [loading, setLoading] = useState(false);
  const [amount, setInvoice] = useState(""); // State for amount
  const [error, setError] = useState("");
  const [sendWalletAddress, setSendWalletAddress] = useState("");
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

  const createReverseSwap = async (invoice) => {
    try {
      const response = await fetch("/api/swap/reverseSwap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice }),
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
    setError("");
    setLoading(true);
    if (!userAuth.email) {
      setError("Please Login!");
      setLoading(false);
      return;
    }
    // const result = await createReverseSwap(amount);
    const result = await sendBtc(
      amount,
      userAuth.email
    );

    if (result.status === "failure") {
      setError(result.message);
      setLoading(false);
    } else {
      toast.success(result.message);
      setLoading(false);
    }
    // setStep(2);
    // generateQRCode(result?.data?.address);
    // setSendWalletAddress(result?.data?.address);
    // Use data.data.invoice for the Lightning invoice
  };

  return (
    <>

      {step == 1 ? (
        <>
          {openCam ? (
            <>
              <QRScannerModal
                setOpenCam={setOpenCam}
                openCam={openCam}
                onScan={(data) => {
                  setInvoice(data);
                  setOpenCam(!openCam);
                }}
              />
            </>
          ) : <>
            <div className="py-2">
              <label
                htmlFor="btcAmount"
                className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
              >
                Enter Invoice
              </label>
              <div className="iconWithText relative">
                <input
                  id="btcAmount"
                  type="text"
                  value={amount}
                  onChange={(e) => setInvoice(e.target.value)}
                  className={` border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx  px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300   focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                />
                <button
                  onClick={() => {
                    setOpenCam(!openCam);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                >
                  {scanIcn}
                </button>
              </div>
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
          </>}
        </>
      ) : step == 2 ? (
        <div className="py-2">
          <p className="m-0 text-xs text-center font-light text-gray-300 pb-4">
            Use this generated address to send BTC.
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
              data-tooltip-content={sendWalletAddress || "address"}
              className="block min-w-0 flex-1 appearance-none truncate bg-transparent py-1.5 pl-2.5 font-mono outline-none"
              type="text"
              defaultValue={"Address"}
              value={sendWalletAddress || "incoice"}
            />
            <button
              onClick={() => handleCopy(sendWalletAddress, "one")}
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

export default LightningSendTab;

const copyIcn = (
  <svg
    width="24"
    height="24"
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
