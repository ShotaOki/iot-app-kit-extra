import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
/// <reference types="../vite-env-override.d.ts" />
/// <reference types="vite/client" />

window.global = window.global || {};
if (window.global.TextDecoder === undefined) {
  // arraybuffer-to-stringの判定のために必要
  // global.TextDecoderからTextDecoderが参照できないと文字化けを起こすため
  window.global.TextDecoder = TextDecoder;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
