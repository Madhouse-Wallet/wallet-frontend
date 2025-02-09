import Image from "next/image";
import { Inter } from "next/font/google";
import BTCEchange from "@/pages/btc-exchange";
import ThresholdWallet from "./threshold-wallet";
import Dashboard from "./dashboard";
import Welcome from "./welcome";
import logow from "@/Assets/Images/logow.png";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [splash, setSplash] = useState(true);
  const [authStatus, setAuthStatus] = useState(true); // ✅ Use state instead of a variable

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplash(false);
      setAuthStatus(false); // ✅ Properly update state
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* {splash ? (
        <div className="mx-auto max-w-sm">
          <div className="top pb-3">
            <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
              <div className="flex flex-col items-center gap-1 px-4">
                <Image
                  src={logow}
                  alt="logo"
                  className="max-w-full mx-auto w-auto mb-2"
                  height={100000}
                  width={10000}
                  style={{ height: 60 }}
                />
                <h1 className="text-center text-base font-medium m-0">
                  Madhouse Wallet
                </h1>
              </div>
            </div>
          </div>
        </div>
      ) : (
      )} */}
      <Dashboard />
    </>
  );
}

Home.authRoute = false;
