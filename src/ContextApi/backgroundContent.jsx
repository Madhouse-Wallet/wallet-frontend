import { createContext, useState, useContext } from "react";
import img1 from "@/Assets/Images/umbrel/1.jpg";
import img2 from "@/Assets/Images/umbrel/2.jpg";
import img3 from "@/Assets/Images/umbrel/3.jpg";
import img4 from "@/Assets/Images/umbrel/4.jpg";
import img5 from "@/Assets/Images/umbrel/5.jpg";
import w1 from "@/Assets/Images/umbrel/w1.png";
import w2 from "@/Assets/Images/umbrel/w2.png";
import w3 from "@/Assets/Images/umbrel/w3.png";
import w4 from "@/Assets/Images/umbrel/w4.png";

// Create Context
const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const backgrounds = [img1, img2, img3, img4, img5];
  const watermarks = [w1, w2, w3, w4];

  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0]);
  const [selectedWatermark, setSelectedWatermark] = useState(watermarks[0]);

  // Opacity states
  const [bgOpacity, setBgOpacity] = useState(1); // Full visibility
  const [wmOpacity, setWmOpacity] = useState(0.5); // 50% visibility

  return (
    <BackgroundContext.Provider
      value={{
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
