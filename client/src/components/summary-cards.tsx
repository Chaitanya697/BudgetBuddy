import { useTransactions, PeriodType } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  WalletCards, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Building2, 
  ArrowUp
} from "lucide-react";

interface SummaryCardsProps {
  period: PeriodType;
}

export function SummaryCards({ period }: SummaryCardsProps) {
  const { summary, isSummaryLoading } = useTransactions(period);

  if (isSummaryLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const balance = summary?.balance || 0;
  const income = summary?.income || 0;
  const expenses = summary?.expenses || 0;
  const savingsRate = summary?.savingsRate || 0;

  // Generate appropriate period text
  let periodText = "";
  switch(period) {
    case "thisMonth":
      periodText = "This Month";
      break;
    case "lastMonth":
      periodText = "Last Month";
      break;
    case "last3Months":
      periodText = "Last 3 Months";
      break;
    case "thisYear":
      periodText = "This Year";
      break;
    case "custom":
      periodText = "Custom Period";
      break;
    default:
      periodText = "Current Period";
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Balance Card */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Current Balance</h3>
            <WalletCards className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-semibold text-gray-800">{formatCurrency(balance)}</p>
          <div className="text-xs text-gray-500 mt-1">{periodText}</div>
        </CardContent>
      </Card>
      
      {/* Income Card */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Income</h3>
            <ArrowDownCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(income)}</p>
          <div className="text-xs flex items-center text-green-600 mt-1">
            <ArrowUp className="mr-1 h-3 w-3" />
            <span>{periodText}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Expenses Card */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
            <ArrowUpCircle className="h-5 w-5 text-rose-600" />
          </div>
          <p className="text-2xl font-semibold text-rose-600">{formatCurrency(expenses)}</p>
          <div className="text-xs flex items-center text-rose-600 mt-1">
            <ArrowUp className="mr-1 h-3 w-3" />
            <span>{periodText}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Savings Rate Card */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Savings Rate</h3>
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-semibold text-gray-800">
            {savingsRate.toFixed(1)}%
          </p>
          <div className="text-xs text-gray-500 mt-1">
            <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              Goal: 50%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
