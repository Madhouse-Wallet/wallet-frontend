import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/Assets/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "../lib/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "@/Layout/index";
import { initializeTBTC } from "../lib/tbtcSdkInitializer";
import { ThemeProvider } from "@/ContextApi/ThemeContext";
import { BackgroundProvider } from "@/ContextApi/backgroundContent";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/router";
import useScrollRestoration from "@/hooks/useScrollRestoration";

console.log("initializeTBTC--->", initializeTBTC);
export default function App({ Component, pageProps, ...props }: AppProps) {
  useScrollRestoration();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
 
  // useEffect(() => {
  //   const handleStart = () => {
  //     setLoading(true);
  //     // Delay for 2 seconds before hiding the loader
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 2000);
  //   };

  //   const handleComplete = () => {
  //     setLoading(false);
  //   };

  //   router.events.on("routeChangeStart", handleStart);
  //   router.events.on("routeChangeComplete", handleComplete);
  //   router.events.on("routeChangeError", handleComplete);

  //   // Show the loader for 2 seconds on page refresh
  //   handleStart();

  //   return () => {
  //     router.events.off("routeChangeStart", handleStart);
  //     router.events.off("routeChangeComplete", handleComplete);
  //     router.events.off("routeChangeError", handleComplete);
  //   };
  // }, [router]);

  // if (loading) {
  //   return (
  //     <ThemeProvider>
  //       <LoadingScreen /> {/* Show loading screen when loading is true */}
  //     </ThemeProvider>
  //   );
  // }

  return (
    <>
      <Providers>
        <ToastContainer />
        <BackgroundProvider>
          <ThemeProvider>
            <Layout Component={Component} pageProps={pageProps} {...props} />
          </ThemeProvider>
        </BackgroundProvider>
      </Providers>
    </>
  );
}
