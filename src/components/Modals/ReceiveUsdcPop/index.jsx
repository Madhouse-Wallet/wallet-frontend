import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { useSelector } from "react-redux";
import QRCode from "qrcode";

const ReceiveUSDCPop = ({ receiveUsdc, setReceiveUSDC }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [qrCode, setQRCode] = useState("");
  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });
  const handleReceiveUSDC = () => setReceiveUSDC(!receiveUsdc);
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

  useEffect(() => {
    if (userAuth?.walletAddress) {
      const generateQRCode = async () => {
        try {
          const qr = await QRCode.toDataURL(userAuth.walletAddress, {
            margin: 0.5,
            width: 512,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQRCode(qr);
        } catch (err) {
          console.error("QR Code generation failed:", err);
        }
      };

      generateQRCode();
    }
  }, [userAuth?.walletAddress]);

  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <buttonbuy
          onClick={handleReceiveUSDC}
          className="bg-black/50 h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </buttonbuy>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          {" "}
          <div className={`relative rounded`}>
            <div className="top pb-3">
              <h5 className="m-0 text-xl text-center font-bold">
                Receive USDC
              </h5>
            </div>
            <div className="modalBody">
              <div className="cardCstm text-center">
                <Image
                  alt=""
                  src={qrCode}
                  height={512}
                  width={512}
                  className="max-w-full md:h-[230px] md:w-auto w-full mx-auto h-auto w-auto"
                  // style={{ height: 230 }}
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="content mt-2" style={{ fontSize: 12 }}>
                  <div className="text-center py-5">
                    <h6 className="m-0 text-base pb-2">Your Wallet Address</h6>
                    <div className="flex max-w-full items-stretch rounded-4 border border-dashed border-white/5 bg-white/4 text-14 leading-none text-white/40 outline-none focus-visible:border-white/40">
                      <input
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content={userAuth?.walletAddress}
                        readOnly=""
                        disabled
                        className="block min-w-0 flex-1 appearance-none truncate bg-transparent py-1.5 pl-2.5 font-mono outline-none"
                        type="text"
                        defaultValue={
                          userAuth?.walletAddress || "Wallet Address"
                        }
                      />
                      <button
                        onClick={() =>
                          handleCopy(userAuth?.walletAddress, "one")
                        }
                        className="rounded-4 px-1.5 ring-inset transition-colors hover:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        data-state="closed"
                      >
                        {copyIcn}
                      </button>
                    </div>
                    {isCopied?.one && (
                      <span style={{ marginLeft: "10px", color: "green" }}>
                        Copied!
                      </span>
                    )}
                  </div>
                  <div
                    data-orientation="horizontal"
                    role="none"
                    className="shrink-0 from-transparent via-white/10 to-transparent h-[1px] w-full bg-gradient-to-r mb-5"
                  />
                </div>
              </div>
            </div>
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

export default ReceiveUSDCPop;

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
    width="18"
    height="18"
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
