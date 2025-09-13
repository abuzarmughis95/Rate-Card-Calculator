import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const regions = pgTable("regions", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  multiplier: numeric("multiplier", { precision: 4, scale: 2 }).notNull(),
});

export const roles = pgTable("roles", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  baseRate: integer("base_rate").notNull(), // in AED
  category: text("category").notNull(), // 'custom' or 'swat'
});

export const seniorityLevels = pgTable("seniority_levels", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  multiplier: numeric("multiplier", { precision: 4, scale: 2 }).notNull(),
});

export const currencies = pgTable("currencies", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  rate: numeric("rate", { precision: 10, scale: 6 }).notNull(), // rate from AED
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'custom' or 'swat'
  configuration: jsonb("configuration").notNull(),
  finalRate: integer("final_rate").notNull(),
  currency: text("currency").notNull(),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertRegionSchema = createInsertSchema(regions);
export const insertRoleSchema = createInsertSchema(roles);
export const insertSenioritySchema = createInsertSchema(seniorityLevels);
export const insertCurrencySchema = createInsertSchema(currencies);
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });

export type Region = typeof regions.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type SeniorityLevel = typeof seniorityLevels.$inferSelect;
export type Currency = typeof currencies.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertSeniority = z.infer<typeof insertSenioritySchema>;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
