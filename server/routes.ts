import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, Transaction } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Function to filter transactions based on period
function filterTransactionsByPeriod(transactions: Transaction[], period: string): Transaction[] {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfThisYear = new Date(now.getFullYear(), 0, 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  
  let startDate: Date;
  
  switch (period) {
    case 'thisMonth':
      startDate = startOfThisMonth;
      break;
    case 'lastMonth':
      startDate = startOfLastMonth;
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endOfLastMonth;
      });
    case 'last3Months':
      startDate = threeMonthsAgo;
      break;
    case 'thisYear':
      startDate = startOfThisYear;
      break;
    case 'custom':
      // Custom period not implemented yet, default to all transactions
      return transactions;
    default:
      startDate = startOfThisMonth; // Default to this month
  }
  
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date >= startDate;
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const period = req.query.period as string || 'thisMonth';
    const transactions = await storage.getTransactions(req.user.id);
    
    // Filter transactions based on period
    const filteredTransactions = filterTransactionsByPeriod(transactions, period);
    
    res.json(filteredTransactions);
  });

  app.get("/api/transactions/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const idParam = z.coerce.number().safeParse(req.params.id);
    
    if (!idParam.success) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    const transaction = await storage.getTransactionById(idParam.data);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(transaction);
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData, req.user.id);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const idParam = z.coerce.number().safeParse(req.params.id);
    
    if (!idParam.success) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    const transaction = await storage.getTransactionById(idParam.data);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Allow partial updates
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const updated = await storage.updateTransaction(idParam.data, validatedData);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const idParam = z.coerce.number().safeParse(req.params.id);
    
    if (!idParam.success) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    const transaction = await storage.getTransactionById(idParam.data);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const success = await storage.deleteTransaction(idParam.data);
    
    if (success) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Dashboard summary
  app.get("/api/summary", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const transactions = await storage.getTransactions(req.user.id);
    
    // Calculate totals
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = income - expenses;
    
    // Calculate savings rate if income > 0
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    
    // Calculate expense breakdown by category
    const expensesByCategory = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        const category = t.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Convert to percentages if total expenses > 0
    const expenseBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: expenses > 0 ? (amount / expenses) * 100 : 0
    }));
    
    res.json({
      balance,
      income,
      expenses,
      savingsRate,
      expenseBreakdown
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
