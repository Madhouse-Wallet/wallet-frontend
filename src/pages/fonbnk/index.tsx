import { useRouter } from "next/router";
import IframeComponent from "./iframe";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@/ContextApi/ThemeContext";

export default function Fonbnk() {
  const { theme, toggleTheme } = useTheme();

  const router = useRouter();
  const userAuth = useSelector((state: any) => state.Auth);

  const [activeTab, setActiveTab] = useState(0);

  const tabData = [
    {
      title: "Onramp Fonbnk",
      component: (
        <iframe
          height={650}
          // src="https://sandbox-pay.fonbnk.com/?source=x9REDkaz"
          src={`${process.env.NEXT_PUBLIC_FONBNK_ONRAMP_URL}/source=${process.env.NEXT_PUBLIC_FONBNK_ONRAMP_SOURCE}&address=${userAuth?.walletAddress}`}
          className="w-full  border-0 rounded"
          title="Fonbnk Payment"
          allow="payment"
        />
      ),
    },
    {
      title: "Onramp Fonbnk",
      component: (
        <>
          <iframe
            height={650}
            src={`${process.env.NEXT_PUBLIC_FONBNK_OFFRAMP_URL}/source=${process.env.NEXT_PUBLIC_FONBNK_OFFRAMP_SOURCE}`}
            className="w-full  border-0 rounded"
            title="Fonbnk Payment"
            allow="payment"
          />
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
      <div className="container">
        <div className="pageCard bg-white/5 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-2 right-2 opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <div className="grid gap-3 grid-cols-12">
            <div className=" col-span-12  z-10">
              <div
                className={` sectionHeader  px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
              >
                <div className="d-flex align-items-center gap-3 pb-3">
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
              {/* <IframeComponent /> */}
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
