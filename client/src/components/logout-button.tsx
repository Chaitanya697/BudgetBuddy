import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  iconOnly?: boolean;
}

export function LogoutButton({ 
  variant = "ghost", 
  size = "sm", 
  className = "",
  iconOnly = false
}: LogoutButtonProps) {
  const { logoutMutation } = useAuth();
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setIsLoggedOut(true);
      }
    });
  };

  if (isLoggedOut) {
    return <Redirect to="/auth" />;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      disabled={logoutMutation.isPending}
    >
      <LogOut className={`h-4 w-4 ${!iconOnly ? "mr-2" : ""}`} />
      {!iconOnly && <span>Logout</span>}
    </Button>
  );
}