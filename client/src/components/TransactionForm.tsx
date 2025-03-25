import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTransactionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface TransactionFormProps {
  userId: number;
  onSuccess?: () => void;
}

// Extend the insertTransactionSchema with additional validation
const formSchema = insertTransactionSchema
  .extend({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Please select a valid date",
    }),
    amount: z.number().positive("Amount must be positive"),
  })
  .refine((data) => {
    // Allow the same type as selected in the form
    return true;
  });

export default function TransactionForm({ userId, onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
      type: "expense",
      userId: userId,
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Update form values when transaction type changes
  useEffect(() => {
    form.setValue("type", transactionType);
  }, [transactionType, form]);

  // Query to fetch categories based on transaction type
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories", transactionType],
    queryFn: async () => {
      const response = await fetch(`/api/categories?type=${transactionType}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Mutation to create a new transaction
  const createTransactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      toast({
        title: "Transaction added",
        description: "Your transaction has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/charts/expense-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["/api/charts/monthly-trend"] });
      form.reset({
        amount: 0,
        description: "",
        type: "expense",
        userId: userId,
        date: format(new Date(), "yyyy-MM-dd"),
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to add transaction",
        description: error.message || "Please try again.",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createTransactionMutation.mutate(values);
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center border-b border-neutral-100 p-4">
        <h3 className="text-lg font-medium text-neutral-500">Add Transaction</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="inline-flex items-center cursor-pointer">
                <Switch
                  checked={transactionType === "expense"}
                  onCheckedChange={() => setTransactionType("expense")}
                />
                <span className="ml-2 text-sm font-medium text-neutral-400">Expense</span>
              </label>
            </div>
            <div className="flex-1">
              <label className="inline-flex items-center cursor-pointer">
                <Switch
                  checked={transactionType === "income"}
                  onCheckedChange={() => setTransactionType("income")}
                />
                <span className="ml-2 text-sm font-medium text-neutral-400">Income</span>
              </label>
            </div>
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-400">$</span>
                    </div>
                    <Input
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="What was this for?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-6">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark" 
              disabled={createTransactionMutation.isPending}
            >
              {createTransactionMutation.isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
