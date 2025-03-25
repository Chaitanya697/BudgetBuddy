import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wallet, PlusCircle, PieChart, Settings } from "lucide-react";

interface MobileNavProps {
  currentPath: string;
  onAddTransaction: () => void;
}

export default function MobileNav({ currentPath, onAddTransaction }: MobileNavProps) {
  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="text-xl" /> },
    { path: "/transactions", label: "Transactions", icon: <Wallet className="text-xl" /> },
    { path: "/budgets", label: "Budgets", icon: <PieChart className="text-xl" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="text-xl" /> },
  ];

  return (
    <nav className="md:hidden bg-white shadow-md border-t border-neutral-200">
      <div className="flex justify-around">
        {navItems.slice(0, 2).map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "flex flex-col items-center py-2 px-4",
                currentPath === item.path ? "text-primary" : "text-neutral-400"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
        
        <button
          onClick={onAddTransaction}
          className="flex flex-col items-center py-2 px-4"
        >
          <div className="bg-primary rounded-full p-3 -mt-6 shadow-md">
            <PlusCircle className="text-white h-5 w-5" />
          </div>
        </button>
        
        {navItems.slice(2).map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "flex flex-col items-center py-2 px-4",
                currentPath === item.path ? "text-primary" : "text-neutral-400"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
