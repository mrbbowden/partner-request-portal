import { drizzle } from "drizzle-orm/d1";
import { requests } from "../../schema";
import { z } from "zod";

const requestSchema = z.object({
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

export async function onRequest(context: any) {
  const { request, env } = context;

  // Check admin password
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== "Bearer scooby") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === "GET") {
    try {
      const db = drizzle(env.DB);
      const allRequests = await db.select().from(requests).orderBy(requests.createdAt);
      
      return new Response(JSON.stringify(allRequests), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Database not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();
      const validatedData = requestSchema.parse(body);

      const db = drizzle(env.DB);
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

      return new Response(JSON.stringify(result[0]), {
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

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}


