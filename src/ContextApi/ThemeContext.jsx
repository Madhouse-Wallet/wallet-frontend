import React, { createContext, useState, useEffect, useContext } from "react";

// Default theme variables
const themeVariables = {
  light: {
    backgroundColor: "#fff",
    backgroundColor2: "#fffefe",
    textColor: "#000000",
    textColor2: "#383838",
    cardBg: "#ffece5",
    cardBg2: "#e7e7e7",
    lightBtn: "#b8b8b8",
  },
  dark: {
    backgroundColor: "#0a0915",
    backgroundColor2: "#0a0915",
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
  // Initialize theme (default: dark)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark"; // Ensure dark mode is default
    }
    return "dark"; // Fallback for SSR
  });

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  // Apply the theme variables to the root element and update body class
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const body = document.body;
      const currentTheme = themeVariables[theme];

      // Set CSS variables
      Object.entries(currentTheme).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });

      // Remove existing theme class and add new one
      body.classList.remove("light", "dark");
      body.classList.add(theme);
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
