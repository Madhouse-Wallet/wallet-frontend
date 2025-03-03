"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import p1 from "../../Assets/Images/user.png";
import Image from "next/image";
import styled from "styled-components";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import StripePaymentPage from "../stripePaymentPage";
import Swap from "../swap";
import { useTheme } from "@/ContextApi/ThemeContext";
import SwapKit from "./swapKit";
import { initializetbtc } from "../../lib/thresholdReceiveFunc";
import { useSelector } from "react-redux";
import { getAccount, getProvider } from "@/lib/zeroDevWallet";
import { BackBtn } from "@/components/common";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const BuyCoin: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const { theme, toggleTheme } = useTheme();
  const tabData = [
    { title: "Buy with USDC", component: <SwapKit /> },
    {
      title: "Buy with Debit/Credit Card",
      component: (
        <>
          <StripePaymentPage walletAddress={walletAddress} />
        </>
      ),
    },
  ];

  const router = useRouter();
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const userAuth = useSelector((state: any) => state.Auth);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   if (selectedPaymentMethod === "Card") {
  //     fetch("http://localhost:5000/create-payment-intent", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
  //     })
  //       .then((res) => res.json())
  //       .then((data) => setClientSecret(data.clientSecret));
  //   }
  // }, [selectedPaymentMethod]);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handlePaymentMethodChange = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const selectedMethod = (e.target as HTMLButtonElement).id;
    setSelectedPaymentMethod(selectedMethod);
    if (selectedMethod === "Card") {
      router.push("/stripePaymentPage"); // Navigate to Stripe payment page
    }
  };

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async () => {
    try {
      if (userAuth.passkeyCred) {
        let account = await getAccount(userAuth?.passkeyCred);
        console.log("account---<", account);
        if (account) {
          let provider = await getProvider(account.kernelClient);
          console.log("provider-->", provider);
          if (provider) {
            // kernelProvider, ethersProvider, signer
            const sdk = await initializetbtc(provider);
            console.log("sdk -->", sdk);
            if (sdk) {
              setWalletAddress(sdk.address!);
            }
          }
        }
      } else {
        // setBtcExchange(!btcExchange);
        // toast.error("Please Login First");
      }
    } catch (error) {
      console.log("error rec-->", error);
    }
  };
  return (
    <>
      <section className="relative dashboard pt-12">
        <div className="container relative">
          {/* <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[6px] right-[15px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button> */}
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12">
              <div className=" col-span-12  z-10">
                <div
                  className={`sectionHeader  px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
                >
                  <div className="flex align-items-center gap-3 pb-3">
                    <BackBtn />
                    <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Buy Bitcoin
                    </h4>
                  </div>
                  <ul className="list-none pl-0 mb-0 flex items-center gap-3 ">
                    {tabData.map((item, index) => (
                      <li key={index} className="py-1">
                        <button
                          className={` ${
                            activeTab === index
                              ? "bg-[#ffad84] border-[#ffad84]"
                              : "bg-white border-white"
                          }  flex w-full h-[42px]  border-2 text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50
             // Highlight active tab
              `}
                          onClick={() => setActiveTab(index)}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col-span-12">
                <div className="grid gap-3 md:gap-4 grid-cols-12">
                  <div className=" col-span-12">
                    <div className="tabContent">
                      <div className="">{tabData[activeTab].component}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="my-2 md:col-span-6 col-span-12">
                <RadioList
                  className="list-unstyled ps-0 mb-0"
                  style={{ fontSize: 12 }}
                >
                  <li className="my-3 relative">
                    <button
                      onClick={handlePaymentMethodChange}
                      id="Card"
                      className="form-label btn m-0 p-3 rounded w-100 flex align-items-center justify-content-center fw-sbold"
                    >
                      Credit/Debit Card
                    </button>
                  </li>
                </RadioList>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const CardCstm = styled.div`
  background-color: var(--cardBg);
  border: 1px solid #ff8735;
  font-size: 14px;
  line-height: 20px;
`;

const RadioList = styled.div`
  label {
    height: 50px;
    background-color: var(--cardBg2);
    border: 1px solid var(--cardBg2);
  }
  input:checked + label {
    background-color: var(--cardBg);
    border: 1px solid #ff8735;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #333;
`;

export default BuyCoin;

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
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
);

const shareIcn = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 12L14 5V9C7 10 4 15 3 20C5.5 16.5 9 14.9 14 14.9V19L21 12Z"
      fill="#ff8735"
    />
  </svg>
);

const redirectIcn = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.828 12L16.243 13.414L19.071 10.586C19.8212 9.83584 20.2426 8.81839 20.2426 7.7575C20.2426 6.69661 19.8212 5.67916 19.071 4.929C18.6996 4.55756 18.2586 4.26291 17.7733 4.06189C17.288 3.86086 16.7678 3.7574 16.2425 3.7574C15.1816 3.7574 14.1642 4.17883 13.414 4.929L10.586 7.757L12 9.172L14.828 6.343C15.2032 5.96785 15.712 5.75709 16.2425 5.75709C16.773 5.75709 17.2819 5.96785 17.657 6.343C18.0322 6.71815 18.2429 7.22696 18.2429 7.7575C18.2429 8.28804 18.0322 8.79685 17.657 9.172L14.828 12ZM12 14.829L13.414 16.243L10.586 19.071C9.83584 19.8212 8.8184 20.2426 7.7575 20.2426C6.69661 20.2426 5.67917 19.8212 4.929 19.071C4.17884 18.3208 3.7574 17.3034 3.7574 16.2425C3.7574 15.1816 4.17884 14.1642 4.929 13.414L7.757 10.586L9.172 12L6.343 14.829C5.96799 15.2041 5.75736 15.7129 5.75745 16.2434C5.75755 16.7738 5.96836 17.2825 6.3435 17.6575C6.71865 18.0325 7.22741 18.2431 7.75786 18.2431C8.2883 18.243 8.79699 18.0321 9.172 17.657L12 14.829Z"
      fill="#ff8735"
    />
    <path
      d="M14.829 10.586C15.0166 10.3984 15.1221 10.1439 15.1221 9.8785C15.1221 9.61314 15.0166 9.35864 14.829 9.171C14.6414 8.98336 14.3869 8.87794 14.1215 8.87794C13.8561 8.87794 13.6016 8.98336 13.414 9.171L9.172 13.414C9.07649 13.5062 9.00031 13.6166 8.9479 13.7386C8.89549 13.8606 8.86791 13.9918 8.86675 14.1246C8.8656 14.2574 8.8909 14.3891 8.94118 14.512C8.99146 14.6349 9.06571 14.7465 9.15961 14.8404C9.2535 14.9343 9.36515 15.0085 9.48805 15.0588C9.61094 15.1091 9.74262 15.1344 9.8754 15.1333C10.0082 15.1321 10.1394 15.1045 10.2614 15.0521C10.3834 14.9997 10.4938 14.9235 10.586 14.828L14.829 10.586Z"
      fill="#ff8735"
    />
  </svg>
);

const stripe = (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.374 9.66801H14.591L14.661 9.99901L14.912 9.81901C15.2008 9.64326 15.5373 9.56227 15.8745 9.58738C16.2116 9.61248 16.5324 9.74243 16.792 9.95901C17.227 10.339 17.509 10.865 17.586 11.437C17.7124 12.1116 17.6465 12.8081 17.396 13.447C17.293 13.7394 17.1137 13.999 16.8767 14.1989C16.6397 14.3988 16.3536 14.5318 16.048 14.584C15.6614 14.6597 15.2606 14.5804 14.932 14.363L14.782 14.273V15.83L13.394 16.122L13.374 9.66801ZM14.761 12.101V13.046C14.7598 13.0762 14.7655 13.1063 14.7776 13.1341C14.7897 13.1618 14.808 13.1864 14.831 13.206C14.9188 13.2825 15.0221 13.3393 15.1337 13.3725C15.2454 13.4056 15.3629 13.4145 15.4783 13.3984C15.5936 13.3823 15.7042 13.3416 15.8025 13.2791C15.9008 13.2165 15.9845 13.1337 16.048 13.036C16.2271 12.7323 16.3113 12.382 16.29 12.03C16.2935 11.7123 16.2023 11.4007 16.028 11.135C15.9671 11.0356 15.8849 10.951 15.7871 10.8874C15.6894 10.8238 15.5787 10.7829 15.4631 10.7676C15.3476 10.7522 15.23 10.7629 15.1191 10.7988C15.0082 10.8347 14.9067 10.8949 14.822 10.975C14.786 11.013 14.7647 11.0627 14.762 11.115C14.752 11.467 14.762 11.789 14.762 12.101M19.286 12.613C19.2874 12.7485 19.3232 12.8814 19.39 12.9993C19.4568 13.1172 19.5525 13.2162 19.668 13.287C19.957 13.442 20.29 13.495 20.613 13.437C20.979 13.417 21.338 13.325 21.668 13.167V14.141C21.6729 14.1792 21.6646 14.2179 21.6446 14.2507C21.6247 14.2836 21.5941 14.3087 21.558 14.322C21.0113 14.5738 20.4061 14.6714 19.808 14.604C19.3211 14.5544 18.8664 14.3378 18.521 13.991C18.2384 13.6882 18.0471 13.3117 17.969 12.905C17.7954 12.1651 17.8801 11.3881 18.209 10.703C18.3674 10.3425 18.6328 10.0394 18.9692 9.83478C19.3056 9.63017 19.6969 9.53395 20.0898 9.55917C20.4828 9.58438 20.8585 9.72981 21.166 9.97574C21.4735 10.2217 21.698 10.5562 21.809 10.934C21.927 11.257 21.992 11.596 22 11.94V12.623H19.286V12.613ZM20.693 11.608C20.7086 11.4604 20.6852 11.3112 20.6252 11.1754C20.5652 11.0396 20.4706 10.9219 20.351 10.834C20.2465 10.7604 20.1218 10.7209 19.994 10.7209C19.8662 10.7209 19.7415 10.7604 19.637 10.834C19.5125 10.9214 19.4128 11.0396 19.3476 11.177C19.2825 11.3144 19.254 11.4663 19.265 11.618L20.693 11.608ZM2.13401 12.985L2.38601 13.105C2.72601 13.271 3.09401 13.373 3.47201 13.408C3.62534 13.422 3.77934 13.422 3.93401 13.408C3.98942 13.3946 4.03987 13.3656 4.07949 13.3246C4.11911 13.2836 4.14626 13.2322 4.15779 13.1763C4.16931 13.1205 4.16474 13.0625 4.1446 13.0092C4.12445 12.9558 4.08957 12.9093 4.04401 12.875C3.94334 12.805 3.83634 12.7447 3.72301 12.694C3.40101 12.563 3.07901 12.452 2.71801 12.302C2.52359 12.1961 2.35758 12.0449 2.23405 11.8611C2.11051 11.6774 2.0331 11.4666 2.00837 11.2466C1.98364 11.0266 2.01233 10.8039 2.09199 10.5973C2.17166 10.3907 2.29995 10.2064 2.46601 10.06C2.82069 9.76937 3.26447 9.60944 3.72301 9.60701C4.21201 9.57701 4.70101 9.64801 5.16101 9.81801C5.1894 9.82511 5.21423 9.84234 5.2308 9.86647C5.24738 9.8906 5.25456 9.91995 5.25101 9.94901V11.125C5.03001 11.055 4.81901 10.955 4.59801 10.905C4.37601 10.854 4.06501 10.834 3.80301 10.804C3.73058 10.7877 3.65543 10.7877 3.58301 10.804C3.53643 10.8168 3.49454 10.8428 3.46235 10.8788C3.43017 10.9148 3.40906 10.9594 3.40157 11.0071C3.39407 11.0548 3.4005 11.1037 3.42009 11.1478C3.43968 11.192 3.4716 11.2295 3.51201 11.256C3.61934 11.328 3.73334 11.3883 3.85401 11.437C4.19534 11.5503 4.53034 11.681 4.85901 11.829C5.11788 11.9544 5.32653 12.1639 5.45079 12.4234C5.57505 12.6828 5.60756 12.9767 5.54301 13.257C5.50466 13.565 5.36714 13.8522 5.1512 14.0752C4.93526 14.2981 4.65264 14.4448 4.34601 14.493C3.62001 14.664 2.85701 14.593 2.17501 14.293C2.15873 14.286 2.1446 14.2749 2.13405 14.2606C2.12351 14.2464 2.11694 14.2296 2.11501 14.212V13.005C2.12069 12.9974 2.12643 12.9907 2.13401 12.985ZM5.85401 8.76301L7.20101 8.47101V9.66801H8.20701V10.844H7.20001V12.854C7.19413 12.9369 7.20808 13.02 7.2407 13.0964C7.27332 13.1728 7.32368 13.2403 7.38761 13.2934C7.45153 13.3465 7.52718 13.3836 7.60828 13.4016C7.68939 13.4196 7.77363 13.418 7.85401 13.397C7.98601 13.3837 8.11667 13.3603 8.24601 13.327V14.342C8.24601 14.412 8.24601 14.453 8.16601 14.473C7.69593 14.6489 7.17809 14.6489 6.70801 14.473C6.46713 14.3851 6.25706 14.229 6.10345 14.0238C5.94984 13.8185 5.85934 13.5729 5.84301 13.317C5.83782 13.2501 5.83782 13.1829 5.84301 13.116V8.76301H5.85401ZM8.70001 9.67801H9.79501C9.87501 9.67801 9.89501 9.67801 9.90501 9.76801C9.92301 9.87001 9.94667 9.97067 9.97601 10.07L10.016 9.97001C10.132 9.82184 10.2905 9.71259 10.4703 9.65684C10.65 9.60109 10.8425 9.6015 11.022 9.65801V10.904C10.8678 10.8951 10.7132 10.8951 10.559 10.904C10.4429 10.9155 10.3301 10.9495 10.227 11.004C10.1443 11.0406 10.0748 11.1018 10.0281 11.1793C9.9814 11.2568 9.95972 11.3468 9.96601 11.437V14.503H8.69901L8.70001 9.67801ZM11.474 9.67801H12.851V14.513H11.474V9.67801ZM11.464 9.25501V8.25001C11.464 8.19001 11.464 8.16001 11.534 8.15001L12.821 7.87801V8.96401L11.464 9.25501Z"
      fill="currentColor"
    />
  </svg>
);

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
