import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "./queryClient";
import { User } from "@shared/schema";

// Simplest approach - don't use the useAuth hook in this component
// to avoid dependency issues. Instead, directly query the user.
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType;
}) {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        if (!user) {
          // Redirect to auth page if not authenticated
          setTimeout(() => setLocation("/auth"), 0);
          return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
              <div className="text-center">
                <p>Not authenticated. Redirecting to login...</p>
                <Loader2 className="h-6 w-6 animate-spin mx-auto mt-2 text-primary" />
              </div>
            </div>
          );
        }
        
        return <Component />;
      }}
    </Route>
  );
}