import { useEffect } from 'react';

// interface SideShiftScriptProps {
//   walletAddress: string;
//   onReady?: () => void;
// }

export default function SideShiftScript({ 
  walletAddress, 
  onReady 
}) {
  useEffect(() => {
    if (!walletAddress) return;

    // Ensure we're only running on the client
    if (typeof window !== 'undefined') {
      // Configure SideShift global configuration
      window.__SIDESHIFT__ = {
        parentAffiliateId: process.env.NEXT_PUBLIC_SIDESHIFT_PARENT_ID || "UHNxssRFo",
        defaultDepositMethodId: "btc",
        defaultSettleMethodId: "usdcarb",
        settleAddress: walletAddress,
        type: "variable",
        settleAmount: undefined,
        theme: "light",
      };

      // Dynamically load the script
      const script = document.createElement('script');
      script.src = "/api/sideshift-proxy";
      script.async = true;

      script.onload = () => {
        if (window.sideshift) {
          // Add event listeners
          window.sideshift.addEventListener("settled", handleSettledDeposits);
          window.sideshift.addEventListener("deposit", handleDeposits);
          window.sideshift.addEventListener("order", handleOrderCreation);

          onReady?.();
        }
      };

      script.onerror = (error) => {
        console.error("SideShift script loading error:", error);
      };

      document.head.appendChild(script);

      return () => {
        // Cleanup
        document.head.removeChild(script);
        delete window.__SIDESHIFT__;
      };
    }
  }, [walletAddress, onReady]);

  const handleSettledDeposits = (deposits) => {
    console.log(`Settled deposits: ${deposits.length}`, deposits);
  };

  const handleDeposits = (deposits) => {
    console.log(`Deposits: ${deposits.length}`, deposits);
  };

  const handleOrderCreation = (order) => {
    console.log(`Order created: ${order.orderId}`, order);
  };

  return null;
}