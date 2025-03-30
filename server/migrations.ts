import { drizzle } from "drizzle-orm/postgres-js";
import { users, transactions } from "@shared/schema";
import postgres from "postgres";
import { log } from "./vite";
import pg from "pg";

export async function runMigrations() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    log("Connected to PostgreSQL database");

    // Create tables if they don't exist
    log("Creating tables if they don't exist");
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    log("Users table created or already exists");

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        amount DOUBLE PRECISION NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        note TEXT,
        user_id INTEGER NOT NULL
      )
    `);
    log("Transactions table created or already exists");

    // Create sessions table for connect-pg-simple
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    log("Session table created or already exists");

    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `);
    log("Session index created or already exists");

    await client.end();
    
    log("Migrations completed successfully");
    return true;
  } catch (error) {
    log(`Migration error: ${error}`);
    return false;
  }
}