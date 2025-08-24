import { drizzle } from "drizzle-orm/d1";
import { partners } from "../../../schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const partnerUpdateSchema = z.object({
  partnerName: z.string().min(1, "Partner Name is required"), // Added partner name
  referringCaseManager: z.string().min(1, "Referring Case Manager is required"),
  caseManagerEmail: z.string().email("Invalid email format"),
  caseManagerPhone: z.string().min(1, "Case Manager's Phone is required"),
});

export async function onRequest(context: any) {
  const { request, params, env } = context;
  const { id } = params;

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
      const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);

      if (result.length === 0) {
        return new Response(JSON.stringify({ error: "Partner not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result[0]), {
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

  if (request.method === "PUT") {
    try {
      const body = await request.json();
      const validatedData = partnerUpdateSchema.parse(body);

      const db = drizzle(env.DB);
      const result = await db
        .update(partners)
        .set({
          partnerName: validatedData.partnerName, // Added partner name
          referringCaseManager: validatedData.referringCaseManager,
          caseManagerEmail: validatedData.caseManagerEmail,
          caseManagerPhone: validatedData.caseManagerPhone,
        })
        .where(eq(partners.id, id))
        .returning();

      if (result.length === 0) {
        return new Response(JSON.stringify({ error: "Partner not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result[0]), {
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

  if (request.method === "DELETE") {
    try {
      const db = drizzle(env.DB);
      const result = await db.delete(partners).where(eq(partners.id, id)).returning();

      if (result.length === 0) {
        return new Response(JSON.stringify({ error: "Partner not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ message: "Partner deleted successfully" }), {
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

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}


