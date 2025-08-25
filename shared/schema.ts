import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const partners = pgTable("partners", {
  id: varchar("id", { length: 4 }).primaryKey(),
  partnerName: text("partner_name").notNull(),
  referringCaseManager: text("referring_case_manager").notNull(),
  caseManagerEmail: text("case_manager_email").notNull(),
  caseManagerPhone: text("case_manager_phone").notNull(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id", { length: 4 }).notNull().references(() => partners.id),
  partnerName: text("partner_name").notNull(),
  referringCaseManager: text("referring_case_manager").notNull(),
  caseManagerEmail: text("case_manager_email").notNull(),
  caseManagerPhone: text("case_manager_phone").notNull(),
  preferredContact: text("preferred_contact").notNull(),
  urgency: text("urgency").notNull(),
  description: text("description").notNull(),
  // New recipient fields
  recipientsName: text("recipients_name").notNull(),
  recipientsAddress: text("recipients_address").notNull(),
  recipientsEmail: text("recipients_email").notNull(),
  recipientsPhone: text("recipients_phone").notNull(),
  descriptionOfNeed: text("description_of_need").notNull(),
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
