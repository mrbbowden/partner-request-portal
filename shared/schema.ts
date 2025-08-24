import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const partners = pgTable("partners", {
  id: varchar("id", { length: 4 }).primaryKey(),
  referringCaseManager: text("referring_case_manager").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id", { length: 4 }).notNull().references(() => partners.id),
  referringCaseManager: text("referring_case_manager").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  preferredContact: text("preferred_contact").notNull(),
  requestType: text("request_type").notNull(),
  urgency: text("urgency").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPartnerSchema = createInsertSchema(partners);
export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
