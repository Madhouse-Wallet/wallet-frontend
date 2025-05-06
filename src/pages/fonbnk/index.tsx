import { useRouter } from "next/router";
import IframeComponent from "./iframe";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@/ContextApi/ThemeContext";
import { BackBtn } from "@/components/common";

export default function Fonbnk() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const userAuth = useSelector((state: any) => state.Auth);
  const [activeTab, setActiveTab] = useState(0);

  // Form state for onramp
  const [onRampForm, setOnRampForm] = useState({
    amount: "",
    currency: "USDC", // Default to USDC
  });

  // Form state for offramp
  const [offRampForm, setOffRampForm] = useState({
    amount: "",
    currency: "USDC", // Offramp only uses USDC
  });

  // Currency options for the dropdown
  const currencyOptions = [
    { value: "usdc", label: "USDC" },
    { value: "airtime", label: "Airtime" },
  ];

  // Handle form changes for onramp
  const handleOnRampChange = (e: any) => {
    const { id, value } = e.target;
    setOnRampForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle form changes for offramp
  const handleOffRampChange = (e: any) => {
    const { id, value } = e.target;
    setOffRampForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle form submission for onramp
  const handleOnRampSubmit = (e: any) => {
    e.preventDefault();

    // Construct the Fonbnk URL with parameters
    const fonbnkUrl = `${process.env.NEXT_PUBLIC_FONBNK_ONRAMP_URL}&source=${process.env.NEXT_PUBLIC_FONBNK_ONRAMP_SOURCE}&address=${userAuth?.walletAddress}&amount=${onRampForm.amount}&currency=${onRampForm.currency}`;

    // Open in new tab
    window.open(fonbnkUrl, "_blank");
  };

  // Handle form submission for offramp
  const handleOffRampSubmit = (e: any) => {
    e.preventDefault();

    // Construct the Fonbnk URL with parameters
    const fonbnkUrl = `${process.env.NEXT_PUBLIC_FONBNK_OFFRAMP_URL}&source=${process.env.NEXT_PUBLIC_FONBNK_OFFRAMP_SOURCE}&amount=${offRampForm.amount}&asset=${offRampForm.currency}`;

    // Open in new tab
    window.open(fonbnkUrl, "_blank");
  };

  const tabData = [
    {
      title: "Onramp Fonbnk",
      component: (
        <>
          <div className="px-3">
            <div className="bg-black/50 mx-auto max-w-[500px] rounded-xl p-5 lg:p-8">
              <div className="top pb-3">
                <h4 className="m-0 font-bold text-2xl">Receive</h4>
              </div>
              <form onSubmit={handleOnRampSubmit}>
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-12">
                    <label
                      htmlFor="amount"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Enter Amount
                    </label>
                    <input
                      id="amount"
                      placeholder="0.00"
                      type="text"
                      value={onRampForm.amount}
                      onChange={handleOnRampChange}
                      className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                    />
                  </div>
                  <div className="col-span-12">
                    <label
                      htmlFor="currency"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Select Currency
                    </label>
                    <select
                      id="currency"
                      value={onRampForm.currency}
                      onChange={handleOnRampChange}
                      className="border-white/10 border bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full appearance-none"
                    >
                      {currencyOptions.map((option) => (
                        <option
                          className="text-black"
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 mt-3">
                    <button
                      type="submit"
                      disabled={!onRampForm.amount}
                      className={`flex btn font-medium rounded-full items-center justify-center commonBtn w-full ${
                        !onRampForm.amount
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Offramp Fonbnk",
      component: (
        <>
          <div className="px-3">
            <div className="bg-black/50 mx-auto max-w-[500px] rounded-xl p-5 lg:p-8">
              <div className="top pb-3">
                <h4 className="m-0 font-bold text-2xl">Send</h4>
              </div>
              <form onSubmit={handleOffRampSubmit}>
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-12">
                    <label
                      htmlFor="amount"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Enter Amount
                    </label>
                    <input
                      id="amount"
                      placeholder="0.00"
                      type="text"
                      value={offRampForm.amount}
                      onChange={handleOffRampChange}
                      className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11`}
                    />
                  </div>
                  <div className="col-span-12">
                    <label
                      htmlFor="currency"
                      className="from-label pl-3 text-xs m-0 font-medium"
                    >
                      Currency
                    </label>
                    <input
                      id="currency"
                      type="text"
                      value="USDC"
                      disabled
                      className="border-white/10 border bg-white/5 text-white/70 w-full px-5 py-2 text-xs font-medium h-12 rounded-full"
                    />
                  </div>
                  <div className="col-span-12 mt-3">
                    <button
                      type="submit"
                      disabled={!offRampForm.amount}
                      className={`flex btn font-medium rounded-full items-center justify-center commonBtn w-full ${
                        !offRampForm.amount
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      ),
    },
  ];

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };

  return (
    <section className="ifrmae pt-12 relative">
      <div className="container relative">
        <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
          <div className="grid gap-3 grid-cols-12">
            <div className=" col-span-12  z-10">
              <div
                className={`sectionHeader px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
              >
                <div className="flex align-items-center gap-3 pb-3">
                  <button
                    onClick={() => router.push("/")}
                    className="border-0 themeClr p-0"
                  >
                    {backIcn}
                  </button>
                  <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                    Fonbnk
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
                        }  flex w-full h-[42px]  border-2 text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1 text-black ring-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus-visible:ring-3 active:scale-100 active:bg-white/90 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
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
              <div className="tabContent">
                <div className="">{tabData[activeTab].component}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
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
