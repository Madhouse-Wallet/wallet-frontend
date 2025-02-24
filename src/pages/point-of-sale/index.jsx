import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useSelector } from "react-redux";

const PointOfSale = () => {
  const userAuth = useSelector((state) => state.Auth);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [qrCode, setQRCode] = useState("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qr = await QRCode.toDataURL("https://crypto.link.com/");
        setQRCode(qr);
      } catch (err) {
        console.error("QR Code generation failed:", err);
      }
    };

    generateQRCode();
  }, []);

  return (
    <>
      <section className="relative dashboard pt-12">
        <div className="container relative">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12 lg:px-4 pt-3">
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div className="sectionHeader pb-3 border-b border-gray-900">
                  <div className="d-flex align-items-center gap-2 pb-3">
                    <h4 className="m-0 text-24 font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Point of Sale
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-span-12 p-2 px-3 px-lg-4 py-lg-3">
                {step == 1 ? (
                  <>
                    <div className="mx-auto max-w-[500px]  text-center bg-white/5 p-5 rounded-lg lg:p-10">
                      <div className="pb-4">
                        <h4 className="m-0 text-xl font-bold text-white">
                          Crypto Link Account
                        </h4>
                        <p className="m-0 text-white text-xs font-medium">
                          The customer should please scan the following to
                          access your account at crypto.link.com
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="qrCode inline-flex bg-white/5 rounded p-3 items-center justify-center">
                        <Image
                            src={qrCode}
                            height={10000}
                            width={10000}
                            className="max-w-full w-auto h-auto object-contain"
                          />
                        </div>
                        <div className="pt-2">
                          <p className="m-0 text-white text-xs">
                            Crypto Link Account
                          </p>
                          <Link
                            href="https://crypto.link.com/"
                            target="_blank"
                            className="themeClr font-medium pt-2"
                          >
                            https://crypto.link.com/
                          </Link>
                        </div>
                        <div className="btnWrpper mt-10">
                          <button
                            onClick={() => setStep(2)}
                            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : step == 2 ? (
                  <>
                    <div className="mx-auto max-w-[500px]  text-center bg-white/5 p-5 rounded-lg lg:p-10">
                      <div className="pb-4">
                        <h4 className="m-0 text-xl font-bold text-white">
                          Bitcoin Address
                        </h4>
                        <p className="m-0 text-white text-xs font-medium">
                          The customer should please scan the Merchant's Bitcoin
                          address to use below
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="qrCode inline-flex bg-white/5 rounded p-3 items-center justify-center">
                          <Image
                            src={qrCode}
                            height={10000}
                            width={10000}
                            className="max-w-full w-auto h-auto object-contain"
                          />
                        </div>
                        <div className="pt-2">
                          <p className="m-0 text-white text-xs">
                            Merchant Bitcoin Address
                          </p>
                          <p className="m-0 themeClr font-medium pt-3">
                            asdfawe5rq2w43rq234dfa
                          </p>
                        </div>

                        <div className="btnWrpper mt-10">
                          <button
                            onClick={() => setStep(2)}
                            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PointOfSale;

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);

const qrCode = (
  <svg
    width="150"
    height="150"
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
