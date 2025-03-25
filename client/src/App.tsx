import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/AppLayout";

// Simplified auth for demo purposes
function useAuth() {
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const login = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "johndoe", password: "password" }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setUserId(data.userId);
      localStorage.setItem("userId", data.userId.toString());
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${data.username}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please try again later.",
      });
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    } else {
      login();
    }
  }, []);

  return { userId };
}

function Router() {
  const { userId } = useAuth();

  if (userId === null) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AppLayout userId={userId}>
      <Switch>
        <Route path="/" component={() => <Dashboard userId={userId} />} />
        <Route path="/transactions" component={() => <Transactions userId={userId} />} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
