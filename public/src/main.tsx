import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

console.log("main.tsx is loading...");

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
