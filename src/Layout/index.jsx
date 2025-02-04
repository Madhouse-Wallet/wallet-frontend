import { Inter } from "next/font/google";

import { React, useEffect, useState } from "react";
import MainLayout from "./MainLayout";
import bg from "@/Assets/Images/umbrel/1.jpg";
// import bg from "@/Assets/Images/landingBg.png";
import bgw from "@/Assets/Images/bgw.png";
import dwm from "@/Assets/Images/watermarkd.png";

import { useRouter } from "next/router";
import AuthLayout from "./AuthLayout";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { useTheme } from "@/ContextApi/ThemeContext";
import { useBackground } from "@/ContextApi/backgroundContent";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Layout = ({ Component, pageProps }) => {
  const { selectedBackground, selectedWatermark, bgOpacity, wmOpacity } =
    useBackground();
  const { theme, toggleTheme } = useTheme();

  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (Component.isProtected) {
      if (!auth.authToken) {
        router.push("/login");
      } else {
        setIsAuth(true);
      }
    } else {
      setIsAuth(true);
    }
  }, [Component]);

  return (
    <div className={`${inter.className} relative w-100 overflow-hidden`}>
      {/* {theme == "dark" ? (
        <>
          <Image
            src={bg}
            height={100000}
            width={100000}
            quality={100}
            alt=""
            className="transition-opacity fill-mode-both opacity-100 pointer-events-none fixed inset-0 w-full scale-125 object-cover object-center blur-[var(--wallpaper-blur)] duration-700 h-lvh object-center"
            style={{ transform: "scale(1.25)", opacity: 0.4 }}
          />
          <Image
            src={dwm}
            height={100000}
            width={100000}
            quality={100}
            alt=""
            className=" fill-mode-both mx-auto opacity-100 pointer-events-none fixed inset-0 w-auto h-auto top-[50%] transform -translate-y-1/2 object-cover object-center blur-[var(--wallpaper-blur)] duration-700  object-center"
            style={{ opacity: ".6" }}
          />
        </>
      ) : theme == "light" ? (
        <>
          <Image
            src={bgw}
            height={100000}
            width={100000}
            quality={100}
            alt=""
            className="transition-opacity fill-mode-both opacity-100 pointer-events-none fixed inset-0 w-full scale-125 object-cover object-center blur-[var(--wallpaper-blur)] duration-700 h-lvh object-center"
            style={{ transform: "scale(1.25)", opacity: 0.6 }}
          />
        </>
      ) : (
        <></>
      )} */}
      <Image
        src={selectedBackground}
        height={100000}
        width={100000}
        quality={100}
        alt="Background"
        className="transition-opacity fill-mode-both pointer-events-none fixed inset-0 w-full scale-125 object-cover object-center blur-[var(--wallpaper-blur)] duration-700 h-lvh"
        style={{
          transform: "scale(1.25)",
          opacity: bgOpacity, // 🔥 Dynamic Opacity from Context
        }}
      />
      <Image
        src={selectedWatermark}
        height={100000}
        width={100000}
        quality={100}
        alt=""
        className=" fill-mode-both mx-auto opacity-100 pointer-events-none fixed inset-0 w-auto h-auto top-[50%] transform -translate-y-1/2 object-container object-center blur-[var(--wallpaper-blur)] duration-700  "
        style={{ opacity: wmOpacity }}
      />
      {isAuth &&
        (Component.authRoute ? (
          <AuthLayout Component={Component} pageProps={pageProps} />
        ) : (
          <MainLayout Component={Component} pageProps={pageProps} />
        ))}
    </div>
  );
};

export default Layout;
