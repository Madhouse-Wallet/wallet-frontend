"use client";

import { useEffect, useState } from "react";

interface SideShiftProps {
  parentAffiliateId?: string;
  defaultDepositMethodId?: string;
  defaultSettleMethodId?: string;
  settleAddress?: string;
  type?: "variable" | "fixed";
  settleAmount?: number;
  theme?: "light" | "dark";
  buttonText?: string;
  buttonColor?: string;
  textColor?: string;
  showProgrammatic?: boolean;
  onClick:any;
}

declare global {
  interface Window {
    __SIDESHIFT__: any;
    sideshift: {
      show: () => void;
      hide: () => void;
      addEventListener: (event: string, callback: (data: any) => void) => void;
    };
  }
}

export default function SideShiftIntegration({
  parentAffiliateId = "UHNxssRFo",
  defaultDepositMethodId = "btc",
  defaultSettleMethodId = "usdcarb",
  settleAddress,
  type = "variable",
  settleAmount,
  theme = "light",
  buttonText = "Shift Crypto",
  buttonColor = "rgb(232, 90, 67)",
  textColor = "rgb(17, 11, 11)",
  showProgrammatic = false,
  onClick
}: SideShiftProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log helper function
  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  useEffect(() => {
    // Configure SideShift global object
    window.__SIDESHIFT__ = {
      parentAffiliateId,
      defaultDepositMethodId,
      defaultSettleMethodId,
      settleAddress,
      type,
      settleAmount,
      theme,
    };

    // Create script element
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://sideshift.ai/static/js/main.js";
    script.async = true;

    // Set up onload handler
    script.onload = () => {
      addLog("SideShift script loaded successfully");
      setIsScriptLoaded(true);

      // Set up event listeners once script is loaded
      if (window.sideshift) {
        window.sideshift.addEventListener("settled", (deposits) => {
          addLog(`Settled event: ${deposits.length} deposits`);
          console.log("Settled deposits:", deposits);
        });

        window.sideshift.addEventListener("deposit", (deposits) => {
          addLog(`Deposit event: ${deposits.length} deposits`);
          console.log("Deposits:", deposits);
        });

        window.sideshift.addEventListener("order", (order) => {
          addLog(`Order created: ${order.orderId}`);
          console.log("Order:", order);
        });

        // Auto-show if programmatic option is enabled
        if (showProgrammatic) {
          setTimeout(() => {
            window.sideshift.show();
          }, 500);
        }
      }
    };

    // script.onload = () => {
    //   console.log("✅ SideShift script loaded");
    //   addLog("SideShift script loaded successfully");
    //   setIsScriptLoaded(true);
    
    //   let checkInterval = setInterval(() => {
    //     if (window.sideshift) {
    //       console.log("🚀 SideShift initialized!");
    //       clearInterval(checkInterval);
    
    //       window.sideshift.addEventListener("settled", (deposits) => {
    //         addLog(`Settled event: ${deposits.length} deposits`);
    //         console.log("Settled deposits:", deposits);
    //       });
    
    //       window.sideshift.addEventListener("deposit", (deposits) => {
    //         addLog(`Deposit event: ${deposits.length} deposits`);
    //         console.log("Deposits:", deposits);
    //       });
    
    //       window.sideshift.addEventListener("order", (order) => {
    //         addLog(`Order created: ${order.orderId}`);
    //         console.log("Order:", order);
    //       });
    
    //       // Auto-show if programmatic option is enabled
    //       console.log("line-98", showProgrammatic);
    //       if (showProgrammatic) {
    //         console.log("line-100", showProgrammatic);
    //         setTimeout(() => {
    //           console.log("🔥 Opening SideShift...");
    //           window.sideshift.show();
    //         }, 500);
    //       }
    //     }
    //   }, 200); // Check every 200ms
    
    //   setTimeout(() => {
    //     clearInterval(checkInterval);
    //     if (!window.sideshift) {
    //       console.error("❌ SideShift failed to initialize");
    //     }
    //   }, 5000); // Timeout after 5 seconds
    // };

    script.onerror = (error) => {
      addLog("Error loading SideShift script");
      console.error("Error loading SideShift script:", error);
    };

    // Append script to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      try {
        document.head.removeChild(script);
        delete window.__SIDESHIFT__;
        setIsScriptLoaded(false);
      } catch (error) {
        console.error("Error cleaning up SideShift script:", error);
      }
    };
  }, [
    parentAffiliateId,
    defaultDepositMethodId,
    defaultSettleMethodId,
    settleAddress,
    type,
    settleAmount,
    theme,
    showProgrammatic,
  ]);

  // Button styling for Option 1
  const buttonStyle = `
    #sideshift-modal-button {
      -webkit-appearance: none;
      color: ${textColor};
      background-color: ${buttonColor};
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      text-transform: uppercase;
      font-size: 1rem;
      line-height: 1.5rem;
      text-align: center;
      padding: 0.875rem 1rem;
      border-radius: 0.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 3rem;
      min-width: 13rem;
      border: none;
      cursor: pointer;
      margin: 0 auto;
    }
    #sideshift-modal-button:hover {
      opacity: 0.9;
    }
  `;

  return (
    <button
      onClick={() => {
        window.sideshift?.show(),
        // setPointSale(!pointSale);
        onClick()
      }}
      id="sideshift-modal-button"
      disabled={!isScriptLoaded}
      className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
    >
      {buttonText}
    </button>
  );
}
