import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.createElement("div");
rootElement.id = "vc-react-app";

const globalStyles = document.createElement("style");
// globalStyles.innerHTML = `
//   #${rootElement.id} {
//   position: fixed;
//   // right: 0;
//   // top: 0;
//   width: 100vw;
//   height: 100vh;
//   background: red;
//   z-index: 999999999;
//   }
// `;
document.body.appendChild(rootElement);
document.body.appendChild(globalStyles);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
