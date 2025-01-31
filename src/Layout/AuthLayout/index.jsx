import Image from "next/image";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import Link from "next/link";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";

const AuthLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  return (
    <>
      <AuthSec className="authLayout py-5 z-10 relative flex items-center justify-center">
        <div className="absolute top-0 left-0 h-full w-full transition-opacity fill-mode-both opacity-100 pointer-events-none fixed inset-0 w-full scale-125 object-cover object-center blur-[var(--wallpaper-blur)] duration-700 h-lvh backdrop-blur-xl z-[-9]"></div>
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={router.route}
                  // zoom in
                  // initial={{ scale: 0.8, opacity: 0 }}
                  // animate={{ scale: 1, opacity: 1 }}
                  // exit={{ scale: 0.8, opacity: 0 }}
                  // transition={{ duration: 0.5 }}

                  // horizontal flip
                  // initial={{ rotateY: 90, opacity: 0 }}
                  // animate={{ rotateY: 0, opacity: 1 }}
                  // exit={{ rotateY: -90, opacity: 0 }}
                  // transition={{ duration: 0.6 }}

                  // parallax animation
                  initial={{ y: "50%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  // exit={{ y: "-50%", opacity: 0 }}
                  transition={{ duration: 0.6 }}

                  // blur animation
                  // initial={{ filter: "blur(10px)", opacity: 0 }}
                  // animate={{ filter: "blur(0px)", opacity: 1 }}
                  // exit={{ filter: "blur(10px)", opacity: 0 }}
                  // transition={{ duration: 0.5 }}

                  // 3d animation
                  // initial={{ perspective: 1000, rotateY: -90 }}
                  // animate={{ perspective: 1000, rotateY: 0 }}
                  // exit={{ perspective: 1000, rotateY: 90 }}
                  // transition={{ duration: 0.7 }}
                >
                  <Component {...pageProps} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </AuthSec>
    </>
  );
};

const AuthSec = styled.section`
  min-height: 100vh;
`;

export default AuthLayout;
