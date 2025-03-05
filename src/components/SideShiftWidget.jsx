import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import dynamic from 'next/dynamic';

// Dynamically import the script to ensure it only loads on client-side
const DynamicSideShiftScript = dynamic(() => 
  import('./SideShiftScript'), 
  { ssr: false }
);

export default function SideShiftWidget({
  buttonText = "Shift Crypto",
  buttonColor = "rgb(232, 90, 67)",
  textColor = "rgb(17, 11, 11)",
  showProgrammatic = false,
  onClick = () => {},
}) {
  const userAuth = useSelector((state) => state.Auth);
  const [isClient, setIsClient] = useState(false);
  const [sideShiftReady, setSideShiftReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent rendering of client-specific content during SSR
  if (!isClient) {
    return (
      <button 
        disabled 
        className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
      >
        {buttonText}
      </button>
    );
  }

  const handleWidgetOpen = () => {
    if (typeof window !== 'undefined' && window.sideshift) {
      window.sideshift?.show();
      onClick();
    }
  };

  return (
    <>
      {userAuth?.walletAddress && (
        <DynamicSideShiftScript 
          walletAddress={userAuth.walletAddress}
          onReady={() => setSideShiftReady(true)}
        />
      )}
      <button
        onClick={handleWidgetOpen}
        disabled={!sideShiftReady}
        className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
      >
        {buttonText}
      </button>
    </>
  );
}