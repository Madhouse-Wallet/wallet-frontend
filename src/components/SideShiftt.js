import { useEffect } from 'react';

export default function SideShift() {
  useEffect(() => {
    // Create the first script element
    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.__SIDESHIFT__ = {
        parentAffiliateId: "UHNxssRFo",
        defaultDepositMethodId: "btc",
        defaultSettleMethodId: "usdcarb",
        settleAddress: "0x154975aB54a95244AD17cF56d321b7d3b010e85F",
        type: "variable",
        settleAmount: undefined,
        theme: "light",
      };
    `;
    document.head.appendChild(configScript);

    // Create the second script element
    const mainScript = document.createElement('script');
    mainScript.src = "https://sideshift.ai/static/js/main.js";
    document.head.appendChild(mainScript);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(configScript);
      document.head.removeChild(mainScript);
    };
  }, []);

  return null; // This component doesn't render anything
}