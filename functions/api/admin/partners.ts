import { z } from 'zod';

const partnerSchema = z.object({
  id: z.string().length(4, "Partner ID must be exactly 4 characters"),
  referring_case_manager: z.string().min(1, "Referring Case Manager is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
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
        return await handleGetPartners(env);
      case "POST":
        return await handleCreatePartner(request, env);
      default:
        return new Response(JSON.stringify({ message: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error in admin partners API:", error);
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleGetPartners(env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await env.DB.prepare("SELECT * FROM partners ORDER BY id").all();
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

async function handleCreatePartner(request: Request, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const validatedPartner = partnerSchema.parse(body);

    // Check if partner already exists
    const existingPartner = await env.DB.prepare("SELECT id FROM partners WHERE id = ?").bind(validatedPartner.id).first();
    if (existingPartner) {
      return new Response(JSON.stringify({ message: "Partner ID already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert new partner
    await env.DB.prepare(
      "INSERT INTO partners (id, referring_case_manager, email, phone) VALUES (?, ?, ?, ?)"
    ).bind(validatedPartner.id, validatedPartner.referring_case_manager, validatedPartner.email, validatedPartner.phone).run();

    return new Response(JSON.stringify(validatedPartner), {
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


