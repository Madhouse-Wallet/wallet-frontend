import Image from "next/image";
import React from "react";
import styled from "styled-components";
import bg from "@/Assets/Images/bg1.png";
import img from "@/Assets/Images/feature.png";

const HowWeWorkSec: React.FC = () => {
  return (
    <>
      <HowWeWork className=" relative pb-5 pt-14 z-10 bg-[#131313]">
        <div className="container">
          <div className="grid gap-3 grid-cols-12 itmes-center">
            <div className="lg:col-span-4 col-span-12">
              <div className="">
                <h2 className="m-0 font-medium text-5xl text-white py-2">
                  The <span className="text-gradient">way </span>
                  we work
                </h2>
                <p className="m-0 py-2">
                  It refers to our approach of prioritizing security,
                  transparency, and user empowerment through robust protocols,
                  audits, and education. We ensure a seamless, risk-managed
                  experience for every user.
                </p>
                <div className="btnWrp mt-4">
                  <button className="inline-flex items-center justify-center btn rounded-4">
                    Learn More <span className="icn ms-2">{right}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 col-span-12">
              <div className="grid gap-3 iwt grid-cols-12 p-3">
                <div className="md:col-span-6 col-span-12 ">
                  <Card className=" rounded-lg relative h-full">
                    <div className="inner rounded-lg p-3 bg-[#131313] pb-5 h-full">
                      <div className="top mb-3">
                        <span className="inline-flex items-center rounded-pill px-3 py-3 text-dark font-normal border-0  text-base badge">
                          Step 1
                        </span>
                      </div>
                      <h4 className="m-0 text-2xl pb-2 font-medium">
                        Secure Setup
                      </h4>
                      <p className="m-0 text-gray-400">
                        We prioritize user security with a step-by-step wallet
                        setup, using cutting-edge encryption and hardware wallet
                        support.
                      </p>
                    </div>
                  </Card>
                </div>
                <div className="md:col-span-6 col-span-12 ">
                  <Card className=" rounded-lg relative h-full">
                    <div className="inner rounded-lg p-3 bg-[#131313] pb-5 h-full">
                      <div className="top mb-3">
                        <span className="inline-flex items-center rounded-pill px-3 py-3 text-dark font-normal border-0  text-base badge">
                          Step 2
                        </span>
                      </div>
                      <h4 className="m-0 text-2xl pb-2 font-medium">
                        Continuous Audits
                      </h4>
                      <p className="m-0 text-gray-400">
                        Regular protocol audits ensure the integrity and safety
                        of our platform, keeping risks minimized.
                      </p>
                    </div>
                  </Card>
                </div>
                <div className="md:col-span-6 col-span-12 ">
                  <Card className=" rounded-lg relative h-full">
                    <div className="inner rounded-lg p-3 bg-[#131313] pb-5 h-full">
                      <div className="top mb-3">
                        <span className="inline-flex items-center rounded-pill px-3 py-3 text-dark font-normal border-0  text-base badge">
                          Step 3
                        </span>
                      </div>
                      <h4 className="m-0 text-2xl pb-2 font-medium">
                        Risk Mitigation
                      </h4>
                      <p className="m-0 text-gray-400">
                        We provide tools and guidance to help users protect
                        their assets, including cold storage and phishing
                        awareness.
                      </p>
                    </div>
                  </Card>
                </div>
                <div className="md:col-span-6 col-span-12 ">
                  <Card className=" rounded-lg relative h-full">
                    <div className="inner rounded-lg p-3 bg-[#131313] pb-5 h-full">
                      <div className="top mb-3">
                        <span className="inline-flex items-center rounded-pill px-3 py-3 text-dark font-normal border-0  text-base badge">
                          Step 4
                        </span>
                      </div>
                      <h4 className="m-0 text-2xl pb-2 font-medium">
                        User Empowerment
                      </h4>
                      <p className="m-0 text-gray-400">
                        Through education and best practices, we empower users
                        to manage their assets confidently and securely.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HowWeWork>
    </>
  );
};

const HowWeWork = styled.section`
  font-family: "Funnel Display", serif;
`;

