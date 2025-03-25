import { pgTable, text, serial, integer, boolean, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  type: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  date: date("date").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  userId: integer("user_id").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  amount: true,
  description: true,
  categoryId: true,
  date: true,
  type: true,
  userId: true,
});

export const transactionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.number().optional(),
  type: z.enum(['income', 'expense']).optional(),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
