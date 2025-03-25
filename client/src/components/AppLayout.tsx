import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Wallet,
  PieChart,
  PlusCircle,
} from "lucide-react";
import MobileNav from "@/components/MobileNav";
import TransactionForm from "@/components/TransactionForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AppLayoutProps {
  children: ReactNode;
  userId: number;
}

export default function AppLayout({ children, userId }: AppLayoutProps) {
  const [location] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openTransactionForm = () => setIsFormOpen(true);
  const closeTransactionForm = () => setIsFormOpen(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { path: "/transactions", label: "Transactions", icon: <Wallet className="mr-3 h-5 w-5" /> },
    { path: "/budgets", label: "Budgets", icon: <PieChart className="mr-3 h-5 w-5" /> },
    { path: "/reports", label: "Reports", icon: <BarChart3 className="mr-3 h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Wallet className="text-primary text-2xl h-8 w-8 mr-2" />
            <h1 className="font-medium text-xl text-neutral-500">BudgetTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative">
              <button className="flex items-center">
                <span className="mr-2 text-sm font-medium text-neutral-400">John Doe</span>
                <div className="bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-sm font-medium">JD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar - Desktop */}
        <aside className="bg-white shadow-sm md:w-64 hidden md:block">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={cn(
                        "flex items-center p-2 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500",
                        location === item.path &&
                          "bg-primary-light bg-opacity-10 text-primary"
                      )}
                    >
                      {item.icon}
                      <span className={cn(location === item.path && "font-medium")}>
                        {item.label}
                      </span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#f5f5f5]">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        currentPath={location}
        onAddTransaction={openTransactionForm}
      />

      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <TransactionForm userId={userId} onSuccess={closeTransactionForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