const Card = styled.div`
  padding: 1px;
  background: linear-gradient(145deg, #ffffff, #090400 50%, #ffffff);
  .badge {
    background-image: linear-gradient(90deg, #ffdf56, #ff8735 50%, #ffa6c1);
  }
`;

export default HowWeWorkSec;

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
const blockchainIntegeration = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="31"
    viewBox="0 0 30 31"
    fill="none"
  >
    <path
      d="M6.25 15.25C6.25 15.9404 5.69035 16.5 5 16.5C4.30965 16.5 3.75 15.9404 3.75 15.25C3.75 14.5596 4.30965 14 5 14C5.69035 14 6.25 14.5596 6.25 15.25ZM6.25 15.25H11.25M11.25 15.25C11.25 16.3891 11.7578 17.4095 12.5595 18.0972M11.25 15.25C11.25 14.2145 11.6697 13.277 12.3484 12.5984C13.027 11.9197 13.9645 11.5 15 11.5M9.12701 22.1019C8.68974 21.7266 8.12134 21.5 7.5 21.5C6.11929 21.5 5 22.6193 5 24C5 25.3807 6.11929 26.5 7.5 26.5C8.88071 26.5 10 25.3807 10 24C10 23.2406 9.66142 22.5604 9.12701 22.1019ZM9.12701 22.1019L12.5595 18.0972M12.5595 18.0972C13.2154 18.66 14.068 19 15 19C16.0355 19 16.973 18.5802 17.6516 17.9016C18.3302 17.223 18.75 16.2855 18.75 15.25C18.75 14.2145 18.3302 13.277 17.6516 12.5984M17.6516 12.5984C17.5837 12.5305 17.5134 12.4652 17.4405 12.4027C16.7846 11.84 15.932 11.5 15 11.5M17.6516 12.5984L23.5826 6.66735M15 11.5V7.75M15 7.75C16.0355 7.75 16.875 6.91054 16.875 5.875C16.875 4.83946 16.0355 4 15 4C13.9645 4 13.125 4.83946 13.125 5.875C13.125 6.91054 13.9645 7.75 15 7.75ZM20.873 22.1019C21.3103 21.7268 21.8786 21.5 22.5 21.5C23.8807 21.5 25 22.6194 25 24C25 25.3807 23.8807 26.5 22.5 26.5C21.1193 26.5 20 25.3807 20 24C20 23.2406 20.3386 22.5604 20.873 22.1019ZM20.873 22.1019L17.4405 18.0972M23.5826 6.66735C23.8654 6.95011 24.256 7.125 24.6875 7.125C25.5505 7.125 26.25 6.42545 26.25 5.5625C26.25 4.69955 25.5505 4 24.6875 4C23.8245 4 23.125 4.69955 23.125 5.5625C23.125 5.99398 23.2999 6.3846 23.5826 6.66735Z"
      stroke="#FFDF56"
      stroke-width="1.875"
      stroke-linejoin="round"
    />
  </svg>
);
const dollarIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
  >
    <path
      d="M15 6.25H18.1375C20.5469 6.25 22.5 8.20316 22.5 10.6125V10.625M15 6.25H11.875C9.45875 6.25 7.5 8.20875 7.5 10.625C7.5 13.0412 9.45875 15 11.875 15H15M15 6.25V3.75M15 6.25V15M15 15V23.75M15 15H18.125C20.5412 15 22.5 16.9588 22.5 19.375C22.5 21.7912 20.5412 23.75 18.125 23.75H15M15 23.75H11.875C9.45875 23.75 7.5 21.7912 7.5 19.375M15 23.75V26.25"
      stroke="#FFDF56"
      stroke-width="1.875"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const lockIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="31"
    height="30"
    viewBox="0 0 31 30"
    fill="none"
  >
    <path
      d="M21.9492 10C21.9492 6.54822 19.151 3.75 15.6992 3.75C12.2474 3.75 9.44922 6.54822 9.44922 10M15.6992 15.625V20.625M12.5742 26.25H18.8242C21.7425 26.25 23.2016 26.25 24.3062 25.6596C25.1783 25.1935 25.8927 24.4791 26.3588 23.607C26.9492 22.5024 26.9492 21.0432 26.9492 18.125C26.9492 15.2068 26.9492 13.7476 26.3588 12.643C25.8927 11.7709 25.1783 11.0566 24.3062 10.5904C23.2016 10 21.7425 10 18.8242 10H12.5742C9.65593 10 8.19678 10 7.09223 10.5904C6.22009 11.0566 5.50578 11.7709 5.03961 12.643C4.44922 13.7476 4.44922 15.2068 4.44922 18.125C4.44922 21.0432 4.44922 22.5024 5.03961 23.607C5.50578 24.4791 6.22009 25.1935 7.09223 25.6596C8.19678 26.25 9.65593 26.25 12.5742 26.25Z"
      stroke="#FFDF56"
      stroke-width="1.875"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const Tokenization = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="31"
    height="30"
    viewBox="0 0 31 30"
    fill="none"
  >
    <path
      d="M8.38432 22.5H17.7282C19.0263 22.5 19.6753 22.5 20.2686 22.2957C20.4646 22.2282 20.6547 22.1446 20.8369 22.0458C21.3883 21.7465 21.8269 21.268 22.7041 20.3111L25.1336 17.6606C26.1576 16.5436 26.6697 15.985 26.7686 15.3234C26.8006 15.109 26.8006 14.891 26.7686 14.6766C26.6697 14.015 26.1576 13.4564 25.1336 12.3393L22.7041 9.68886C21.8269 8.73199 21.3883 8.25355 20.8369 7.95424C20.6547 7.85532 20.4646 7.7717 20.2686 7.70421C19.6753 7.5 19.0263 7.5 17.7282 7.5H8.38432C6.70204 7.5 5.86092 7.5 5.58186 7.91C5.49587 8.03633 5.44207 8.18176 5.42514 8.33364C5.37019 8.82654 6.00883 9.37394 7.28611 10.4688L9.08473 12.0104C10.5159 13.2371 11.2315 13.8505 11.3663 14.6246C11.4096 14.873 11.4096 15.127 11.3663 15.3754C11.2315 16.1495 10.5159 16.7629 9.08473 17.9896L7.28611 19.5312C6.00883 20.626 5.37019 21.1735 5.42514 21.6664C5.44207 21.8182 5.49587 21.9636 5.58186 22.09C5.86092 22.5 6.70204 22.5 8.38432 22.5Z"
      stroke="#FFDF56"
      stroke-width="1.875"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const security = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="#FFDF56"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path
      d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
      stroke="#FFDF56"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path
      d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z"
      fill="#FFDF56"
    />
  </svg>
);

const walletIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="31"
    height="31"
    viewBox="0 0 31 31"
    fill="none"
  >
    <path
      d="M19.4492 13.375H21.9492M23.1992 9C23.1992 6.92894 21.5203 5.25 19.4492 5.25H13.4492C9.69948 5.25 7.82462 5.25 6.51029 6.20491C6.08582 6.51331 5.71253 6.8866 5.40413 7.31107C4.44922 8.6254 4.44922 10.5003 4.44922 14.25V19M12.5742 25.25H18.8242C21.7425 25.25 23.2016 25.25 24.3062 24.6596C25.1783 24.1935 25.8927 23.4791 26.3588 22.607C26.9492 21.5024 26.9492 20.0432 26.9492 17.125C26.9492 14.2068 26.9492 12.7476 26.3588 11.643C25.8927 10.7709 25.1783 10.0566 24.3062 9.59039C23.2016 9 21.7425 9 18.8242 9H12.5742C9.65593 9 8.19678 9 7.09223 9.59039C6.22009 10.0566 5.50578 10.7709 5.03961 11.643C4.44922 12.7476 4.44922 14.2068 4.44922 17.125C4.44922 20.0432 4.44922 21.5024 5.03961 22.607C5.50578 23.4791 6.22009 24.1935 7.09223 24.6596C8.19678 25.25 9.65593 25.25 12.5742 25.25Z"
      stroke="#FFDF56"
      stroke-width="1.875"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
