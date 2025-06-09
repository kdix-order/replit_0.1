import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/accessibility.css";

const root = document.getElementById("root");
if (root) {
  root.setAttribute("role", "application");
  root.setAttribute("aria-label", "味店焼マン アプリケーション");
  
  createRoot(root).render(<App />);
}
