import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.tsx";
import AuthGate from "./providers/AuthGate.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthGate>
        <BrowserRouter>
          <Toaster position="top-center" />
          <App />
        </BrowserRouter>
      </AuthGate>
    </ErrorBoundary>
  </StrictMode>,
);
