import React from "react";
import Herosec from "./Herosec";
import BlockChainSolution from "./blockChainSolution";
import WhyChoose from "./WhyChoose";
import FeatureSec from "./FeatureSec";
import HowWeWorkSec from "./HowWeWork";
import SolutionSec from "./SolutionSec";
import Footer from "@/components/Footer/index";
import JoinUsSec from "./JoinUs";

const LandingPage: React.FC = () => {
  return (
    <>
      <Herosec />
      {/* <BlockChainSolution /> */}
      <SolutionSec />
      {/* <WhyChoose /> */}
      {/* <FeatureSec />
      <HowWeWorkSec /> */}
      <JoinUsSec />
      <Footer />
    </>
  );
};

export default LandingPage;
