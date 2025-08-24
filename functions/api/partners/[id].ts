import { drizzle } from "drizzle-orm/d1";
import { partners } from "../../schema";
import { eq } from "drizzle-orm";

export async function onRequest(context: any) {
  const { params } = context;
  const { id } = params;

  try {
    const db = drizzle(context.env.DB);
    const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);

    if (result.length === 0) {
      return new Response(JSON.stringify({ error: "Partner not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const partner = result[0];
    
    // Transform the database result to match frontend expectations
    return new Response(JSON.stringify({
      id: partner.id,
      partnerName: partner.partnerName, // Added partner name
      referringCaseManager: partner.referringCaseManager,
      caseManagerEmail: partner.caseManagerEmail,
      caseManagerPhone: partner.caseManagerPhone,
    }), {
      status: 200,
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
