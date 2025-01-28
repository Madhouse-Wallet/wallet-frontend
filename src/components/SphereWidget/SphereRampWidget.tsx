// components/SphereRampWidget.tsx
"use client";

import { useEffect } from "react";

interface SphereRampProps {
  applicationId: string;
  debug?: boolean;
  theme?: {
    color?:
      | "default"
      | "zinc"
      | "slate"
      | "stone"
      | "gray"
      | "neutral"
      | "red"
      | "rose"
      | "orange"
      | "green"
      | "yellow"
      | "violet";
    radius?: "default" | "none" | "sm" | "lg" | "xl";
    components?: {
      logo?: string;
    };
  };
}

declare global {
  interface Window {
    SphereRamp: any;
  }
}

export default function SphereRampWidget({
  applicationId,
  debug = true, // Set debug to true by default for testing
  theme,
}: SphereRampProps) {
  useEffect(() => {
    // Create script element
    const script = document.createElement("script");
    script.type = "module";
    script.crossOrigin = "";
    script.src = "https://spherepay.co/packages/sphere-ramp/index.js";

    // Initialize Sphere Ramp when script loads
    script.onload = () => {
      if (window.SphereRamp) {
        new window.SphereRamp({
          containerId: "sphere-ramp-container",
          applicationId,
          debug,
          theme,
        });
      }
    };

    // Append script to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, [applicationId, debug, theme]);

  return <div id="sphere-ramp-container" className="w-full h-[600px]" />;
}
