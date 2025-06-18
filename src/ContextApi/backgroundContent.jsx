"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { getUser, updtUser } from "../lib/apiCall";
import { useDispatch, useSelector } from "react-redux";

// Create Context
const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const userAuth = useSelector((state) => state.Auth);
  const backgrounds = [
    process.env.NEXT_PUBLIC_IMAGE_URL + "6.jpg",
    process.env.NEXT_PUBLIC_IMAGE_URL + "4.jpg",
    process.env.NEXT_PUBLIC_IMAGE_URL + "5.jpg",
    process.env.NEXT_PUBLIC_IMAGE_URL + "2.jpg",
    process.env.NEXT_PUBLIC_IMAGE_URL + "3.jpg",
    process.env.NEXT_PUBLIC_IMAGE_URL + "1.jpg",
  ];
  const watermarks = [
    process.env.NEXT_PUBLIC_IMAGE_URL + "w3.png",
    process.env.NEXT_PUBLIC_IMAGE_URL + "w4.png",
    process.env.NEXT_PUBLIC_IMAGE_URL + "w1.png",
    process.env.NEXT_PUBLIC_IMAGE_URL + "w2.png",
  ];
  const settingUpdt = async (data) => {
    try {
      if (userAuth.email) {
        let data1 = await updtUser(
          { email: userAuth.email },
          {
            $set: data, // Ensure this is inside `$set`
          }
        );
      }
    } catch (error) {
      console.log("setting updt-->", error);
    }
  };
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
  const selectBg = (index, type = true) => {
    setSelectedBackground(backgrounds[index]);
    if (typeof window !== "undefined") {
      localStorage.setItem("backgroundIndex", index);
      if (type) {
        settingUpdt({ backgroundIndex: index });
      }
    }
  };

  // Function to change watermark and store in localStorage
  const selectWm = (index, type = true) => {
    setSelectedWatermark(watermarks[index]);
    if (typeof window !== "undefined") {
      localStorage.setItem("watermarkIndex", index);
      if (type) {
        settingUpdt({ watermarkIndex: index });
      }
    }
  };

  // Function to change background opacity and store in localStorage
  const changeBgOpacity = (opacity, type = true) => {
    setBgOpacity(opacity);
    if (typeof window !== "undefined") {
      localStorage.setItem("bgOpacity", opacity);
      if (type) {
        settingUpdt({ bgOpacity: opacity });
      }

    }
  };

  // Function to change watermark opacity and store in localStorage
  const changeWmOpacity = (opacity, type = true) => {
    setWmOpacity(opacity);
    if (typeof window !== "undefined") {
      localStorage.setItem("wmOpacity", opacity);
      if (type) {
        settingUpdt({ wmOpacity: opacity });
      }

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
