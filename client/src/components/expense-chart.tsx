import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryById } from "@/lib/categories";
import { COLORS } from "@/lib/utils";

type PeriodOption = "thisMonth" | "lastMonth" | "last3Months";

export function ExpenseChart() {
  const { summary, isSummaryLoading } = useTransactions();
  const [period, setPeriod] = useState<PeriodOption>("thisMonth");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  
  useEffect(() => {
    // Always clean up existing chart first 
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    
    // Only proceed with creating a new chart if we have data
    if (isSummaryLoading || !summary?.expenseBreakdown || !chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // If there's no expense data, don't create a chart
    if (summary.expenseBreakdown.length === 0) return;
    
    const sortedExpenses = [...summary.expenseBreakdown]
      .sort((a, b) => b.amount - a.amount);
    
    const labels = sortedExpenses.map(item => getCategoryById(item.category).label);
    const data = sortedExpenses.map(item => item.percentage);
    const backgroundColors = sortedExpenses.map((item, index) => {
      const category = getCategoryById(item.category);
      return category.color || COLORS.chart[index % COLORS.chart.length];
    });
    
    let chartCreated = false;
    
    // Dynamically import Chart.js to reduce initial load time
    import('chart.js').then(({ Chart, ArcElement, Tooltip, Legend }) => {
      // Make sure the component is still mounted
      if (!chartRef.current) return;
      
      // Register components only once
      Chart.register(ArcElement, Tooltip, Legend);

      // Create a unique ID for this chart instance
      const chartId = `expense-chart-${Date.now()}`;
      chartRef.current.id = chartId;
      
      // Create new chart
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: backgroundColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  return `${label}: ${value.toFixed(1)}%`;
                }
              }
            }
          }
        }
      });
      
      chartCreated = true;
    }).catch(error => {
      console.error("Failed to load Chart.js", error);
    });
    
    // Clean up chart on unmount or when effect re-runs
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [summary, isSummaryLoading, period]);
  
  if (isSummaryLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center">
                <Skeleton className="h-3 w-3 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const expenseBreakdown = summary?.expenseBreakdown || [];
  
  // Sort by percentage descending
  const sortedExpenses = [...expenseBreakdown]
    .sort((a, b) => b.percentage - a.percentage);
  
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Expense Breakdown</CardTitle>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as PeriodOption)}
          >
            <SelectTrigger className="w-[160px] h-8 text-sm mt-2 sm:mt-0">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <canvas ref={chartRef} />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {sortedExpenses.map((item, index) => {
            const category = getCategoryById(item.category);
            return (
              <div key={item.category} className="flex items-center text-sm">
                <span 
                  className="w-3 h-3 inline-block rounded-full mr-2"
                  style={{ backgroundColor: category.color || COLORS.chart[index % COLORS.chart.length] }}
                />
                <span className="text-gray-700 truncate">{category.label}</span>
                <span className="ml-auto font-medium">{item.percentage.toFixed(1)}%</span>
              </div>
            );
          })}
          
          {sortedExpenses.length === 0 && (
            <div className="col-span-2 text-center text-sm text-gray-500 py-4">
              No expense data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
