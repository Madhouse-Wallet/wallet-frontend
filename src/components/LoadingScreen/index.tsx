import Image from "next/image";
import React from "react";
import styled, { keyframes } from "styled-components";

const LoadingScreen = () => {

  return (
    <>
      <div
        className="flex items-center justify-center bg-[#000000a3] fixed top-0 left-0 w-full z-[9999999]"
        style={{ minHeight: "100vh", backdropFilter: "blur(01px)" }}
      >
        <Loader className="flex items-center animate-bounce justify-center p-3  relative">
          <Image
            src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow1.png"}
            alt="loader"
            height={10000}
            width={10000}
            className="max-w-auto w-auto "
            style={{ height: 30 }}
          />
        </Loader>
      </div>
    </>
  );
};

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Loader = styled.div`
  width: 80px; /* Adjust size */
  height: 80px;
  &:after {
    position: absolute;
    content: "";
    left: 0;
    height: 100%;
    width: 100%;
    right: 0;
    top: 0;
    transform: translateY(-50%);
    margin: 0 auto;

    border: 4px solid transparent; /* Transparent border */
    border-top: 4px solid #df723b; /* Color of rotating border */
    border-radius: 50%;
    animation: ${rotate} 1s linear infinite;
  }
`;

export default LoadingScreen;
