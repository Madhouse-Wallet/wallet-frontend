import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/Assets/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "../lib/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "@/Layout/index";
import { ThemeProvider } from "@/ContextApi/ThemeContext";
import { BackgroundProvider } from "@/ContextApi/backgroundContent";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function App({ Component, pageProps, ...props }: AppProps) {
  useScrollRestoration();

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
