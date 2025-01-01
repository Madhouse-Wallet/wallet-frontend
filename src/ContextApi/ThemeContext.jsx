import React, { createContext, useState, useEffect, useContext } from "react";

// Default theme variables
const themeVariables = {
  light: {
    backgroundColor: "#fff",
    textColor: "#000000",
    textColor2: "#383838",
    cardBg: "#fff5f1",
    cardBg2: "#fff5f1",
    lightBtn: "#b8b8b8",
  },
  dark: {
    backgroundColor: "#0d1017",
    textColor: "#fff",
    textColor2: "#fff",
    cardBg: "#1e1e1e",
    cardBg2: "#000",
    lightBtn: "#424040",
  },
};

// Create the context
const ThemeContext = createContext(undefined);

// ThemeProvider Component
export const ThemeProvider = ({ children }) => {
  // Initialize theme (use 'dark' by default or localStorage value)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    return "dark";
  });

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  // Apply the theme variables to the root element
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const currentTheme = themeVariables[theme];

      Object.entries(currentTheme).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for Theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
