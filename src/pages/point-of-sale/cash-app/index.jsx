import React from "react";
import SideShiftWidget from "@/components/SideShift/SideShiftWidget";
import { useSelector } from "react-redux";


const CashApp = () => {
  const userAuth = useSelector((state) => state.Auth);

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
              <div className="col-span-12">
                <SideShiftWidget
                  // setPointSale={setPointSale}
                  onClick={() => setPointSale(false)}
                  // pointSale={pointSale}
                  parentAffiliateId={process.env.NEXT_PUBLIC_SIDE_SHIFT_PARENT_ID}
                  defaultDepositMethodId="btc"
                  defaultSettleMethodId="usdcarb"
                  theme="dark"
                  settleAddress={userAuth?.walletAddress}
                  buttonText="Cash App"
                  buttonColor="rgb(232, 90, 67)"
                  textColor="rgb(17, 11, 11)"
                  showProgrammatic={true}
                />

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CashApp;

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
