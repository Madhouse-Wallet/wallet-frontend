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
import { initializeTBTC } from "../../tbtc/src/tbtcSdkInitializer";
import ether4 from "../../ethers/index.js"
import QRCode from 'qrcode';
const BTCEchange: React.FC = () => {
  const router = useRouter();
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [btcExchange, setBtcExchange] = useState(false);
  const [qrCode, setQRCode] = useState('');
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

  const startReceive = async () => {
    try { 
      setLoading(true)
      console.log("initializeTBTC00>",initializeTBTC)
      // Replace with your Ethereum provider
      const provider = new ether4.providers.Web3Provider((window as any).ethereum);
      // const provider = new  ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/a48f9442af1a4c8da44b4fc26640e23d")
      // console.log("https://sepolia.infura.io/v3/a48f9442af1a4c8da44b4fc26640e23d--?",provider)
      // Get write access as an account by getting the signer
      await provider.send("eth_requestAccounts", []); // Request wallet access
      const signer = provider.getSigner();
      // Get the current chain ID
      console.log("signer-->", signer)
      const network = await provider.getNetwork();
      console.log("network--", network)
      // Initialize tBTC SDK
      const sdk = await initializeTBTC(signer);
      console.log("sdk-->",sdk)
       
      depo(sdk)
      setBtcExchange(!btcExchange)
    } catch (error) {
      console.log("error rec-->", error)
    }
  }

  const generateQRCode = async (text:any) => {
    try {
      const qr = await QRCode.toDataURL(text);
      setQRCode(qr);
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error(err);
    }
  };
 
  const depo = async(tbtcSdk:any)=>{
    const bitcoinRecoveryAddress = "tb1q29jj6w0ggjr0ukdzjmw54huev9gwrptaj04n8d"; // Replace with a valid BTC address
  
    try {
      // Step 4: Initiate the deposit
      console.log(tbtcSdk.deposits.initiateDeposit)
      const deposit = await tbtcSdk.deposits.initiateDeposit(bitcoinRecoveryAddress);
      console.log("Deposit initiated:", deposit);
      setDepositSetup(deposit)
      // Step 5: Get the Bitcoin deposit address
      const bitcoinDepositAddress = await deposit.getBitcoinAddress();
      console.log("Bitcoin deposit address:", bitcoinDepositAddress);
      setWalletAddress(bitcoinDepositAddress)
      await generateQRCode(bitcoinDepositAddress);
      // Inform the user to send BTC to the deposit address
      // alert(`Send BTC to the deposit address: ${bitcoinDepositAddress}`);
  
      // Step 6: Monitor the Bitcoin funding and initiate minting
      // Wait for the user to complete the deposit (manual step required)
      // console.log("Waiting for Bitcoin funding to complete...");
  
      // // Initiate minting using the latest funding UTXO
      // const txHash = await deposit.initiateMinting();
      // console.log("Minting initiated, transaction hash:", txHash);
  
      // alert(`Minting initiated successfully! Transaction hash: ${txHash}`);
    } catch (error) {
      console.error("Error during deposit process:", error);
    }
  }


  const mint = async()=>{
    try {
         const txHash = await depositSetup.initiateMinting();
      console.log("Minting initiated, transaction hash:", txHash);
    } catch (error) {
      console.log("setSdkTbtc-->",error)
    }
  }
  return (
    <>
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
              qrCode={qrCode}
              loading={loading}
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
                            onClick={() => setBtcExchange(!btcExchange)}
                            className="d-flex align-items-center justify-content-center commonBtn"
                          >
                            Send
                          </Button>
                          <Button
                            onClick={() => startReceive()}
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
