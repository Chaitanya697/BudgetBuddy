import { transactions, type Transaction, type InsertTransaction, users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import pg from "pg";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction, userId: number): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private userCurrentId: number;
  private transactionCurrentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.userCurrentId = 1;
    this.transactionCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction, userId: number): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      userId,
      date: new Date(insertTransaction.date),
      note: insertTransaction.note || null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    
    if (!existing) {
      return undefined;
    }
    
    const updated: Transaction = { 
      ...existing, 
      ...transaction,
      date: transaction.date ? new Date(transaction.date) : existing.date,
      note: transaction.note !== undefined ? (transaction.note || null) : existing.note
    };
    
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
}

export class PostgresStorage implements IStorage {
  private db;
  sessionStore: session.Store;

  constructor() {
    const PostgresStore = connectPg(session);
    
    // Use the environment variables provided by Replit
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.db = drizzle(postgres(process.env.DATABASE_URL!));
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await this.db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const result = await this.db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }

  async createTransaction(insertTransaction: InsertTransaction, userId: number): Promise<Transaction> {
    // Create the transaction data object with only valid fields
    const transactionData = {
      amount: insertTransaction.amount,
      type: insertTransaction.type,
      category: insertTransaction.category,
      date: insertTransaction.date,
      note: insertTransaction.note || null,
      userId
    };

    const result = await this.db.insert(transactions).values(transactionData).returning();
    return result[0];
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    // Get existing transaction
    const existing = await this.getTransactionById(id);
    if (!existing) {
      return undefined;
    }

    // Create an update object with only valid fields
    const updateData: Record<string, any> = {};
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.type !== undefined) updateData.type = transaction.type;
    if (transaction.category !== undefined) updateData.category = transaction.category;
    if (transaction.date !== undefined) updateData.date = transaction.date;
    if (transaction.note !== undefined) updateData.note = transaction.note || null;

    // Update transaction
    const result = await this.db.update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    return result[0];
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await this.db.delete(transactions).where(eq(transactions.id, id)).returning();
    return result.length > 0;
  }
}

// Use Postgres storage
export const storage = new PostgresStorage();
