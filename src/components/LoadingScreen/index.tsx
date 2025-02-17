import Image from "next/image";
import React from "react";
import logoW from "@/Assets/Images/logow.png";
import logo from "@/Assets/Images/logow1.png";
import styled, { keyframes } from "styled-components";
import { useTheme } from "@/ContextApi/ThemeContext";

const LoadingScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isChecked = theme === "light";

  return (
    <>
      <div
        className="flex items-center justify-center bg-[#000000a3] fixed top-0 left-0 w-full z-[9999999]"
        style={{ minHeight: "100vh" }}
      >
        <Image
          src={logo}
          alt="loader"
          height={10000}
          width={10000}
          className="max-w-auto w-auto animate-bounce"
          style={{ height: 60 }}
        />
      </div>
    </>
  );
};

export default LoadingScreen;
