import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";
import { BackBtn } from "@/components/common";
import Link from "next/link";
import PrimaryButton from "@/components/common/PrimaryButton";

const Welcome = () => {
  const router = useRouter();
  return (
    <>
      {" "}
      <div className="mx-auto max-w-sm">
        <div className="top pb-3">
          <div className="relative z-10 duration-300 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center justify-center mb-2 gap-3">
                <BackBtn />
                <Image
                  src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow.png"}
                  alt="logo"
                  className="max-w-full mx-auto w-auto "
                  height={100000}
                  width={10000}
                  style={{ height: 40 }}
                />
              </div>
              <h1 className="text-center text-base font-medium  m-0">
               Get Started
              </h1>
              <p className="text-center text-sm font-medium opacity-50 md:text-xs">
                Please review our privacy policy before proceeding: 
              </p> 
              <a
                href="https://madhouse-wallet.gitbook.io/docs/legal-policies/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 mb-2 bg-white/10 hover:bg-white/20 text-white font-normal flex items-center justify-center rounded-full px-4 py-2 text-14 -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 min-w-[112px] w-full max-w-xs mx-auto"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        <div className="btnWrpper pt-4 mt-4 text-center flex gap-3 justify-center">
          <PrimaryButton onClick={() => router.push("/create-wallet")} type="submit">
            Create Wallet
          </PrimaryButton>
          <PrimaryButton onClick={() => router.push("/login")} type="submit">
            Log in
          </PrimaryButton>
        </div>
        <div className="mt-2 text-center flex gap-3 justify-center">
          <PrimaryButton asChild>
            <Link href="/recover-wallet">Add Passkey</Link>
          </PrimaryButton>
          <PrimaryButton asChild>
            <Link href="/modify-keys">Modify Passkeys</Link>
          </PrimaryButton>
        </div>
      </div>
    </>
  );
};
Welcome.authRoute = true;
export default Welcome;
