import { useTheme } from "@/ContextApi/ThemeContext";
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

const BlogCard = ({ classN }) => {
  const { theme, toggleTheme } = useTheme();

  const data = [
    { head: "Total Deposit", value: "$234234" },
    { head: "BTC Balance", value: "$234234" },
    { head: "USD Balance", value: "$234234" },
    { head: "Loan Health", value: "$234234" },
  ];
  return (
    <>
      {data?.map((item, index) => (
        <CardWrpper key={index} className={`${classN} `}>
          <CardCstm style={{ opacity: 1, transform: "none" }}>
            <div className="flex w-full flex-col items-center justify-between">
              <button
                className={`${
                  theme == "dark"
                    ? "bg-white/5"
                    : theme == "light"
                    ? "bg-[#fff3ed] border border-[#ffad84] shadow-[inset_12.7px_-12.7px_12.7px_rgba(161,70,25,0.1),inset_-12.7px_12.7px_12.7px_rgba(255,255,255,0.1)] backdrop-blur-[12.7px]"
                    : ""
                } rounded-12 relative overflow-hidden  px-3 py-4 max-lg:min-h-[95px] w-full lg:p-6 flex flex-col gap-3`}
              >
                <span className="chartSvg absolute top-0 left-0 h-full w-full">
                  {chartSvg}
                </span>
                <div className="flex flex-col gap-1 tabular-nums md:gap-2">
                  <div className="text-11 md:text-13 leading-snug font-semibold -tracking-2 truncate opacity-50">
                    {item.head}
                  </div>
                  <div className="flex min-w-0 items-end gap-1 text-12 font-semibold leading-none -tracking-3 opacity-80 md:text-24 text-base">
                    <span className="min-w-0 truncate">{item.value}</span>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="text-11 md:text-13 leading-snug font-semibold -tracking-2 truncate opacity-50">
                  +20.1% from last month
                </div>
                <div
                  aria-valuemax={100}
                  aria-valuemin={0}
                  role="progressbar"
                  data-state="indeterminate"
                  data-max={100}
                  className={`${
                    theme == "dark"
                      ? "bg-white/10"
                      : theme == "light"
                      ? " bg-[#fff]"
                      : ""
                  } relative w-full overflow-hidden rounded-full h-1.5`}
                >
                  <div
                    data-state="indeterminate"
                    data-max={100}
                    className={`${
                      theme == "dark" ? "bg-white" : "bg-[#ffad84]"
                    } h-full w-full flex-1 transition-all duration-700 rounded-full `}
                    style={{ transform: "translateX(-55%)" }}
                  />
                </div>
              </button>
            </div>
          </CardCstm>
        </CardWrpper>
      ))}
    </>
  );
};
const slideLoop = keyframes`
  0% {
    transform: translateX(100%);
    ${"" /* opacity: 0; */}
  }
  20% {
    ${"" /* opacity: 1; */}
    transform: translateX(80%);

  }
  40% {
    transform: translateX(60%);
  }
  60% {
    transform: translateX(40%);
  }
  80% {
    transform: translateX(20%);
  }
  100% {
    transform: translateX(0%);
  }
`;

const CardWrpper = styled.div`
  .chartSvg {
    width: 100%;
    animation: ${slideLoop} 20s;
  }
  &:nth-child(2) {
    .chartSvg {
      animation-delay: 5s;
    }
  }
  &:nth-child(3) {
    .chartSvg {
      animation-delay: 4s;
    }
  }
  &:nth-child(4) {
    .chartSvg {
      animation-delay: 6s;
    }
  }
`;

const CardCstm = styled.div``;

export default BlogCard;

