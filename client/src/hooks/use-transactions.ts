import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertTransaction, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type PeriodType = "thisMonth" | "lastMonth" | "last3Months" | "thisYear" | "custom";

export function useTransactions(period: PeriodType = "thisMonth") {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return res.json();
    }
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['/api/summary', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      const res = await fetch(`/api/summary?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch summary');
      }
      return res.json();
    }
  });

  const addTransaction = useMutation({
    mutationFn: async (newTransaction: InsertTransaction) => {
      const res = await apiRequest('POST', '/api/transactions', newTransaction);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Transaction added",
        description: "Your transaction was successfully added",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, transaction }: { id: number, transaction: Partial<InsertTransaction> }) => {
      const res = await apiRequest('PUT', `/api/transactions/${id}`, transaction);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Transaction updated",
        description: "Your transaction was successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Transaction deleted",
        description: "Your transaction was successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    summary,
    isLoading,
    isSummaryLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
