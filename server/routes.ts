import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, 
  transactionFilterSchema, 
  insertUserSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register a default user for demonstration purposes
  try {
    const existingUser = await storage.getUserByUsername("johndoe");
    if (!existingUser) {
      await storage.createUser({ username: "johndoe", password: "password" });
    }
  } catch (error) {
    console.error("Error registering default user:", error);
  }

  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would generate a JWT token here and set it as a cookie
      // For this simplified version, we'll just return the user ID
      return res.status(200).json({ userId: user.id, username: user.username });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsedBody = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(parsedBody.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(parsedBody);
      
      return res.status(201).json({ userId: user.id, username: user.username });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      
      let categories;
      if (type && (type === 'income' || type === 'expense')) {
        categories = await storage.getCategoriesByType(type);
      } else {
        categories = await storage.getCategories();
      }
      
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      console.error("Get category error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Parse filter parameters
      try {
        const filter = transactionFilterSchema.parse({
          startDate: req.query.startDate,
          endDate: req.query.endDate,
          categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
          type: req.query.type
        });
        
        const transactions = await storage.getTransactions(userId, filter);
        return res.status(200).json(transactions);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Get transactions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions/recent", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const limit = parseInt(req.query.limit as string) || 5;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const transactions = await storage.getRecentTransactions(userId, limit);
      
      // Get category details for each transaction
      const transactionsWithCategory = await Promise.all(
        transactions.map(async (transaction) => {
          const category = await storage.getCategoryById(transaction.categoryId);
          return {
            ...transaction,
            category: category || { name: "Unknown", icon: "help-circle", type: transaction.type }
          };
        })
      );
      
      return res.status(200).json(transactionsWithCategory);
    } catch (error) {
      console.error("Get recent transactions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const parsedBody = insertTransactionSchema.parse(req.body);
      
      const transaction = await storage.createTransaction(parsedBody);
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Create transaction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      const existingTransaction = await storage.getTransactionById(transactionId);
      
      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
      
      return res.status(200).json(updatedTransaction);
    } catch (error) {
      console.error("Update transaction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      const existingTransaction = await storage.getTransactionById(transactionId);
      
      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const success = await storage.deleteTransaction(transactionId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete transaction" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Delete transaction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Summary routes
  app.get("/api/summary", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const summary = await storage.getSummary(userId, startDate, endDate);
      
      return res.status(200).json(summary);
    } catch (error) {
      console.error("Get summary error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chart data routes
  app.get("/api/charts/expense-breakdown", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const data = await storage.getExpenseBreakdown(userId, startDate, endDate);
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Get expense breakdown error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/charts/monthly-trend", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const months = parseInt(req.query.months as string) || 6;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const data = await storage.getMonthlyTrend(userId, months);
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Get monthly trend error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
