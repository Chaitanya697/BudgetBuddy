import { useState } from "react";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { SummaryCards } from "@/components/summary-cards";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { ExpenseChart } from "@/components/expense-chart";
import { TransactionHistory } from "@/components/transaction-history";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// The ProtectedRoute component now handles authentication
// so Dashboard can focus purely on rendering the dashboard UI
export default function Dashboard() {
  const [period, setPeriod] = useState("thisMonth");
  
  // Main dashboard UI once authenticated
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      <SidebarNavigation />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 md:mb-0">Dashboard Overview</h2>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Period:</span>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="bg-white border border-gray-300 text-gray-700 rounded-md text-sm h-9 w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="last3Months">Last 3 Months</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <SummaryCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <AddTransactionForm />
              <ExpenseChart />
            </div>
            
            <div className="lg:col-span-2">
              <TransactionHistory />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
