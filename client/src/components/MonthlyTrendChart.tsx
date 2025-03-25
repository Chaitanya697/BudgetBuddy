import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface MonthlyTrendProps {
  userId: number;
  months?: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export default function MonthlyTrendChart({ userId, months = 6 }: MonthlyTrendProps) {
  // Query to fetch monthly trend data
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/charts/monthly-trend", userId, months],
    queryFn: async () => {
      const response = await fetch(`/api/charts/monthly-trend?userId=${userId}&months=${months}`);
      if (!response.ok) throw new Error("Failed to fetch monthly trend");
      return response.json() as Promise<MonthlyData[]>;
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-neutral-500 mb-4">Monthly Trend</h3>
          <div className="flex justify-center items-center h-[250px]">
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
          <h3 className="text-lg font-medium text-neutral-500 mb-4">Monthly Trend</h3>
          <div className="flex justify-center items-center h-[250px] text-neutral-400">
            {error ? "Error loading data" : "No monthly data available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow rounded border border-neutral-200 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-[#4CAF50]">
            Income: {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(payload[0].value)}
          </p>
          <p className="text-[#F44336]">
            Expenses: {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-500">Monthly Trend</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-[#4CAF50] mr-2"></span>
              <span className="text-sm text-neutral-400">Income</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-[#F44336] mr-2"></span>
              <span className="text-sm text-neutral-400">Expenses</span>
            </div>
          </div>
        </div>
        
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="income" 
                fill="#4CAF50" 
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar 
                dataKey="expenses" 
                fill="#F44336" 
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
