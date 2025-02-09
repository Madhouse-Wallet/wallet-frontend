"use client";
import { createContext, useState, useEffect, useContext } from "react";
import img1 from "@/Assets/Images/umbrel/1.jpg";
import img2 from "@/Assets/Images/umbrel/2.jpg";
import img3 from "@/Assets/Images/umbrel/3.jpg";
import img4 from "@/Assets/Images/umbrel/4.jpg";
import img5 from "@/Assets/Images/umbrel/5.jpg";
import img6 from "@/Assets/Images/umbrel/6.jpg";
import w1 from "@/Assets/Images/umbrel/w1.png";
import w2 from "@/Assets/Images/umbrel/w2.png";
import w3 from "@/Assets/Images/umbrel/w3.png";
import w4 from "@/Assets/Images/umbrel/w4.png";

// Create Context
const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const backgrounds = [img6, img4, img5, img2, img3, img1];
  const watermarks = [w3, w4, w1, w2];

  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0]);
  const [selectedWatermark, setSelectedWatermark] = useState(watermarks[0]);

  // Opacity states
  const [bgOpacity, setBgOpacity] = useState(1); // Full visibility
  const [wmOpacity, setWmOpacity] = useState(0.5); // 50% visibility

  // Load stored values from localStorage only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const bgIndex = localStorage.getItem("backgroundIndex");
      const wmIndex = localStorage.getItem("watermarkIndex");
      const storedBgOpacity = localStorage.getItem("bgOpacity");
      const storedWmOpacity = localStorage.getItem("wmOpacity");

      if (bgIndex !== null) {
        setSelectedBackground(backgrounds[Number(bgIndex)]);
      }

      if (wmIndex !== null) {
        setSelectedWatermark(watermarks[Number(wmIndex)]);
      }

      if (storedBgOpacity !== null) {
        setBgOpacity(parseFloat(storedBgOpacity));
      }

      if (storedWmOpacity !== null) {
        setWmOpacity(parseFloat(storedWmOpacity));
      }
    }
  }, []);

  // Function to change background and store in localStorage
  const selectBg = (index) => {
    setSelectedBackground(backgrounds[index]);
    if (typeof window !== "undefined") {
      localStorage.setItem("backgroundIndex", index);
    }
  };

  // Function to change watermark and store in localStorage
  const selectWm = (index) => {
    setSelectedWatermark(watermarks[index]);
    if (typeof window !== "undefined") {
      localStorage.setItem("watermarkIndex", index);
    }
  };

  // Function to change background opacity and store in localStorage
  const changeBgOpacity = (opacity) => {
    setBgOpacity(opacity);
    if (typeof window !== "undefined") {
      localStorage.setItem("bgOpacity", opacity);
    }
  };

  // Function to change watermark opacity and store in localStorage
  const changeWmOpacity = (opacity) => {
    setWmOpacity(opacity);
    if (typeof window !== "undefined") {
      localStorage.setItem("wmOpacity", opacity);
    }
  };

  return (
    <BackgroundContext.Provider
      value={{
        selectBg,
        selectWm,
        changeBgOpacity,
        changeWmOpacity,
        selectedBackground,
        selectedWatermark,
        backgrounds,
        watermarks,
        setSelectedBackground,
        setSelectedWatermark,
        bgOpacity,
        setBgOpacity,
        wmOpacity,
        setWmOpacity,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => useContext(BackgroundContext);
