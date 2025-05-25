import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useSelector } from "react-redux";
import { getProvider, getAccount } from "../../lib/zeroDev";
import { initializeTBTC } from "../../lib/tbtcSdkInitializer";
import { splitAddress } from "../../utils/globals";
import { toast } from "react-toastify";

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
      setLoading(true);
      setDepositSetup("");
      setDepositFound("");
      setStep(2);
      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          if (provider) {
            const sdk = await initializeTBTC(provider.signer);
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
    try {
      const deposit = await tbtcSdk.deposits.initiateDeposit(
        bitcoinRecoveryAddress
      );
      setDepositSetup(deposit);
      // Step 5: Get the Bitcoin deposit address
      const bitcoinDepositAddress = await deposit.getBitcoinAddress();
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
      setDisable(false);
    }
  };

  const mint = async (depo) => {
    try {
      setDisable(true);
      if (depo) {
        const fundingUTXOs = await depo.detectFunding();
        if (fundingUTXOs.length > 0) {
          const txHash = await depo.initiateMinting(fundingUTXOs[0]);
          setDepositFound(txHash);
          setDisable(false);
          setStep(3);
        } else {
          setDisable(false);
          toast.error("No Deposit Found!");
        }
      } else {
        setDisable(false);
        toast.error("No Deposit Found!");
      }
    } catch (error) {
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
                    <h4 className="m-0 text-[18px] sm:text-[20px] font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
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
