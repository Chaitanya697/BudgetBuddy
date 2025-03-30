import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema } from "@shared/schema";
import { useTransactions } from "@/hooks/use-transactions";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getCategoriesByType } from "@/lib/categories";

export function AddTransactionForm() {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const { addTransaction } = useTransactions();
  
  const form = useForm({
    resolver: zodResolver(
      insertTransactionSchema.extend({
        amount: insertTransactionSchema.shape.amount,
        category: insertTransactionSchema.shape.category,
        type: insertTransactionSchema.shape.type,
        date: insertTransactionSchema.shape.date,
        note: insertTransactionSchema.shape.note.optional(),
      })
    ),
    defaultValues: {
      amount: 0,
      type: "expense" as "income" | "expense",
      category: "",
      date: new Date(),
      note: "",
    },
  });

  function onSubmit(data: any) {
    addTransaction.mutate(data, {
      onSuccess: () => {
        form.reset({
          amount: 0,
          type: transactionType,
          category: "",
          date: new Date(),
          note: "",
        });
      },
    });
  }

  const categories = getCategoriesByType(transactionType);
  const isPending = addTransaction.isPending;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-3 top-3 w-10 h-10 opacity-10">
        <img src="/attached_assets/image_1743321165731.png" alt="" className="w-full h-full" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value: "income" | "expense") => {
                      field.onChange(value);
                      setTransactionType(value);
                      // Reset category when type changes
                      form.setValue("category", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="pl-3 text-left font-normal justify-start"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note about this transaction"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Adding..." : "Add Transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}