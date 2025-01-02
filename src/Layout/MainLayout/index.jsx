import { React, useState } from "react";
import styled from "styled-components";

// css
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Sidebar from "../../components/Header/sidebar";

const MainLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(false);
  const pageActive = router.pathname.replace("/", "");

  return (
    <>
      <div className="flex items-start justify-end relative">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <Main className="ml-auto">
          <Header sidebar={sidebar} setSidebar={setSidebar} />
          <Component {...pageProps} />
        </Main>
      </div>
    </>
  );
};

const Main = styled.main`
  width: calc(100% - 250px);
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

export default MainLayout;
