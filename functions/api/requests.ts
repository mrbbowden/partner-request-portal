import { drizzle } from "drizzle-orm/d1";
import { requests, partners } from "../schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const insertRequestSchema = z.object({
  partnerId: z.string().length(4),
  partnerName: z.string().min(1, "Partner Name is required"), // Added partner name
  referringCaseManager: z.string().min(1, "Referring Case Manager is required"),
  caseManagerEmail: z.string().email("Invalid email format"),
  caseManagerPhone: z.string().min(1, "Case Manager's Phone is required"),
  preferredContact: z.string().min(1, "Preferred Contact is required"),
  requestType: z.string().min(1, "Request Type is required"),
  urgency: z.string().min(1, "Urgency is required"),
  description: z.string().min(1, "Description is required"),
});

async function sendToZapier(data: any) {
  const webhookUrl = "https://hooks.zapier.com/hooks/catch/1234567890/abcdef123/";
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partnerId: data.partnerId,
        partnerName: data.partnerName, // Added partner name
        referringCaseManager: data.referringCaseManager,
        caseManagerEmail: data.caseManagerEmail,
        caseManagerPhone: data.caseManagerPhone,
        preferredContact: data.preferredContact,
        requestType: data.requestType,
        urgency: data.urgency,
        description: data.description,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Zapier webhook failed:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error sending to Zapier:", error);
  }
}

export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const validatedData = insertRequestSchema.parse(body);

    // Verify partner exists
    const db = drizzle(env.DB);
    const partner = await db.select().from(partners).where(eq(partners.id, validatedData.partnerId)).limit(1);

    if (partner.length === 0) {
      return new Response(JSON.stringify({ error: "Partner not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert request
    const result = await db.insert(requests).values({
      partnerId: validatedData.partnerId,
      partnerName: validatedData.partnerName, // Added partner name
      referringCaseManager: validatedData.referringCaseManager,
      caseManagerEmail: validatedData.caseManagerEmail,
      caseManagerPhone: validatedData.caseManagerPhone,
      preferredContact: validatedData.preferredContact,
      requestType: validatedData.requestType,
      urgency: validatedData.urgency,
      description: validatedData.description,
    }).returning();

    // Send to Zapier (non-blocking)
    sendToZapier({
      ...validatedData,
      partner: {
        id: partner[0].id,
        partnerName: partner[0].partnerName, // Added partner name
        referringCaseManager: partner[0].referringCaseManager,
        caseManagerEmail: partner[0].caseManagerEmail,
        caseManagerPhone: partner[0].caseManagerPhone,
      },
    });

    return new Response(JSON.stringify({ 
      message: "Request submitted successfully",
      requestId: result[0].id 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation error", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Database not available" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
