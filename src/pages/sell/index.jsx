import { useRouter } from "next/router";
import React from "react";
import Swap from "../swap";
const SellPage = () => {
  const router = useRouter();
  return (
    <>
      <section className="relative dashboard pt-12">
        <div className="container">
          <div
            className="pageCard relative pb-3 px-3 lg:p-6 lg:pt-0  mx-auto w-full fixed bg-[#000] contrast-more:bg-black  
           transition-[opacity,transform] ease-out 
          h-[calc(100dvh-var(--sheet-top))] max-w-[1320px] md:w-[calc(100vw-50px)] lg:h-[calc(100dvh-60px)] lg:w-[calc(100vw-120px)]"
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="border-0 p-0 absolute z-[99] top-2 right-2 opacity-40 hover:opacity-70"
              style={{ background: "transparent" }}
            >
              {closeIcn}
            </button>
            <div className="grid gap-3 grid-cols-12">
              <div className=" col-span-12 sticky top-0 z-10">
                <div className="sectionHeader bg-[#000] py-4 contrast-more:bg-black border-b border-gray-900">
                  <div className="d-flex align-items-center gap-3 pb-3">
                    <h4 className="m-0 text-24 font-bold -tracking-3 text-white/75 md:text-4xl flex-1 whitespace-nowrap capitalize leading-none">
                      Buy Bitcoin
                    </h4>
                  </div>
                </div>
              </div>
              <div className="my-2 col-span-12">
                <Swap />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SellPage;

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
