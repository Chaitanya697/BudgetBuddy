import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";
import "./index.css";

// We're no longer using the AuthProvider since components directly use API calls
const root = createRoot(document.getElementById("root")!);

// Simple component to handle providers setup
function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  );
}

root.render(<AppWithProviders />);
