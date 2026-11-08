import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// @ts-expect-error CSS imports are handled by the bundler.
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
