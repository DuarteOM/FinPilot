import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FinPilotApp from "./FinPilotApp";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FinPilotApp />
  </StrictMode>,
);
