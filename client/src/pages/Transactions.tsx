import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  HelpCircle,
  ArrowUpDown,
  CalendarIcon,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import TransactionForm from "@/components/TransactionForm";
import { TransactionFilter } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionsProps {
  userId: number;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: string;
  categoryId: number;
  userId: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  type: string;
}

export default function Transactions({ userId }: TransactionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Query to fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json() as Promise<Category[]>;
    },
  });
  
  // Query to fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions", userId, filter],
    queryFn: async () => {
      let url = `/api/transactions?userId=${userId}`;
      
      if (filter.startDate) url += `&startDate=${filter.startDate}`;
      if (filter.endDate) url += `&endDate=${filter.endDate}`;
      if (filter.categoryId) url += `&categoryId=${filter.categoryId}`;
      if (filter.type) url += `&type=${filter.type}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json() as Promise<Transaction[]>;
    },
  });
  
  // Apply filters
  const applyDateFilter = () => {
    const newFilter = { ...filter };
    
    if (startDate) {
      newFilter.startDate = format(startDate, "yyyy-MM-dd");
    } else {
      delete newFilter.startDate;
    }
    
    if (endDate) {
      newFilter.endDate = format(endDate, "yyyy-MM-dd");
    } else {
      delete newFilter.endDate;
    }
    
    setFilter(newFilter);
  };
  
  const applyCategoryFilter = (categoryId: string) => {
    const newFilter = { ...filter };
    
    if (categoryId && categoryId !== "all") {
      newFilter.categoryId = parseInt(categoryId);
    } else {
      delete newFilter.categoryId;
    }
    
    setFilter(newFilter);
  };
  
  const applyTypeFilter = (type: string) => {
    const newFilter = { ...filter };
    
    if (type && type !== "all") {
      newFilter.type = type as "income" | "expense";
    } else {
      delete newFilter.type;
    }
    
    setFilter(newFilter);
  };
  
  const resetFilters = () => {
    setFilter({});
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchQuery("");
  };
  
  // Function to get the category name for a transaction
  const getCategoryName = (categoryId: number) => {
    if (!categories) return "Loading...";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown";
  };
  
  // Function to get the appropriate icon for a category
  const getCategoryIcon = (categoryId: number) => {
    if (!categories) return <HelpCircle />;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return <HelpCircle />;
    
    switch (category.icon) {
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
  
  // Filter transactions by search query
  const filteredTransactions = transactions?.filter(transaction => {
    if (!searchQuery) return true;
    
    const description = transaction.description?.toLowerCase() || "";
    const category = getCategoryName(transaction.categoryId).toLowerCase();
    const amount = transaction.amount.toString();
    
    return (
      description.includes(searchQuery.toLowerCase()) ||
      category.includes(searchQuery.toLowerCase()) ||
      amount.includes(searchQuery)
    );
  });

  return (
    <div>
      {/* Transactions Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-medium text-neutral-500 mb-2 sm:mb-0">Transactions</h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white sm:w-auto w-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          <span>Add Transaction</span>
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate && endDate ? (
                      <>
                        {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                      </>
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Start Date</p>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium">End Date</p>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => startDate ? date < startDate : false}
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={applyDateFilter}
                        className="bg-primary hover:bg-primary-dark text-white"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Select onValueChange={applyCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select onValueChange={applyTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(filter.startDate || filter.endDate || filter.categoryId || filter.type) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="text-neutral-500"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transactions List */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            // Loading skeletons
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center py-4 border-b border-neutral-100 last:border-0">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions?.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center py-4 border-b border-neutral-100 last:border-0"
                >
                  <div className={`${getIconBackground(transaction.type)} rounded-full p-3 mr-4 text-${transaction.type === "income" ? "[#4CAF50]" : "primary"}`}>
                    {getCategoryIcon(transaction.categoryId)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-neutral-500">
                      {transaction.description || getCategoryName(transaction.categoryId)}
                    </h4>
                    <div className="flex items-center text-sm text-neutral-400">
                      <span>{formatDate(transaction.date)}</span>
                      <span className="mx-2">•</span>
                      <span>{getCategoryName(transaction.categoryId)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-medium">
                      {formatCurrency(transaction.amount, transaction.type)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <TransactionForm userId={userId} onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
