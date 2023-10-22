import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
/// <reference types="../vite-env-override.d.ts" />
/// <reference types="vite/client" />

window.global = window.global || {};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
