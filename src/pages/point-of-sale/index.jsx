import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useSelector } from "react-redux";
import { getProvider, getAccount } from "../../lib/zeroDevWallet";
import { fetchBalance } from "@/lib/utils";
import { initializeTBTC } from "../../lib/tbtcSdkInitializer";
import { splitAddress } from "../../utils/globals";
import { toast } from "react-toastify";
import { BackBtn } from "@/components/common";

const PointOfSale = () => {
  const userAuth = useSelector((state) => state.Auth);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [qrCode, setQRCode] = useState("");
  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });

  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [depositSetup, setDepositSetup] = useState("");
  const [depositFound, setDepositFound] = useState("");
  const [sendSdk, setSendSdk] = useState("");
  const [walletAddressDepo, setWalletAddressDepo] = useState("");

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

  const generateQRCode = async (text) => {
    try {
      const qr = await QRCode.toDataURL(text);
      console.log("qr-->", qr);
      setQRCode(qr);
    } catch (err) {
      console.error("QR Code generation failed:", err);
    }
  };
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
    generateQRCode("https://crypto.link.com/");
  }, []);

  const startReceive = async () => {
    try {
      console.log("receice");

      setLoading(true);
      setDepositSetup("");
      setDepositFound("");
      setStep(2);
      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        console.log("account---<", account);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          console.log("provider-->", provider);
          if (provider) {
            // kernelProvider, ethersProvider, signer
            const sdk = await initializeTBTC(provider.signer);
            console.log("sdk -->", sdk);
            if (sdk) {
              depo(sdk);
            }
          }
        }
      } else {
      }
    } catch (error) {
      console.log("error rec-->", error);
    }
  };

  const depo = async (tbtcSdk) => {
    const bitcoinRecoveryAddress = process.env.NEXT_PUBLIC_RECOVERY_ADDRESS; // Replace with a valid BTC address
    console.log("bitcoinRecoveryAddress00>", bitcoinRecoveryAddress);
    try {
      console.log(tbtcSdk.deposits.initiateDeposit);
      const deposit = await tbtcSdk.deposits.initiateDeposit(
        bitcoinRecoveryAddress
      );
      console.log("Deposit initiated:", deposit);
      setDepositSetup(deposit);
      // Step 5: Get the Bitcoin deposit address
      const bitcoinDepositAddress = await deposit.getBitcoinAddress();
      console.log("Bitcoin deposit address:", bitcoinDepositAddress);
      setWalletAddressDepo(bitcoinDepositAddress);
      await generateQRCode(bitcoinDepositAddress);
    } catch (error) {
      console.error("Error during deposit process:", error);
    }
  };

  const checkMint = async () => {
    try {
      mint(depositSetup);
    } catch (error) {
      console.log("error-->", error);
      setDisable(false);
    }
  };

  const mint = async (depo) => {
    try {
      console.log("mint-->", depo);
      setDisable(true);
      if (depo) {
        const fundingUTXOs = await depo.detectFunding();
        console.log("fundingUTXOs---->", fundingUTXOs);
        if (fundingUTXOs.length > 0) {
          const txHash = await depo.initiateMinting(fundingUTXOs[0]);
          console.log("txHash---->", txHash);
          setDepositFound(txHash);
          setDisable(false);
          setStep(3);
        } else {
          console.log("depo-->", depo);
          setDisable(false);
          toast.error("No Deposit Found!");
        }
      } else {
        setDisable(false);
        toast.error("No Deposit Found!");
      }
    } catch (error) {
      console.log("setSdkTbtc-->", error);
      setDisable(false);
      toast.error("No Deposit Found!");
    }
  };

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
                  <div className="flex align-items-center gap-2 pb-3">
                    {/* <BackBtn /> */}
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
                          {/* <Image
                            alt=""
                            src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                            height={10000}
                            width={10000}
                            className="max-w-full mx-auto w-auto"
                            style={{ height: 40 }}
                          /> */}
                          <Image
                            alt=""
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
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href="https://crypto.link.com/"
                              target="_blank"
                              className="themeClr font-medium pt-2"
                            >
                              https://crypto.link.com/
                            </Link>
                            <button
                              onClick={() =>
                                handleCopy("https://crypto.link.com/", "one")
                              }
                              className="border-0 p-0 bg-transparent mt-1"
                            >
                              {copyIcn}
                            </button>
                          </div>
                        </div>
                        <div className="btnWrpper mt-10">
                          <button
                            onClick={startReceive}
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
                          {!walletAddressDepo ? (
                            <Image
                              alt=""
                              src={
                                process.env.NEXT_PUBLIC_IMAGE_URL +
                                "loading.gif"
                              }
                              height={10000}
                              width={10000}
                              className="max-w-full mx-auto w-auto"
                              style={{ height: 40 }}
                            />
                          ) : (
                            <Image
                              alt=""
                              src={qrCode}
                              height={10000}
                              width={10000}
                              className="max-w-full w-auto h-auto object-contain"
                            />
                          )}
                        </div>
                        {walletAddressDepo ? (
                          <div className="pt-2">
                            <p className="m-0 text-white text-xs">
                              Merchant Bitcoin Address
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <p className="m-0 themeClr font-medium pt-3">
                                {splitAddress(walletAddressDepo)}
                              </p>
                              <button
                                onClick={() =>
                                  handleCopy(walletAddressDepo, "two")
                                }
                                className="border-0 p-0 bg-transparent mt-1"
                              >
                                {copyIcn}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}

                        <div className="btnWrpper mt-10">
                          <button
                            disabled={disable}
                            onClick={checkMint}
                            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                          >
                            {disable ? "Checking..." : "Next"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : step == 3 ? (
                  <>
                    <div className="text-center p-3">
                      <div className="py-2 flex items-center justify-center">
                        {checkIcn}
                      </div>
                      <h2 className="m-0 text-green-500 text-base font-semibold">
                        Successfully
                      </h2>
                      <p className="m-0 py-1">
                        We have found deposit in generated address.
                      </p>
                      <div className="btnWrpper mt-3 flex items-center justify-center">
                        <Link
                          href="/btc-exchange"
                          style={{ width: "30%" }}
                          className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                        >
                          Check Approval status
                        </Link>
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
