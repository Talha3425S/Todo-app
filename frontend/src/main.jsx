import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import { applyTheme, getInitialTheme } from "./theme";

// Apply saved (or system) theme before the first render to avoid a flash
applyTheme(getInitialTheme());

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);