const chartSvg = (
  <svg
    classname="w-full h-full recharts-surface"
    width={267}
    height={149}
    viewBox="0 0 267 149"
    style={{ width: "100%", height: "100%" }}
  >
    <title />
    <desc />
    <defs>
      <clipPath id="recharts2-clip">
        <rect x={0} y={0} height={149} width={267} />
      </clipPath>
    </defs>
    <defs>
      <linearGradient id="CPUGradientChartColor" x1={0} y1={0} x2={0} y2={1}>
        <stop offset="5%" style={{ stopColor: "rgba(255, 255, 255, 0.05)" }} />
        <stop offset="95%" style={{ stopColor: "rgba(255, 255, 255, 0)" }} />
      </linearGradient>
    </defs>
    <g className="recharts-layer recharts-area">
      <g className="recharts-layer">
        <path
          fillOpacity={1}
          fill="url(#CPUGradientChartColor)"
          width={267}
          height={149}
          stroke="none"
          className="recharts-curve recharts-area-area"
          d="M0,109.44C3.069,124.247,6.138,139.054,9.207,139.054C12.276,139.054,15.345,111.75,18.414,111.75C21.483,111.75,24.552,127.054,27.621,131.604C30.69,136.155,33.759,139.054,36.828,139.054C39.897,139.054,42.966,135.652,46.034,135.031C49.103,134.41,52.172,134.721,55.241,134.1C58.31,133.479,61.379,114.134,64.448,114.134C67.517,114.134,70.586,124.142,73.655,126.65C76.724,129.158,79.793,130.412,82.862,130.412C85.931,130.412,89,121.1,92.069,121.1C95.138,121.1,98.207,141.55,101.276,141.55C104.345,141.55,107.414,135.962,110.483,134.1C113.552,132.238,116.621,131.908,119.69,130.375C122.759,128.842,125.828,124.899,128.897,124.899C131.966,124.899,135.034,134.1,138.103,134.1C141.172,134.1,144.241,133.343,147.31,132.722C150.379,132.101,153.448,130.375,156.517,130.375C159.586,130.375,162.655,131.275,165.724,132.722C168.793,134.168,171.862,139.054,174.931,139.054C178,139.054,181.069,124.483,184.138,119.163C187.207,113.842,190.276,107.131,193.345,107.131C196.414,107.131,199.483,139.054,202.552,139.054C205.621,139.054,208.69,137.403,211.759,134.1C214.828,130.797,217.897,116.704,220.966,116.704C224.034,116.704,227.103,129.258,230.172,129.258C233.241,129.258,236.31,129.146,239.379,129.146C242.448,129.146,245.517,135.031,248.586,135.031C251.655,135.031,254.724,134.721,257.793,134.1C260.862,133.479,263.931,131.312,267,129.146L267,149C263.931,149,260.862,149,257.793,149C254.724,149,251.655,149,248.586,149C245.517,149,242.448,149,239.379,149C236.31,149,233.241,149,230.172,149C227.103,149,224.034,149,220.966,149C217.897,149,214.828,149,211.759,149C208.69,149,205.621,149,202.552,149C199.483,149,196.414,149,193.345,149C190.276,149,187.207,149,184.138,149C181.069,149,178,149,174.931,149C171.862,149,168.793,149,165.724,149C162.655,149,159.586,149,156.517,149C153.448,149,150.379,149,147.31,149C144.241,149,141.172,149,138.103,149C135.034,149,131.966,149,128.897,149C125.828,149,122.759,149,119.69,149C116.621,149,113.552,149,110.483,149C107.414,149,104.345,149,101.276,149C98.207,149,95.138,149,92.069,149C89,149,85.931,149,82.862,149C79.793,149,76.724,149,73.655,149C70.586,149,67.517,149,64.448,149C61.379,149,58.31,149,55.241,149C52.172,149,49.103,149,46.034,149C42.966,149,39.897,149,36.828,149C33.759,149,30.69,149,27.621,149C24.552,149,21.483,149,18.414,149C15.345,149,12.276,149,9.207,149C6.138,149,3.069,149,0,149Z"
          style={{ stroke: "rgba(255, 255, 255, 0.05)" }}
        />
        <path
          fillOpacity={1}
          fill="none"
          stroke="#3182bd"
          width={267}
          height={149}
          className="recharts-curve recharts-area-curve"
          d="M0,109.44C3.069,124.247,6.138,139.054,9.207,139.054C12.276,139.054,15.345,111.75,18.414,111.75C21.483,111.75,24.552,127.054,27.621,131.604C30.69,136.155,33.759,139.054,36.828,139.054C39.897,139.054,42.966,135.652,46.034,135.031C49.103,134.41,52.172,134.721,55.241,134.1C58.31,133.479,61.379,114.134,64.448,114.134C67.517,114.134,70.586,124.142,73.655,126.65C76.724,129.158,79.793,130.412,82.862,130.412C85.931,130.412,89,121.1,92.069,121.1C95.138,121.1,98.207,141.55,101.276,141.55C104.345,141.55,107.414,135.962,110.483,134.1C113.552,132.238,116.621,131.908,119.69,130.375C122.759,128.842,125.828,124.899,128.897,124.899C131.966,124.899,135.034,134.1,138.103,134.1C141.172,134.1,144.241,133.343,147.31,132.722C150.379,132.101,153.448,130.375,156.517,130.375C159.586,130.375,162.655,131.275,165.724,132.722C168.793,134.168,171.862,139.054,174.931,139.054C178,139.054,181.069,124.483,184.138,119.163C187.207,113.842,190.276,107.131,193.345,107.131C196.414,107.131,199.483,139.054,202.552,139.054C205.621,139.054,208.69,137.403,211.759,134.1C214.828,130.797,217.897,116.704,220.966,116.704C224.034,116.704,227.103,129.258,230.172,129.258C233.241,129.258,236.31,129.146,239.379,129.146C242.448,129.146,245.517,135.031,248.586,135.031C251.655,135.031,254.724,134.721,257.793,134.1C260.862,133.479,263.931,131.312,267,129.146"
          style={{ stroke: "rgba(255, 255, 255, 0.05)" }}
        />
      </g>
    </g>
  </svg>
);
