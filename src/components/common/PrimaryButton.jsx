import React from "react";

const PRIMARY_BUTTON_CLASSES =
  "bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50";

const PrimaryButton = ({ className = "", children, ...props }) => (
  <button className={`${PRIMARY_BUTTON_CLASSES} ${className}`} {...props}>
    {children}
  </button>
);

export default PrimaryButton; 