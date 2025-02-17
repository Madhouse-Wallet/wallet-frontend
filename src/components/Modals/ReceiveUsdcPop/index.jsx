import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTheme } from "@/ContextApi/ThemeContext";
import Image from "next/image";
import { useSelector } from "react-redux";
import QRCode from "qrcode";


// css

// img

const ReceiveUSDCPop = ({ receiveUsdc, setReceiveUSDC }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [qrCode, setQRCode] = useState("");

  const { theme, toggleTheme } = useTheme();
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
          const qr = await QRCode.toDataURL(userAuth.walletAddress);
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
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="m-0 text-xl text-center font-bold">
                Receive USDC
              </h5>
              {/* <p className="m-0" style={{ fontSize: 12 }}>
              Generate a QR code or wallet address to receive Bitcoin Securely
            </p> */}
            </div>
            <div className="modalBody">
              <div className="cardCstm text-center">
                {/* <p className="m-0 text-xs text-center font-light text-gray-300 pb-4">
                  Use this generated address to send minimum 0.01 BTC, to mint
                  as tBTC.
                </p> */}
                <Image
                  alt=""
                  src={qrCode}
                  height={10000}
                  width={10000}
                  className="max-w-full mx-auto h-auto w-auto"
                  style={{ height: 150 }}
                />
                {/* <div className="flex items-center justify-center">{qrCode}</div> */}
                <div className="content mt-2" style={{ fontSize: 12 }}>
                  <div className="text-center py-5">
                    <h6 className="m-0 text-base pb-2">Your Wallet Address</h6>
                    <div className="flex max-w-full items-stretch rounded-4 border border-dashed border-white/5 bg-white/4 text-14 leading-none text-white/40 outline-none focus-visible:border-white/40">
                      <input
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content={userAuth?.walletAddress}
                        readOnly=""
                        className="block min-w-0 flex-1 appearance-none truncate bg-transparent py-1.5 pl-2.5 font-mono outline-none"
                        type="text"
                        defaultValue={userAuth?.walletAddress || "Wallet Address"}
                      />
                      <button
                        onClick={() => handleCopy(userAuth?.walletAddress, "one")}
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

const sepoliaIcn = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1_9)">
      <path
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
        fill="#627EEA"
      />
      <path
        d="M8.24899 2V6.435L11.9975 8.11L8.24899 2Z"
        fill="white"
        fill-opacity="0.602"
      />
      <path d="M8.249 2L4.5 8.11L8.249 6.435V2Z" fill="white" />
      <path
        d="M8.24899 10.984V13.9975L12 8.808L8.24899 10.984Z"
        fill="white"
        fill-opacity="0.602"
      />
      <path d="M8.249 13.9975V10.9835L4.5 8.808L8.249 13.9975Z" fill="white" />
      <path
        d="M8.24899 10.2865L11.9975 8.11L8.24899 6.436V10.2865Z"
        fill="white"
        fill-opacity="0.2"
      />
      <path
        d="M4.5 8.11L8.249 10.2865V6.436L4.5 8.11Z"
        fill="white"
        fill-opacity="0.602"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_9">
        <rect width="16" height="16" fill="white" />
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

const qrCode = (
  <svg
    width="100"
    height="100"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13 14H14V15H13V14ZM14 15H15V16H14V15ZM14 16H15V17H14V16ZM16 16H17V17H16V16ZM16 17H17V18H16V17ZM13 16H14V17H13V16ZM15 16H16V17H15V16ZM15 17H16V18H15V17ZM18 16H19V17H18V16ZM18 15H19V16H18V15ZM19 14H20V15H19V14ZM17 16H18V17H17V16ZM17 17H18V18H17V17ZM16 18H17V19H16V18ZM15 18H16V19H15V18ZM17 18H18V19H17V18ZM18 18H19V19H18V18ZM16 19H17V20H16V19ZM14 19H15V20H14V19ZM15 19H16V20H15V19ZM13 19H14V20H13V19ZM13 20H14V21H13V20ZM14 21H15V22H14V21ZM15 21H16V22H15V21ZM17 21H18V22H17V21ZM18 21H19V22H18V21ZM17 19H18V20H17V19ZM18 19H19V20H18V19ZM19 18H20V19H19V18ZM19 17H20V18H19V17ZM19 20H20V21H19V20ZM19 19H20V20H19V19ZM20 18H21V19H20V18ZM20 17H21V18H20V17ZM21 20H22V21H21V20ZM21 18H22V19H21V18ZM21 19H22V20H21V19ZM19 16H20V17H19V16ZM13 17H14V18H13V17ZM12 17H13V18H12V17ZM12 18H13V19H12V18ZM14 18H15V19H14V18ZM11 18H12V19H11V18ZM13 18H14V19H13V18ZM11 19H12V20H11V19ZM11 20H12V21H11V20ZM11 1H12V2H11V1ZM12 2H13V3H12V2ZM11 4H12V5H11V4ZM12 5H13V6H12V5ZM11 6H12V7H11V6ZM12 6H13V7H12V6ZM12 7H13V8H12V7ZM12 8H13V9H12V8ZM11 9H12V10H11V9ZM12 9H13V10H12V9ZM11 10H12V11H11V10ZM1 11H2V12H1V11ZM2 12H3V13H2V12ZM4 11H5V12H4V11ZM4 12H5V13H4V12ZM5 11H6V12H5V11ZM6 12H7V13H6V12ZM7 11H8V12H7V11ZM8 12H9V13H8V12ZM8 11H9V12H8V11ZM9 11H10V12H9V11ZM10 11H11V12H10V11ZM11 12H12V13H11V12ZM13 12H14V13H13V12ZM14 11H15V12H14V11ZM15 11H16V12H15V11ZM16 11H17V12H16V11ZM15 13H16V14H15V13ZM13 22H14V23H13V22ZM12 22H13V23H12V22ZM12 13H13V14H12V13ZM11 13H12V14H11V13ZM11 14H12V15H11V14ZM11 15H12V16H11V15ZM22 14H23V15H22V14ZM21 15H22V16H21V15ZM22 17H23V18H22V17ZM17 13H18V14H17V13ZM18 12H19V13H18V12ZM22 12H23V13H22V12ZM22 13H23V14H22V13ZM21 13H22V14H21V13ZM22 21H23V22H22V21ZM21 22H22V23H21V22ZM19 22H20V23H19V22ZM22 22H23V23H22V22Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15 2H22V9H15V2ZM2 2H9V9H2V2ZM2 15H9V22H2V15ZM18 5H19V6H18V5ZM5 5H6V6H5V5ZM5 18H6V19H5V18Z"
      stroke="currentColor"
      stroke-width="2"
    />
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

const checkIcn = (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1_2)">
      <path
        d="M40 80C29.3913 80 19.2172 75.7857 11.7157 68.2843C4.21427 60.7828 0 50.6087 0 40C0 29.3913 4.21427 19.2172 11.7157 11.7157C19.2172 4.21427 29.3913 0 40 0C50.6087 0 60.7828 4.21427 68.2843 11.7157C75.7857 19.2172 80 29.3913 80 40C80 50.6087 75.7857 60.7828 68.2843 68.2843C60.7828 75.7857 50.6087 80 40 80ZM32 60L68 26L62 20L32 48L18 34L12 40L32 60Z"
        fill="#22C55E"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_2">
        <rect width="80" height="80" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
