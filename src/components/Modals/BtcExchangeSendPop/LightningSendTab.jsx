import Image from "next/image";
import React, { useEffect, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import QRCode from "qrcode";
import QRScannerModal from "../../Modals/SendUsdcPop/qRScannerModal";
import { sendBtc } from "../../../lib/apiCall";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import TransactionSuccessPop from "../TransactionSuccessPop";
import TransactionConfirmationPop from "../TransactionConfirmationPop";
import { createPortal } from "react-dom";
import { verifyUser } from "@/utils/webauthPrf";
import { getUser } from "@/lib/apiCall";
import TransactionFailedPop from "../TransactionFailedPop";

// Define the scan icon component

const LightningSendTab = () => {
  const [step, setStep] = useState(1);
  const [qrCode, setQRCode] = useState("");
  const [openCam, setOpenCam] = useState(false);
  const userAuth = useSelector((state) => state.Auth);
  const [trxnApproval, setTrxnApproval] = useState(false);
  const [success, setSuccess] = useState(false);
  const [totalSatBalance, setTotalSatBalance] = useState("0.0");

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(""); // State for invoice
  const [txError, setTxError] = useState("");
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState("");
  const [sendWalletAddress, setSendWalletAddress] = useState("");
  const [decodeData, setDecodeData] = useState(null); // Initialize as null instead of string
  const [btcAmount, setBtcAmount] = useState(0); // Add this missing state

  const handleCopy = async (address, type) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy text:", error);
      // toast.error("Failed to copy");
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

  const decodeInvoice = async (invoice) => {
    try {
      const response = await fetch("/api/decode-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: invoice,
          email: userAuth?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: "error",
          error: data.error || "Failed to decode invoice",
        };
      }

      return {
        status: "success",
        data: data?.invoiceData,
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

    if (!invoice.trim()) {
      setError("Please enter a valid invoice!");
      setLoading(false);
      return;
    }

    try {
      const decodeInvoiceResponse = await decodeInvoice(invoice);
      console.log("line-85", decodeInvoiceResponse);

      if (decodeInvoiceResponse.status === "success") {
        setDecodeData(decodeInvoiceResponse.data);
        // Extract amount from decoded data (convert from msat to sats)
        const amountInSats = decodeInvoiceResponse.data?.amount_msat
          ? Math.floor(decodeInvoiceResponse.data.amount_msat / 1000)
          : 0;
        setBtcAmount(amountInSats);
        setLoading(false);
        setTrxnApproval(true);
      } else {
        setError(decodeInvoiceResponse.error || "Failed to decode invoice");
        setLoading(false);
      }
    } catch (error) {
      setError("Failed to decode invoice");
      setLoading(false);
    }
  };

  const verifyingUser = async () => {
    setLoading(true);
    let data = JSON.parse(userAuth?.webauthKey);
    let userData = await verifyUser(data?.credentialIdEncrypt);
    if (
      userData.status === true &&
      userData.msg === "User verified successfully"
    ) {
      handleConfirm();
    } else {
      setLoading(false);
      setFailed(true);
      setTxError(userData?.msg || "Passkey Error");
    }
  };

  const handleConfirm = async () => {
    setError("");
    setLoading(true);

    if (!userAuth.email) {
      setError("Please Login!");
      setLoading(false);
      return;
    }

    try {
      const result = await sendBtc(invoice, userAuth.email);
      if (result.status === "failure") {
        setFailed(true);
        setTxError("Transaction failed");
        // setError(result.message);
        setLoading(false);
        setTrxnApproval(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setTrxnApproval(false);
        // Reset form
        setInvoice("");
        setDecodeData(null);
        setBtcAmount(0);
      }
    } catch (error) {
      setFailed(true);
      setTxError("Transaction failed");
      // setError("Transaction failed");
      setLoading(false);
      setTrxnApproval(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const userExist = await getUser(userAuth.email);

      const response = await fetch("/api/spend-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletId: userExist?.userId?.lnbitWalletId_3,
          // walletId: "ccd505c23ebf4a988b190e6aaefff7a5", i
        }),
      });

      const { status, data } = await response.json();

      if (status === "success") {
        if (data?.[0]?.balance != null) {
          const balanceSats = Number(data[0].balance); // e.g., 1997000 sats
          const balanceSatss = Math.floor(balanceSats / 1000);
          setTotalSatBalance(`${balanceSatss.toString()}`);
        } else {
          setTotalSatBalance(`0`);
        }
      } else {
        console.error("Failed to fetch lightning balance or empty balance.");
      }
    } catch (error) {
      console.error("Error fetching lightning balance:", error);
    }
  };

  useEffect(() => {
    if (userAuth?.email) {
      fetchBalance();
    }
  }, []);

  return (
    <>
      {step === 1 ? (
        <>
          {openCam ? (
            <>
              {createPortal(
                <QRScannerModal
                  setOpenCam={setOpenCam}
                  openCam={openCam}
                  onScan={(data) => {
                    // handleProccessAddressChange(data);
                    setInvoice(data);
                    setOpenCam(!openCam);
                  }}
                />,
                document.body
              )}
            </>
          ) : (
            <>
              <div className="py-2">
                <div className="flex items-center justify-between pb-1 px-3">
                  <label
                    htmlFor=""
                    className="form-label m-0 text-xs font-medium"
                  >
                    Enter Invoice
                  </label>
                  <span className="text-white opacity-60 text-xs">
                    Balance: {totalSatBalance} SATS
                  </span>
                </div>
                <div className="iconWithText relative">
                  <input
                    id="btcAmount"
                    type="text"
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                    placeholder="Enter Lightning invoice..."
                    className="border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11"
                  />
                  <button
                    onClick={() => {
                      setOpenCam(true);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-white/70 transition-colors"
                    type="button"
                  >
                    <ScanIcon />
                  </button>
                </div>
                {error && (
                  <div className="text-red-500 text-xs mt-1">{error}</div>
                )}
              </div>

              {/* Display decoded invoice info if available */}
              {decodeData && (
                <div className="py-2">
                  <div className="bg-white/5 rounded-lg p-3 text-xs">
                    <h4 className="text-white font-medium mb-2">
                      Invoice Details:
                    </h4>
                    {decodeData.amount_msat && (
                      <p className="text-white/70 mb-1">
                        Amount: {Math.floor(decodeData.amount_msat / 1000)} sats
                      </p>
                    )}
                    {decodeData.description && (
                      <p className="text-white/70 mb-1">
                        Description: {decodeData.description}
                      </p>
                    )}
                    {decodeData.num_satoshis && (
                      <p className="text-white/70">
                        Amount(in Sats): {decodeData.num_satoshis}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="py-2">
                <div className="btnWrpper">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                    type="button"
                    className="flex items-center justify-center btn commonBtn w-full"
                    disabled={loading || !invoice.trim()}
                  >
                    {loading ? (
                      <Image
                        src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                        alt={""}
                        height={40}
                        width={40}
                        className={"h-[20px] object-contain w-auto"}
                      />
                    ) : (
                      "Next"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      ) : step === 2 ? (
        <div className="py-2">
          <p className="m-0 text-xs text-center font-light text-gray-300 pb-4">
            Use this generated address to send BTC.
          </p>
          {qrCode && (
            <Image
              src={qrCode}
              height={200}
              width={200}
              className="max-w-full mx-auto h-auto w-full mb-3"
              style={{ maxWidth: 230 }}
              alt="QR Code"
            />
          )}
          <Tooltip id="my-tooltip" />
          <div className="flex max-w-full items-stretch rounded-4 border border-dashed border-white/5 bg-white/4 text-14 leading-none text-white/40 outline-none focus-visible:border-white/40">
            <input
              data-tooltip-id="my-tooltip"
              data-tooltip-content={sendWalletAddress || "address"}
              className="block min-w-0 flex-1 appearance-none truncate bg-transparent py-1.5 pl-2.5 font-mono outline-none"
              type="text"
              readOnly
              value={sendWalletAddress || "No address generated"}
            />
            <button
              onClick={() => handleCopy(sendWalletAddress, "one")}
              className="rounded-4 px-1.5 ring-inset transition-colors hover:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              data-state="closed"
              type="button"
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

      {trxnApproval &&
        createPortal(
          <TransactionConfirmationPop
            trxnApproval={trxnApproval}
            settrxnApproval={setTrxnApproval}
            amount={decodeData.num_satoshis}
            symbol={"SATS"}
            toAddress={invoice}
            fromAddress={userAuth?.walletAddress}
            handleSend={verifyingUser}
            loading={loading}
            description={decodeData}
          />,
          document.body
        )}

      {success &&
        createPortal(
          <TransactionSuccessPop
            success={success}
            setSuccess={setSuccess}
            symbol={"SATS"}
            hash={""}
          />,
          document.body
        )}

      {failed &&
        createPortal(
          <TransactionFailedPop
            failed={failed}
            setFailed={setFailed}
            txError={txError}
          />,
          document.body
        )}
    </>
  );
};

export default LightningSendTab;

const ScanIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 7V5C3 3.89543 3.89543 3 5 3H7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17 3H19C20.1046 3 21 3.89543 21 5V7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 17V19C21 20.1046 20.1046 21 19 21H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 21H5C3.89543 21 3 20.1046 3 19V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 8V16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
