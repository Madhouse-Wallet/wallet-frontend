import { AnimatePresence, motion } from "framer-motion";
import { React, useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useSelector } from "react-redux";

const MainLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(false);
  const [ensDomain, setEnsDomain] = useState(false);
  const userAuth = useSelector((state) => state.Auth);

  useEffect(() => {
    if (userAuth?.login && !userAuth?.pos && !userAuth?.ensSetup) {
      const timer = setTimeout(() => {}, 20000);
      return () => clearTimeout(timer);
    }
  }, [ensDomain, userAuth?.login]);
  return (
    <>
      <Main className="ml-auto ms-auto">
        <Header sidebar={sidebar} setSidebar={setSidebar} />
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
