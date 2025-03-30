import { useAuth } from "@/hooks/use-auth";
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

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      await logoutMutation.mutateAsync();
      
      // After successful logout, force a page reload to the auth page
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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