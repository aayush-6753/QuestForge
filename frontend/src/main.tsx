import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider";
import { AppErrorBoundary } from "./components/ui/AppErrorBoundary";
import { AppRoutes } from "./routes/AppRoutes";
import { queryClient } from "./lib/query-client";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AppErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
