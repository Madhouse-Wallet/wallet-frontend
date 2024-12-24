"use client";
import { ThemeProvider } from "@/components/ContextApi/ThemeContext";
import Header from "@/components/Header";
import Loader from "@/components/loader";
import BTCAddressPop from "@/components/Modals/BtcAddressPop";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Nav, Row, Tab } from "react-bootstrap";
import RecentTransaction from "./RecentTransaction";
import BtcExchangePop from "@/components/Modals/BtcExchangePop/index";
// import { initializeTBTC } from "../../tbtc/src/tbtcSdkInitializer";
import ether4 from "../../ethers/index.js"
import QRCode from 'qrcode';
import { Provider, useSelector } from "react-redux";
import { store } from "@/lib/redux/store";
import { RootState } from "@/lib/redux";
const BTCEchange: React.FC = () => {
  // const {  safeAddress } = useSelector((state:RootState) => state.auth);
  const router = useRouter();
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [btcExchange, setBtcExchange] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [depositSetup, setDepositSetup] = useState<any>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };


  const mint = async()=>{
    try {
         const txHash = await depositSetup.initiateMinting();
      console.log("Minting initiated, transaction hash:", txHash);
    } catch (error) {
      console.log("setSdkTbtc-->",error)
    }
  }

  const handleReceiveClick = () => {
    try {
      setLoading(true);
      setBtcExchange(true);
    } catch (error) {
      console.error("Error in receive process:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    <Provider store={store}>
      <ThemeProvider>
        {true ? <Header /> : ""}
        {showFirstComponent ? (
          <Loader />
        ) : (
          <>
            <BtcExchangePop
              btcExchange={btcExchange}
              setBtcExchange={setBtcExchange}
              walletAddress={walletAddress}
              // loading={loading}
              mint={mint}
            />
            <section className="position-relative dashboard py-3">
              <Container>
                <Row>
                  <Col lg="12" className="my-2">
                    <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
                      <div className="d-flex align-items-center gap-10">
                        <Button
                          onClick={handleGoBack}
                          variant="transparent"
                          className="border-0 themeClr p-0"
                        >
                          {backIcn}
                        </Button>
                        <h4 className="m-0">Threshold Wallet</h4>
                      </div>
                    </div>
                  </Col>
                  <Col lg="12" className="my-2">
                    <div className="d-flex align-items-start justify-content-between flex-wrap">
                      <div className="left ">
                        <h4 className="m-0 fw-bold">
                          Balance
                          <span className="themeClr ms-2">$ 12,345,00.00</span>
                        </h4>
                      </div>
                      <div className="right">
                        <div className="d-flex align-items-center gap-10">
                          <Button
                            // onClick={() => setBtcExchange(!btcExchange)}
                            className="d-flex align-items-center justify-content-center commonBtn"
                          >
                            Send
                          </Button>
                          <Button
                            onClick={() => handleReceiveClick()}
                            className="d-flex align-items-center justify-content-center commonBtn"
                          >
                            Receive
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg="12" className="my-2">
                    <div className="sectionHeader pb-2  mt-4">
                      <div className="d-flex align-items-center gap-10 mb-3">
                        <h4 className="m-0">Recent Transaction</h4>
                      </div>
                      <RecentTransaction />
                    </div>
                  </Col>
                </Row>
              </Container>
            </section>
          </>
        )}
      </ThemeProvider>
      </Provider>
    </>
  );
};

export default BTCEchange;

const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
);
