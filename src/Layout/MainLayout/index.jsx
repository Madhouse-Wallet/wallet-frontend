import { React, useState } from "react";
import styled from "styled-components";

// css
import { useRouter } from "next/router";
import Header from "../../components/Header";

const MainLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  const [sidebar, setSidebar] = useState();
  const pageActive = router.pathname.replace("/", "");

  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
};

export default MainLayout;
