import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";
import { useTheme } from "@/ContextApi/ThemeContext";
import { BackBtn } from "@/components/common";
import Link from "next/link";

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
              <div className="flex items-center justify-center mb-2 gap-3">
                <BackBtn />
                <Image
                  src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow.png"}
                  alt="logo"
                  className="max-w-full mx-auto w-auto "
                  height={100000}
                  width={10000}
                  style={{ height: 40 }}
                />
              </div>
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
        <div className="mt-2 text-center flex gap-3 justify-center">
        <Link href={"/pos-login"} 
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
            >
           POS Login</Link>
           <Link href={"/recover-wallet"} 
            className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
            >
           Recover Wallet</Link>
       
          {/* <div className="py-1">
          </div>
          <div className="py-1">
          </div> */}
        </div>
      </div>
    </>
  );
};
Welcome.authRoute = true;
export default Welcome;
