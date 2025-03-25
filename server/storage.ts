import { 
  users, 
  type User, 
  type InsertUser, 
  categories, 
  type Category, 
  type InsertCategory,
  transactions,
  type Transaction,
  type InsertTransaction,
  type TransactionFilter
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoriesByType(type: string): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Transaction methods
  getTransactions(userId: number, filter?: TransactionFilter): Promise<Transaction[]>;
  getRecentTransactions(userId: number, limit: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Summary methods
  getSummary(userId: number, startDate?: string, endDate?: string): Promise<{ 
    income: number; 
    expenses: number; 
    balance: number; 
    savingsRate: number;
  }>;
  
  // Chart data methods
  getExpenseBreakdown(userId: number, startDate?: string, endDate?: string): Promise<{ 
    categoryId: number;
    categoryName: string;
    amount: number;
    percentage: number;
  }[]>;
  
  getMonthlyTrend(userId: number, months?: number): Promise<{
    month: string;
    income: number;
    expenses: number;
  }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  currentUserId: number;
  currentCategoryId: number;
  currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentTransactionId = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: 'Housing', icon: 'home', type: 'expense' },
      { name: 'Food', icon: 'shopping-basket', type: 'expense' },
      { name: 'Transportation', icon: 'car', type: 'expense' },
      { name: 'Utilities', icon: 'flash', type: 'expense' },
      { name: 'Entertainment', icon: 'film', type: 'expense' },
      { name: 'Healthcare', icon: 'heart-pulse', type: 'expense' },
      { name: 'Personal', icon: 'user', type: 'expense' },
      { name: 'Debt Payments', icon: 'credit-card', type: 'expense' },
      { name: 'Savings', icon: 'piggy-bank', type: 'expense' },
      { name: 'Other Expenses', icon: 'more-horizontal', type: 'expense' },
      { name: 'Salary', icon: 'briefcase', type: 'income' },
      { name: 'Freelance', icon: 'laptop', type: 'income' },
      { name: 'Investment', icon: 'trending-up', type: 'income' },
      { name: 'Gifts', icon: 'gift', type: 'income' },
      { name: 'Other Income', icon: 'plus-circle', type: 'income' }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoriesByType(type: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      category => category.type === type
    );
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Transaction methods
  async getTransactions(userId: number, filter?: TransactionFilter): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values()).filter(
      transaction => transaction.userId === userId
    );
    
    if (filter) {
      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        transactions = transactions.filter(transaction => 
          new Date(transaction.date) >= startDate
        );
      }
      
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        transactions = transactions.filter(transaction => 
          new Date(transaction.date) <= endDate
        );
      }
      
      if (filter.categoryId) {
        transactions = transactions.filter(transaction => 
          transaction.categoryId === filter.categoryId
        );
      }
      
      if (filter.type) {
        transactions = transactions.filter(transaction => 
          transaction.type === filter.type
        );
      }
    }
    
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async getRecentTransactions(userId: number, limit: number): Promise<Transaction[]> {
    const transactions = await this.getTransactions(userId);
    return transactions.slice(0, limit);
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async updateTransaction(id: number, transactionUpdate: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...transactionUpdate };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  // Summary methods
  async getSummary(userId: number, startDate?: string, endDate?: string): Promise<{ 
    income: number; 
    expenses: number; 
    balance: number; 
    savingsRate: number;
  }> {
    const filter: TransactionFilter = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;
    
    const transactions = await this.getTransactions(userId, filter);
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = income - expenses;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;
    
    return {
      income,
      expenses,
      balance,
      savingsRate
    };
  }
  
  // Chart data methods
  async getExpenseBreakdown(userId: number, startDate?: string, endDate?: string): Promise<{ 
    categoryId: number;
    categoryName: string;
    amount: number;
    percentage: number;
  }[]> {
    const filter: TransactionFilter = { type: 'expense' };
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;
    
    const transactions = await this.getTransactions(userId, filter);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const categoryExpenses = new Map<number, number>();
    for (const transaction of transactions) {
      const currentAmount = categoryExpenses.get(transaction.categoryId) || 0;
      categoryExpenses.set(transaction.categoryId, currentAmount + transaction.amount);
    }
    
    const result = await Promise.all(
      Array.from(categoryExpenses.entries()).map(async ([categoryId, amount]) => {
        const category = await this.getCategoryById(categoryId);
        return {
          categoryId,
          categoryName: category?.name || 'Unknown',
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        };
      })
    );
    
    // Sort by amount descending
    return result.sort((a, b) => b.amount - a.amount);
  }
  
  async getMonthlyTrend(userId: number, months = 6): Promise<{
    month: string;
    income: number;
    expenses: number;
  }[]> {
    const now = new Date();
    const result: { month: string; income: number; expenses: number; }[] = [];
    
    // Generate the last N months
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const monthTransactions = await this.getTransactions(userId, { 
        startDate, 
        endDate 
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      result.unshift({
        month: monthName,
        income,
        expenses
      });
    }
    
    return result;
  }
}

export const storage = new MemStorage();
