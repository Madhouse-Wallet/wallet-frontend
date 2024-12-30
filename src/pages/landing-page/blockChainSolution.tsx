import Image from "next/image";
import React from "react";
import styled from "styled-components";
import bg from "@/Assets/Images/bg1.png";
import img from "@/Assets/Images/blockchainSol.png";

const BlockChainSolution: React.FC = () => {
  return (
    <>
      <BlockChainSol className=" relative pb-5 pt-14 z-10 bg-[#fff]">
        <div className="container pt-14">
          <div className="grid gap-3 grid-cols-12 itmes-center">
            <div className="md:col-span-6 col-span-12">
              <h2 className="m-0 font-medium text-5xl text-dark py-2">
                Blockchain solutions built around you
              </h2>
              <p className="m-0 py-2 text-gray-400">
                We specialize in creating blockchain solutions that are tailored
                specifically to your needs, ensuring that you stay ahead of the
                curve and fully equipped to leverage the power of decentralized
                technology.
              </p>
              <div className="btnWrp mt-4">
                <button className="inline-flex items-center justify-center btn rounded-4">
                  Learn More <span className="icn ms-2">{right}</span>
                </button>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 p-lg-4">
              <Image
                src={img}
                alt="graphic"
                height={1000}
                width={1000}
                className="max-w-full w-100 h-full"
              />
            </div>
          </div>
        </div>
      </BlockChainSol>
    </>
  );
};

const BlockChainSol = styled.section`
  font-family: "Funnel Display", serif;
`;

export default BlockChainSolution;

const right = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.793 7.49999H2.5C2.36739 7.49999 2.24021 7.55267 2.14645 7.64644C2.05268 7.74021 2 7.86738 2 7.99999C2 8.1326 2.05268 8.25978 2.14645 8.35354C2.24021 8.44731 2.36739 8.49999 2.5 8.49999H11.793L8.146 12.146C8.05211 12.2399 7.99937 12.3672 7.99937 12.5C7.99937 12.6328 8.05211 12.7601 8.146 12.854C8.23989 12.9479 8.36722 13.0006 8.5 13.0006C8.63278 13.0006 8.76011 12.9479 8.854 12.854L13.354 8.35399C13.4006 8.30754 13.4375 8.25237 13.4627 8.19162C13.4879 8.13088 13.5009 8.06576 13.5009 7.99999C13.5009 7.93422 13.4879 7.8691 13.4627 7.80836C13.4375 7.74761 13.4006 7.69244 13.354 7.64599L8.854 3.14599C8.76011 3.0521 8.63278 2.99936 8.5 2.99936C8.36722 2.99936 8.23989 3.0521 8.146 3.14599C8.05211 3.23988 7.99937 3.36721 7.99937 3.49999C7.99937 3.63277 8.05211 3.7601 8.146 3.85399L11.793 7.49999Z"
      fill="black"
    />
  </svg>
);
