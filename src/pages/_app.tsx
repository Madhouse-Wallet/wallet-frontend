import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/Assets/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "../lib/providers";
import Layout from "@/Layout/index";
import { ThemeProvider } from "@/ContextApi/ThemeContext";
import { BackgroundProvider } from "@/ContextApi/backgroundContent";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { useEffect, useState } from "react";
import CustomToast from "@/components/ToasterMessage";
import { ToastProvider } from "@/ContextApi/ToastContext";

export default function App({ Component, pageProps, ...props }: AppProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };
  useEffect(() => {
    const header = document.getElementById("header");

    const preventRubberBand = (e: TouchEvent) => {
      if (window.scrollY <= 0 && e.touches[0].clientY > 0) {
        e.preventDefault(); // stop downward bounce
      }
    };

    header?.addEventListener("touchstart", preventRubberBand, {
      passive: false,
    });

    return () => {
      header?.removeEventListener("touchstart", preventRubberBand);
    };
  }, []);
  return (
    <>
      <Providers>
        <ToastProvider>
          <BackgroundProvider>
            <ThemeProvider>
              <Layout Component={Component} pageProps={pageProps} {...props} />
            </ThemeProvider>
          </BackgroundProvider>
        </ToastProvider>
      </Providers>
    </>
  );
}
