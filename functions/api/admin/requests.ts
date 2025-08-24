import { z } from 'zod';

const requestSchema = z.object({
  partner_id: z.string().length(4, "Partner ID must be exactly 4 characters"),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  preferred_contact: z.enum(["email", "phone"], { message: "Preferred contact must be email or phone" }),
  request_type: z.enum(["technical", "billing", "account", "other"], { message: "Invalid request type" }),
  urgency: z.enum(["low", "medium", "high", "urgent"], { message: "Invalid urgency level" }),
  description: z.string().min(1, "Description is required"),
});

const adminPassword = "scooby";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === adminPassword;
}

export async function onRequest(context: any) {
  const { request, env } = context;

  // Check authentication
  if (!checkAuth(request)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    switch (request.method) {
      case "GET":
        return await handleGetRequests(env);
      case "POST":
        return await handleCreateRequest(request, env);
      default:
        return new Response(JSON.stringify({ message: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error in admin requests API:", error);
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleGetRequests(env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await env.DB.prepare(`
      SELECT r.*, p.full_name as partner_name 
      FROM requests r 
      LEFT JOIN partners p ON r.partner_id = p.id 
      ORDER BY r.created_at DESC
    `).all();
    return new Response(JSON.stringify(result.results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ message: "Database error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleCreateRequest(request: Request, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const validatedRequest = requestSchema.parse(body);

    // Check if partner exists
    const partner = await env.DB.prepare("SELECT id FROM partners WHERE id = ?").bind(validatedRequest.partner_id).first();
    if (!partner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert new request
    const requestId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO requests (id, partner_id, full_name, email, phone, preferred_contact, request_type, urgency, description, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      requestId,
      validatedRequest.partner_id,
      validatedRequest.full_name,
      validatedRequest.email,
      validatedRequest.phone,
      validatedRequest.preferred_contact,
      validatedRequest.request_type,
      validatedRequest.urgency,
      validatedRequest.description,
      new Date().toISOString()
    ).run();

    const newRequest = {
      id: requestId,
      ...validatedRequest,
      created_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(newRequest), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: "Validation error", errors: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Database error:", error);
    return new Response(JSON.stringify({ message: "Database error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


