import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTheme } from "@/ContextApi/ThemeContext";
import BlogCard from "@/components/BlogCard";
import { useSelector } from "react-redux";
import RecentTransaction from "./RecentTransaction";
// css

// img

const LiveBlogPopup = ({ liveBlog, setLiveBlog, data, transactions }) => {
  const userAuth = useSelector((state) => state.Auth);
  const { theme, toggleTheme } = useTheme();
  const handleLiveBlog = () => setLiveBlog(!liveBlog);
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <button
          onClick={handleLiveBlog}
          className="bg-black/50 h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </button>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          {" "}
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              {/* <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                Add Supply
              </h5> */}
            </div>
            <div className="modalBody">
              <div className="grid blogCard gap-3 grid-cols-12">
                <BlogCard classN={"col-span-6 md:col-span-4"} data={data} />
                <div className="col-span-12 mt-3">
                  {/* <div
                    className={` bg-white/5 divide-white/6 divide-y  rounded-12`}
                  >
                    <div className="flex items-center gap-2 p-3">
                      <img
                        src={umbrlIcn}
                        alt=""
                        className="aspect-square shrink-0 bg-cover bg-center rounded-5 shadow-md"
                        style={{
                          width: 25,
                          height: 25,
                          minWidth: 25,
                          minHeight: 25,
                        }}
                      />
                      <span className="flex-1 truncate text-15 font-medium -tracking-4 opacity-90">
                        System
                      </span>
                      <span className="text-15 font-normal uppercase tabular-nums -tracking-3">
                        386 GB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3">
                      <img
                        src="https://getumbrel.github.io/umbrel-apps-gallery/bitcoin/icon.svg"
                        alt=""
                        className="aspect-square shrink-0 bg-cover bg-center rounded-5 shadow-md"
                        style={{
                          width: 25,
                          height: 25,
                          minWidth: 25,
                          minHeight: 25,
                        }}
                      />
                      <span className="flex-1 truncate text-15 font-medium -tracking-4 opacity-90">
                        Bitcoin Node
                      </span>
                      <span className="text-15 font-normal uppercase tabular-nums -tracking-3">
                        95 GB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3">
                      <img
                        src={downloadApp}
                        alt=""
                        className="aspect-square shrink-0 bg-cover bg-center rounded-5 shadow-md"
                        style={{
                          width: 25,
                          height: 25,
                          minWidth: 25,
                          minHeight: 25,
                        }}
                      />
                      <span className="flex-1 truncate text-15 font-medium -tracking-4 opacity-90">
                        Downloads
                      </span>
                      <span className="text-15 font-normal uppercase tabular-nums -tracking-3">
                        0 B
                      </span>
                    </div>
                  </div> */}
                  <RecentTransaction transactions={transactions} data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const CardCstm = styled.div``;
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

const Modal = styled.div`
  padding-bottom: 100px;

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 900px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default LiveBlogPopup;

const closeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 15"
    fill="none"
  >
    <g clip-path="url(#clip0_0_6282)">
      <path
        d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
        fill="var(--textColor)"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="var(--textColor)"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="var(--textColor)"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);

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
