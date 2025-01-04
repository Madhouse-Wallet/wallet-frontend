import { Outfit } from "next/font/google";

import { React, useEffect, useState } from "react";
import MainLayout from "./MainLayout";

import { useRouter } from "next/router";
import AuthLayout from "./AuthLayout";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Layout = ({ Component, pageProps }) => {
  const [isAuth, setIsAuth] = useState(false);

  const router = useRouter();
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
    <div className={outfit.className}>
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
