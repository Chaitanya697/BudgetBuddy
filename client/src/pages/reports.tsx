import { useState } from "react";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { ExpenseChart } from "@/components/expense-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PeriodType } from "@/hooks/use-transactions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, TrendingUp, Banknote } from "lucide-react";

export default function Reports() {
  const [period, setPeriod] = useState<PeriodType>("thisMonth");

  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">Track and analyze your spending patterns</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className="text-sm text-gray-500">Period:</span>
            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodType)}>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 opacity-10">
              <img src="/attached_assets/image_1743321156541.png" alt="" className="w-full h-full" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-5 w-5" /> Expense Breakdown
              </CardTitle>
              <CardDescription>Analyze where your money is going</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ExpenseChart period={period} />
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 opacity-10">
              <img src="/attached_assets/image_1743321179705.png" alt="" className="w-full h-full" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" /> Spending Trends
              </CardTitle>
              <CardDescription>Track how your spending changes over time</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 h-[400px] flex items-center justify-center">
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <p className="text-muted-foreground">Monthly spending trend chart coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="relative overflow-hidden">
          <div className="absolute right-4 top-4 w-16 h-16 opacity-10">
            <img src="/attached_assets/image_1743321165731.png" alt="" className="w-full h-full" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Banknote className="mr-2 h-5 w-5" /> Savings Potential
            </CardTitle>
            <CardDescription>Discover areas where you could save more</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 h-[300px] flex items-center justify-center">
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Savings opportunity analysis coming soon</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}