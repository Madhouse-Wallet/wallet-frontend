import React from "react";
import { LiFiWidget, WidgetConfig } from "@lifi/widget";
const LiFiWidgett = () => {
  const widgetConfig: WidgetConfig = {
    theme: {
      container: {
        border: "1px solid rgb(234, 234, 234)",
        borderRadius: "16px",
      },
    },
    integrator: "Madhouse Wallet",
  };
  return <LiFiWidget integrator="Madhouse Wallet" config={widgetConfig} />;
};
export default LiFiWidgett;
