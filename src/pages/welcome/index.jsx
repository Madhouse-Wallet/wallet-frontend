import { useRouter } from "next/router";
import React from "react";
import logow from "@/Assets/Images/logow.png";
import logo from "@/Assets/Images/logo.png";
import Image from "next/image";
import { useTheme } from "@/ContextApi/ThemeContext";

const Welcome = () => {
  const { theme, toggleTheme } = useTheme();

  const router = useRouter();
  return (
    <>
      {" "}
      <div className="mx-auto max-w-sm">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <Image
                src={logow}
                alt="logo"
                className="max-w-full mx-auto w-auto mb-2"
                height={100000}
                width={10000}
                style={{ height: 40 }}
              />
              <h1 className="text-center text-base font-medium  m-0">
                Madhouse Wallet
              </h1>
              <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
              </p>
            </div>
          </div>
        </div>
        <div className="btnWrpper pt-4 mt-4 text-center flex gap-3 justify-center">
          <button
            onClick={() => router.push("/create-wallet")}
            type="submit"
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
          >
            Create Wallet
          </button>
          <button
            onClick={() => router.push("/login")}
            type="submit"
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
          >
            Log in
          </button>
        </div>
      </div>
    </>
  );
};
Welcome.authRoute = true;
export default Welcome;
