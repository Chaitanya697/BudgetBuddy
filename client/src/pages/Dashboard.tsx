import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import SummaryCard from "@/components/SummaryCard";
import ExpenseBreakdownChart from "@/components/ExpenseBreakdownChart";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import RecentTransactions from "@/components/RecentTransactions";
import TransactionForm from "@/components/TransactionForm";

interface DashboardProps {
  userId: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dateRange, setDateRange] = useState<"this-month" | "last-month" | "last-3-months" | "this-year" | "custom">("this-month");
  
  // Calculate date range based on selection
  const getDateRangeValues = () => {
    const now = new Date();
    
    switch (dateRange) {
      case "this-month":
        return {
          startDate: format(startOfMonth(now), "yyyy-MM-dd"),
          endDate: format(endOfMonth(now), "yyyy-MM-dd"),
        };
      case "last-month":
        const lastMonth = subMonths(now, 1);
        return {
          startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
          endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
        };
      case "last-3-months":
        return {
          startDate: format(startOfMonth(subMonths(now, 2)), "yyyy-MM-dd"),
          endDate: format(endOfMonth(now), "yyyy-MM-dd"),
        };
      case "this-year":
        return {
          startDate: format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd"),
          endDate: format(new Date(now.getFullYear(), 11, 31), "yyyy-MM-dd"),
        };
      // For custom, we would need a date picker component
      default:
        return {
          startDate: format(startOfMonth(now), "yyyy-MM-dd"),
          endDate: format(endOfMonth(now), "yyyy-MM-dd"),
        };
    }
  };
  
  const dateRangeValues = getDateRangeValues();
  
  // Query to fetch summary data
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/summary", userId, dateRangeValues],
    queryFn: async () => {
      const { startDate, endDate } = dateRangeValues;
      const response = await fetch(
        `/api/summary?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch summary");
      return response.json();
    },
  });

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-medium text-neutral-500 mb-2 sm:mb-0">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Select
              value={dateRange}
              onValueChange={(value: any) => setDateRange(value)}
            >
              <SelectTrigger className="w-[180px] bg-white border border-neutral-200 text-sm font-medium text-neutral-400">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryLoading ? (
          // Loading skeletons for summary cards
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 flex justify-center items-center h-[120px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ))
        ) : (
          // Render actual summary cards
          <>
            <SummaryCard
              title="Income"
              amount={summary?.income || 0}
              changePercentage={12.5}
              type="income"
            />
            <SummaryCard
              title="Expenses"
              amount={summary?.expenses || 0}
              changePercentage={8.2}
              type="expense"
            />
            <SummaryCard
              title="Balance"
              amount={summary?.balance || 0}
              changePercentage={23.4}
              type="balance"
            />
            <SummaryCard
              title="Savings Rate"
              amount={summary?.savingsRate || 0}
              type="savings"
              goal={40}
            />
          </>
        )}
      </div>

      {/* Charts and Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <ExpenseBreakdownChart userId={userId} dateRange={dateRangeValues} />
          <MonthlyTrendChart userId={userId} months={6} />
        </div>

        {/* Right Column: Recent Transactions */}
        <div>
          <RecentTransactions userId={userId} limit={5} />
        </div>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <TransactionForm userId={userId} onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
