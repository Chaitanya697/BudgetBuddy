import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  PiggyBank,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  changePercentage?: number;
  type: "income" | "expense" | "balance" | "savings";
  goal?: number;
}

export default function SummaryCard({ 
  title, 
  amount, 
  changePercentage, 
  type,
  goal
}: SummaryCardProps) {
  // Determine icon and colors based on type
  const getIcon = () => {
    switch (type) {
      case "income":
        return <ArrowDownCircle className="text-[#4CAF50]" />;
      case "expense":
        return <ArrowUpCircle className="text-[#F44336]" />;
      case "balance":
        return <Wallet className="text-primary" />;
      case "savings":
        return <PiggyBank className="text-[#1976D2]" />;
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case "income":
        return "bg-[#4CAF50] bg-opacity-10";
      case "expense":
        return "bg-[#F44336] bg-opacity-10";
      case "balance":
        return "bg-primary bg-opacity-10";
      case "savings":
        return "bg-[#1976D2] bg-opacity-10";
    }
  };

  const getChangeColor = () => {
    if (!changePercentage) return "";
    
    // For expenses, positive change is bad (spending more)
    if (type === "expense") {
      return changePercentage > 0 ? "text-[#F44336]" : "text-[#4CAF50]";
    }
    
    // For others, positive change is good
    return changePercentage > 0 ? "text-[#4CAF50]" : "text-[#F44336]";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
          <div className={`rounded-full p-2 ${getIconBackground()}`}>
            {getIcon()}
          </div>
        </div>
        
        {type === "savings" ? (
          // Savings Rate Card with Progress Bar
          <>
            <p className="text-2xl font-medium text-neutral-500">
              {formatPercentage(amount)}
            </p>
            <div className="mt-1 bg-neutral-100 rounded-full h-2">
              <div 
                className="bg-[#1976D2] h-2 rounded-full" 
                style={{ width: `${amount}%` }}
              ></div>
            </div>
            {goal && (
              <p className="text-xs text-neutral-300 mt-2">Goal: {formatPercentage(goal)}</p>
            )}
          </>
        ) : (
          // Standard Card with Amount and Change
          <>
            <p className="text-2xl font-medium text-neutral-500">
              {formatCurrency(amount)}
            </p>
            {changePercentage !== undefined && (
              <p className={`text-sm flex items-center mt-1 ${getChangeColor()}`}>
                {changePercentage > 0 ? (
                  <ArrowUp className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDown className="mr-1 h-4 w-4" />
                )}
                <span>{Math.abs(changePercentage).toFixed(1)}%</span>
                <span className="text-neutral-300 ml-1">vs last month</span>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
