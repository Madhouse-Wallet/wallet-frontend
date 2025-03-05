import { AnimatePresence, motion } from "framer-motion";
import { React, useState, useEffect } from "react";
import styled from "styled-components";

// css
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Header/sidebar";
import Image from "next/image";
import bg from "@/Assets/Images/umbrel/1.jpg";
import { createPortal } from "react-dom";
import EnsDomainPop from "@/components/Modals/EnsDomainPop";
import { useSelector } from "react-redux";

const MainLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(false);
  const [ensDomain, setEnsDomain] = useState(false);
  const pageActive = router.pathname.replace("/", "");
  const userAuth = useSelector((state) => state.Auth);
  const [popupOpened, setPopupOpened] = useState(false);

  useEffect(() => {

    // ensName: userAuth.ensName || "",
    // ensSetup: 


    if (userAuth?.login && (!(userAuth?.ensSetup)) ) {
      const timer = setTimeout(() => {
        setEnsDomain(true); // Set state to prevent reopening
      }, 20000); // 10 seconds delay

      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }
  }, [ensDomain, userAuth?.login]);
  return (
    <>
      {/* <div className="flex items-start justify-end relative">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
      </div> */}
      {ensDomain &&
        createPortal(<EnsDomainPop ensDomain={ensDomain} setEnsDomain={setEnsDomain} />, document.body)}


      <Main className="ml-auto ms-auto">
        <Header sidebar={sidebar} setSidebar={setSidebar} />
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
        <Footer />
      </Main>
    </>
  );
};

const Main = styled.main`
  min-height: 100vh;
  padding-top: 60px;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

export default MainLayout;
