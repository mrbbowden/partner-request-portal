import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx is loading...");

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, looking for root element...");
  
  const rootElement = document.getElementById("root");
  console.log("Root element:", rootElement);

  if (rootElement) {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    
    console.log("Rendering React app...");
    root.render(<App />);
    console.log("React app rendered successfully!");
  } else {
    console.error("Root element not found!");
  }
});
