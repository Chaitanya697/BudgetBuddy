import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface ExpenseBreakdownProps {
  userId: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface ExpenseCategory {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

// We'll use a fixed set of colors for the chart
const COLORS = ['#2E7D32', '#1976D2', '#FF8F00', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#3F51B5', '#009688'];

export default function ExpenseBreakdownChart({ userId, dateRange }: ExpenseBreakdownProps) {
  // Query to fetch expense breakdown data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/charts/expense-breakdown", userId, dateRange],
    queryFn: async () => {
      let url = `/api/charts/expense-breakdown?userId=${userId}`;
      if (dateRange) {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch expense breakdown");
      return response.json() as Promise<ExpenseCategory[]>;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-neutral-500 mb-4">Expense Breakdown</h3>
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-neutral-500 mb-4">Expense Breakdown</h3>
          <div className="flex justify-center items-center h-[300px] text-neutral-400">
            {error ? "Error loading data" : "No expense data available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow rounded border border-neutral-200 text-sm">
          <p className="font-medium">{data.categoryName}</p>
          <p>{formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-neutral-500 mb-4">Expense Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center">
            {data.map((category, index) => (
              <div key={category.categoryId} className="flex items-center justify-between mb-3 last:mb-0">
                <div className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="text-sm text-neutral-400">{category.categoryName}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-neutral-500">
                    {formatCurrency(category.amount)}
                  </span>
                  <span className="text-xs text-neutral-300 ml-2">
                    ({category.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
