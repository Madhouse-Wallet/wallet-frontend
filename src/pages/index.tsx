import Image from "next/image";
import { Inter } from "next/font/google";
import BTCEchange from "@/pages/btc-exchange";
import ThresholdWallet from "./threshold-wallet";
import Dashboard from "./dashboard";
import Welcome from "./welcome";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      {/* <BTCEchange /> */}
      {/* <ThresholdWallet /> */}
      {/* <UmbrelOsPage /> */}
      {/* <Dashboard /> */}
      <Welcome />
    </>
  );
}

Home.authRoute = true;
