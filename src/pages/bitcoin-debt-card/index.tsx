"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import img from "@/Assets/Images/comingSoon.png";
import Image from "next/image";
const BTCDebitCard: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <section className="relative dashboard pt-12">
        <div className="container">
          <div className="pageCard  contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <button
              onClick={() => router.push("/dashboard")}
              className="border-0 p-0 absolute z-[99] top-2 right-2 opacity-40 hover:opacity-70"
              style={{ background: "transparent" }}
            >
              {closeIcn}
            </button>
            <div className="grid gap-3 grid-cols-12 px-2 pt-3">
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div className="sectionHeader ">
                  <div className="d-flex align-items-center gap-2">
                    <h4 className="m-0 text-24 font-bold -tracking-3  md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Bitcoin Debt Card
                    </h4>
                  </div>
                </div>
              </div>
              <div className="p-2 px-3 px-lg-4 py-lg-3 col-span-12">
                <div className="pt-4">
                  <Image
                    src={img}
                    alt="comingsoon"
                    height={10000}
                    width={10000}
                    className="max-w-full h-auto w-auto mx-auto"
                    style={{ maxHeight: 300 }}
                  />
                  <ContentWrp className=" text-center">
                    <h2 className="m-0 font-bold py-2">Coming Soon</h2>
                  </ContentWrp>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const ContentWrp = styled.div`
  h2 {
    font-size: 50px;
    line-height: 120px;

    background: linear-gradient(90.5deg, #e2682b 0.43%, #ffb38c 128%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
`;
export default BTCDebitCard;

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
