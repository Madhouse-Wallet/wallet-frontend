import { Inter } from "next/font/google";

import { React, useEffect, useState } from "react";
import MainLayout from "./MainLayout";
import bg from "@/Assets/Images/umbrel/1.jpg";

import { useRouter } from "next/router";
import AuthLayout from "./AuthLayout";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Layout = ({ Component, pageProps }) => {
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
        src={bg}
        height={100000}
        width={100000}
        quality={100}
        alt=""
        className="transition-opacity fill-mode-both opacity-100 pointer-events-none fixed inset-0 w-full scale-125 object-cover object-center blur-[var(--wallpaper-blur)] duration-700 h-lvh object-center"
        style={{ transform: "scale(1.25)" }}
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
