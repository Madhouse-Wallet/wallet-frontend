import "@/Assets/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "../lib/providers";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import Layout from "@/Layout/index"
import { initializeTBTC } from "../lib/tbtcSdkInitializer";
import { ThemeProvider } from "@/ContextApi/ThemeContext";
console.log("initializeTBTC--->", initializeTBTC)
export default function App({ Component, pageProps, ...props }: AppProps) {
  return <>
    <Providers>
    <ToastContainer />
      <ThemeProvider>
        <Layout Component={Component} pageProps={pageProps} {...props} />
      </ThemeProvider>
    </Providers>
    {/* <Component {...pageProps} />; */}
  </>
}
