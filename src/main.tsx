import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeDatabase } from "./db/seed";
import "./index.css";

// Seed initial database state asynchronously
initializeDatabase().catch(console.error);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
