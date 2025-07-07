import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import styled from "styled-components";
import { useRouter } from "next/router";
import { createPortal } from "react-dom";

const AuthLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  return (
    <>
      <AuthSec className="authLayout py-5 z-10 relative flex items-center justify-center">
        <div className="fixed bg-black/50 top-0 left-0 h-lvh w-full transition-opacity fill-mode-both opacity-100 pointer-events-none inset-0 scale-125 object-cover object-center blur-[var(--wallpaper-blur)] duration-700 backdrop-blur-md z-[-1]"></div>
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={router.route}
                  initial={{ y: "50%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.6 }}
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
  min-height: 100dvh;
  overflow: hidden;
`;

export default AuthLayout;
