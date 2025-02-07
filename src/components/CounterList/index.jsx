import React, { useState } from "react";
import Slider from "react-slick";
import styled from "styled-components";
import bg from "@/Assets/Images/cardBg.png";
import Image from "next/image";
import { createPortal } from "react-dom";
import LiveBlogPopup from "@/components/Modals/LiveblogPop";
import { useTheme } from "@/ContextApi/ThemeContext";

const CounterList = ({ data }) => {
  const [liveBlog, setLiveBlog] = useState();
  const { theme, toggleTheme } = useTheme();
  console.log(theme, "themeCheck");

  return (
    <>
      {liveBlog &&
        createPortal(
          <LiveBlogPopup liveBlog={liveBlog} setLiveBlog={setLiveBlog} />,
          document.body
        )}
      <div className="grid gap-4 grid-cols-12 w-full">
        {/* <SliderWrpper className="col-span-12">
          <Slider {...settings}> */}
        {data &&
          data.length > 0 &&
          data.map((item, key) => (
            <div key={key} className="col-span-6 lg:col-span-3 md:col-span-4 ">
              <CardCstm
                // onClick={() => setLiveBlog(!liveBlog)}
                style={{ opacity: 1, transform: "none" }}
              >
                <div className="flex w-full flex-col items-center justify-between ">
                  <button
                    className={` bg-neutral-900/70 shadow-widget
                  backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-[1.25] contrast-more:backdrop-blur-none contrast-more:bg-neutral-900 backdrop-saturate-[300%]  ring-white/25 transition-[transform,box-shadow] rounded-12 w-full md:rounded-20 shrink-0 flex flex-col gap-2 text-left  duration-300 hover:scale-105   cursor-pointer  focus:outline-none focus-visible:ring-6 active:scale-95 p-2 md:p-5`}
                  >
                    <div className="flex flex-col gap-1 tabular-nums md:gap-2">
                      <div className="text-11 md:text-13 leading-snug font-semibold -tracking-2 truncate opacity-50">
                        {item.head}
                      </div>
                      <div className="flex min-w-0 items-end gap-1 text-12 font-semibold leading-none -tracking-3 opacity-80 md:text-24 text-base">
                        <span className="min-w-0 truncate">{item.value}</span>
                        {/* <span className="min-w-0 flex-1 truncate text-13 font-bold opacity-[45%]">
                              / 983 GB
                            </span> */}
                      </div>
                    </div>
                    <div className="flex-1" />
                    {/* <div className="text-11 md:text-13 leading-snug font-semibold -tracking-2 truncate opacity-50">
                      +20.1% from last month
                    </div> */}
                    <div
                      aria-valuemax={100}
                      aria-valuemin={0}
                      role="progressbar"
                      data-state="indeterminate"
                      data-max={100}
                      className={`bg-white/10 relative w-full overflow-hidden rounded-full h-1.5`}
                    >
                      <div
                        data-state="indeterminate"
                        data-max={100}
                        className={`bg-white h-full w-full flex-1 transition-all duration-700 rounded-full `}
                        style={{ transform: "translateX(-55%)" }}
                      />
                    </div>
                  </button>
                  {/* <div className="desktop relative z-0 max-w-full truncate text-center text-13 leading-normal drop-shadow-desktop-label contrast-more:bg-black contrast-more:px-1">
                        Live Usage
                      </div> */}
                </div>
              </CardCstm>
            </div>
          ))}
        {/* </Slider>
        </SliderWrpper> */}
      </div>
    </>
  );
};

const CardCstm = styled.div`
  button {
  }
`;

export default CounterList;

const rightIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="27"
    height="26"
    fill="none"
    class=""
  >
    <g clip-path="url(#a)">
      <path
        fill="#fff"
        d="M14.75 12.98 9.47 7.7l1.508-1.508 6.789 6.788-6.789 6.788L9.47 18.26l5.28-5.28Z"
      ></path>
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M.7.18h25.6v25.6H.7z"></path>
      </clipPath>
    </defs>
  </svg>
);

const leftIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="27"
    height="26"
    fill="none"
    class="rotate-180"
  >
    <g clip-path="url(#a)">
      <path
        fill="#fff"
        d="M14.75 12.98 9.47 7.7l1.508-1.508 6.789 6.788-6.789 6.788L9.47 18.26l5.28-5.28Z"
      ></path>
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M.7.18h25.6v25.6H.7z"></path>
      </clipPath>
    </defs>
  </svg>
);
