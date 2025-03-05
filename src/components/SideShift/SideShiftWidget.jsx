"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function SideShiftIntegration({
  buttonText = "Shift Crypto",
  buttonColor = "rgb(232, 90, 67)",
  textColor = "rgb(17, 11, 11)",
  showProgrammatic = false,
  onClick = () => {},
}) {
  const userAuth = useSelector((state) => state.Auth);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  useEffect(() => {
    setIsScriptLoaded(true);
    if (!userAuth?.walletAddress) return;

    console.log("details", userAuth?.walletAddress);

    window.__SIDESHIFT__ = {
      parentAffiliateId: process.env.NEXT_PUBLIC_SIDE_SHIFT_PARENT_ID,
      defaultDepositMethodId: "btc",
      defaultSettleMethodId: "usdcarb",
      settleAddress: userAuth?.walletAddress,
      type: "variable",
      settleAmount: undefined,
      theme: "light",
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://sideshift.ai/static/js/main.js";
    script.async = true;

    script.onload = () => {
      addLog("SideShift script loaded successfully");
      setIsScriptLoaded(true);

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

        if (showProgrammatic) {
          setTimeout(() => {
            window.sideshift.show();
          }, 500);
        }
      }
    };

    script.onerror = (error) => {
      addLog("Error loading SideShift script");
      console.error("Error loading SideShift script:", error);
    };

    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(script);
        delete window.__SIDESHIFT__;
        setIsScriptLoaded(false);
      } catch (error) {
        console.error("Error cleaning up SideShift script:", error);
      }
    };
  }, [showProgrammatic, userAuth?.walletAddress]);

  return (
    <button
      onClick={() => {
        window.sideshift?.show();
        onClick();
      }}
      id="sideshift-modal-button"
      disabled={!isScriptLoaded}
      // style={{
      //   color: textColor,
      //   backgroundColor: buttonColor,
      //   transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
      //   textTransform: "uppercase",
      //   fontSize: "1rem",
      //   lineHeight: "1.5rem",
      //   textAlign: "center",
      //   padding: "0.875rem 1rem",
      //   borderRadius: "0.25rem",
      //   display: "flex",
      //   justifyContent: "center",
      //   alignItems: "center",
      //   height: "3rem",
      //   minWidth: "13rem",
      //   border: "none",
      //   cursor: "pointer",
      //   margin: "0 auto",
      // }}
      className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
    >
      {buttonText}
    </button>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// export default function SideShiftIntegration({
//   buttonText = "Shift Crypto",
//   buttonColor = "rgb(232, 90, 67)",
//   textColor = "rgb(17, 11, 11)",
//   showProgrammatic = false,
//   onClick = () => {},
// }) {
//   const userAuth = useSelector((state) => state.Auth);
//   const [isScriptLoaded, setIsScriptLoaded] = useState(false);
//   const [logs, setLogs] = useState([]);

//   const addLog = (message) => {
//     setLogs((prev) => [
//       ...prev,
//       `${new Date().toLocaleTimeString()}: ${message}`,
//     ]);
//   };

//   useEffect(() => {
//     if (!userAuth?.walletAddress) return;

//     console.log("details", userAuth?.walletAddress);

//     try {
//       window.__SIDESHIFT__ = {
//         parentAffiliateId: "UHNxssRFo",
//         defaultDepositMethodId: "btc",
//         defaultSettleMethodId: "usdcarb",
//         settleAddress: userAuth?.walletAddress,
//         type: "variable",
//         settleAmount: undefined,
//         theme: "light",
//       };

//       const script = document.createElement("script");
//       script.type = "text/javascript";
//       script.src = "/api/sideshift-proxy"; // Load from our API route
//       script.async = true;

//       script.onload = () => {
//         addLog("SideShift script loaded successfully");
//         setIsScriptLoaded(true);

//         if (window.sideshift) {
//           window.sideshift.addEventListener("settled", (deposits) => {
//             addLog(`Settled event: ${deposits.length} deposits`);
//             console.log("Settled deposits:", deposits);
//           });

//           window.sideshift.addEventListener("deposit", (deposits) => {
//             addLog(`Deposit event: ${deposits.length} deposits`);
//             console.log("Deposits:", deposits);
//           });

//           window.sideshift.addEventListener("order", (order) => {
//             addLog(`Order created: ${order.orderId}`);
//             console.log("Order:", order);
//           });

//           if (showProgrammatic) {
//             setTimeout(() => {
//               window.sideshift.show();
//             }, 500);
//           }
//         }
//       };

//       script.onerror = (error) => {
//         addLog("Error loading SideShift script");
//         console.error("Error loading SideShift script:", error);
//       };

//       document.head.appendChild(script);

//       return () => {
//         try {
//           document.head.removeChild(script);
//           delete window.__SIDESHIFT__;
//           setIsScriptLoaded(false);
//         } catch (error) {
//           console.error("Error cleaning up SideShift script:", error);
//         }
//       };
//     } catch (error) {
//       console.log(error);
//     }
//   }, [showProgrammatic, userAuth?.walletAddress]);

//   return (
//     <button
//       onClick={() => {
//         window.sideshift?.show();
//         onClick();
//       }}
//       id="sideshift-modal-button"
//       disabled={!isScriptLoaded}
//       className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
//     >
//       {buttonText}
//     </button>
//   );
// }
