import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  Home, 
  ShoppingBasket, 
  Car, 
  Zap, 
  Film, 
  Heart, 
  User, 
  CreditCard, 
  PiggyBank, 
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Loader2,
  HelpCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentTransactionsProps {
  userId: number;
  limit?: number;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  categoryId: number;
  category: {
    name: string;
    icon: string;
    type: string;
  };
}

export default function RecentTransactions({ userId, limit = 5 }: RecentTransactionsProps) {
  // Query to fetch recent transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/transactions/recent", userId, limit],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/recent?userId=${userId}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch recent transactions");
      return response.json() as Promise<Transaction[]>;
    },
  });

  // Function to get the appropriate icon for a category
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "home": return <Home />;
      case "shopping-basket": return <ShoppingBasket />;
      case "car": return <Car />;
      case "flash": return <Zap />;
      case "film": return <Film />;
      case "heart-pulse": return <Heart />;
      case "user": return <User />;
      case "credit-card": return <CreditCard />;
      case "piggy-bank": return <PiggyBank />;
      case "more-horizontal": return <MoreHorizontal />;
      case "briefcase": return <Briefcase />;
      case "laptop": return <Laptop />;
      case "trending-up": return <TrendingUp />;
      case "gift": return <Gift />;
      case "plus-circle": return <PlusCircle />;
      default: return <HelpCircle />;
    }
  };

  // Function to get background color for the icon
  const getIconBackground = (type: string) => {
    if (type === "income") {
      return "bg-[#4CAF50] bg-opacity-10";
    }
    return "bg-primary bg-opacity-10";
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Function to format currency
  const formatCurrency = (amount: number, type: string) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    if (type === "income") {
      return <span className="text-[#4CAF50]">+{formattedAmount}</span>;
    }
    return <span className="text-[#F44336]">-{formattedAmount}</span>;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-neutral-500">Recent Transactions</h3>
            <Link href="/transactions">
              <a className="text-sm text-primary hover:text-primary-dark font-medium">View All</a>
            </Link>
          </div>
          
          <div className="space-y-4">
            {Array(limit).fill(0).map((_, i) => (
              <div key={i} className="flex items-center py-2 border-b border-neutral-100 last:border-0">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-neutral-500">Recent Transactions</h3>
            <Link href="/transactions">
              <a className="text-sm text-primary hover:text-primary-dark font-medium">View All</a>
            </Link>
          </div>
          
          <div className="flex justify-center items-center h-[200px] text-neutral-400">
            {error ? "Error loading transactions" : "No transactions yet"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-500">Recent Transactions</h3>
          <Link href="/transactions">
            <a className="text-sm text-primary hover:text-primary-dark font-medium">View All</a>
          </Link>
        </div>
        
        <div className="space-y-4">
          {data.map((transaction) => (
            <div key={transaction.id} className="flex items-center py-2 border-b border-neutral-100 last:border-0">
              <div className={`${getIconBackground(transaction.type)} rounded-full p-3 mr-3 text-${transaction.type === "income" ? "[#4CAF50]" : "primary"}`}>
                {getCategoryIcon(transaction.category.icon)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-neutral-500">{transaction.description || transaction.category.name}</h4>
                <p className="text-xs text-neutral-300">{formatDate(transaction.date)}</p>
              </div>
              <p className="text-sm font-medium">
                {formatCurrency(transaction.amount, transaction.type)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
