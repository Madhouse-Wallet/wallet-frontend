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
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/router";
console.log("initializeTBTC--->", initializeTBTC);
export default function App({ Component, pageProps, ...props }: AppProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Show loading screen when the route changes
    const handleRouteChange = () => {
      setLoading(true); // Trigger loader
      setTimeout(() => {
        setLoading(false); // Hide loader after 4 seconds
      }, 2000); // 4 seconds duration for loading screen
    };

    // Listen for route changes
    router.events.on("routeChangeStart", handleRouteChange);

    // Cleanup listener on component unmount
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);
  console.log(loading, "loadingState");
  if (loading) {
    return (
      <ThemeProvider>
        <LoadingScreen /> {/* Show loading screen when loading is true */}
      </ThemeProvider>
    );
  }

  return (
    <>
      <Providers>
        <ToastContainer />
        <ThemeProvider>
          <Layout Component={Component} pageProps={pageProps} {...props} />
        </ThemeProvider>
      </Providers>
    </>
  );
}
