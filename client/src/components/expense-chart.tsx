import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTransactions, PeriodType } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryById } from "@/lib/categories";
import { COLORS } from "@/lib/utils";

interface ExpenseChartProps {
  period: PeriodType;
}

export function ExpenseChart({ period }: ExpenseChartProps) {
  const { summary, isSummaryLoading } = useTransactions(period);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [chartError, setChartError] = useState<boolean>(false);
  
  useEffect(() => {
    // Always clean up existing chart first 
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    
    // Reset error state
    setChartError(false);
    
    // Only proceed with creating a new chart if we have data
    if (isSummaryLoading || !summary?.expenseBreakdown || !chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // If there's no expense data, don't create a chart
    if (!summary.expenseBreakdown || summary.expenseBreakdown.length === 0) return;
    
    const sortedExpenses = [...summary.expenseBreakdown]
      .sort((a, b) => b.amount - a.amount);
    
    const labels = sortedExpenses.map(item => getCategoryById(item.category).label);
    const data = sortedExpenses.map(item => item.percentage);
    const backgroundColors = sortedExpenses.map((item, index) => {
      const category = getCategoryById(item.category);
      return category.color || COLORS.chart[index % COLORS.chart.length];
    });
    
    // Import all necessary Chart.js components
    Promise.all([
      import('chart.js/auto'), // This imports all necessary controllers including PieController
      import('chart.js')
    ]).then(([chartAuto, { Chart, ArcElement, Tooltip, Legend }]) => {
      if (!chartRef.current) return;
      
      // Register required components
      Chart.register(ArcElement, Tooltip, Legend);
      
      // Create a unique ID for this chart instance
      const chartId = `expense-chart-${Date.now()}`;
      chartRef.current.id = chartId;
      
      try {
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
      } catch (error) {
        console.error("Failed to create chart:", error);
        setChartError(true);
      }
    }).catch(error => {
      console.error("Failed to load Chart.js", error);
      setChartError(true);
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
      <div className="w-full">
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
      </div>
    );
  }
  
  const expenseBreakdown = summary?.expenseBreakdown || [];
  
  // Sort by percentage descending
  const sortedExpenses = [...expenseBreakdown]
    .sort((a, b) => b.percentage - a.percentage);
  
  return (
    <div className="w-full">
      <div className="h-64 flex items-center justify-center">
        {chartError ? (
          <div className="text-center text-sm text-gray-500">
            <p>Unable to load chart visualization.</p>
            <p>Please try refreshing the page.</p>
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
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
    </div>
  );
}
