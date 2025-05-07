import { Inter } from "next/font/google";
import { React, useEffect, useState } from "react";
import MainLayout from "./MainLayout";
import { useRouter } from "next/router";
import AuthLayout from "./AuthLayout";
import Image from "next/image";
import { useBackground } from "@/ContextApi/backgroundContent";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Layout = ({ Component, pageProps }) => {
  const { selectedBackground, selectedWatermark, bgOpacity, wmOpacity } =
    useBackground();

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
        style={{ opacity: wmOpacity, maxHeight: 500 }}
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
