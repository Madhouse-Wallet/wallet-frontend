import Image from "next/image";
import { Inter } from "next/font/google";
import BTCEchange from "@/pages/btc-exhange";
import ThresholdWallet from "./threshold-wallet";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      {/* <BTCEchange /> */}
      <ThresholdWallet />
    </>
  );
}
