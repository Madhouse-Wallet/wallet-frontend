import { React, useState } from "react";
import styled from "styled-components";

// css
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Sidebar from "../../components/Header/sidebar";

const MainLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  const [sidebar, setSidebar] = useState();
  const pageActive = router.pathname.replace("/", "");

  return (
    <>
      <div className="flex items-start">
        <Sidebar />
        <Main className="w-full">
          <Header />
          <Component {...pageProps} />
        </Main>
      </div>
    </>
  );
};

const Main = styled.main``;

export default MainLayout;
