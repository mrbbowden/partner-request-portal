import { z } from 'zod';

const requestUpdateSchema = z.object({
  partner_id: z.string().length(4, "Partner ID must be exactly 4 characters"),
  referring_case_manager: z.string().min(1, "Referring Case Manager is required"),
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
  const { request, env, params } = context;
  const requestId = params.id;

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
        return await handleGetRequest(requestId, env);
      case "PUT":
        return await handleUpdateRequest(requestId, request, env);
      case "DELETE":
        return await handleDeleteRequest(requestId, env);
      default:
        return new Response(JSON.stringify({ message: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error in admin request detail API:", error);
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleGetRequest(requestId: string, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await env.DB.prepare(`
      SELECT r.*, p.referring_case_manager as partner_name 
      FROM requests r 
      LEFT JOIN partners p ON r.partner_id = p.id 
      WHERE r.id = ?
    `).bind(requestId).first();
    
    if (!result) {
      return new Response(JSON.stringify({ message: "Request not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(result), {
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

async function handleUpdateRequest(requestId: string, request: Request, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const validatedRequest = requestUpdateSchema.parse(body);

    // Check if request exists
    const existingRequest = await env.DB.prepare("SELECT id FROM requests WHERE id = ?").bind(requestId).first();
    if (!existingRequest) {
      return new Response(JSON.stringify({ message: "Request not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if partner exists
    const partner = await env.DB.prepare("SELECT id FROM partners WHERE id = ?").bind(validatedRequest.partner_id).first();
    if (!partner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update request
    await env.DB.prepare(`
      UPDATE requests 
      SET partner_id = ?, referring_case_manager = ?, email = ?, phone = ?, preferred_contact = ?, request_type = ?, urgency = ?, description = ? 
      WHERE id = ?
    `).bind(
      validatedRequest.partner_id,
      validatedRequest.referring_case_manager,
      validatedRequest.email,
      validatedRequest.phone,
      validatedRequest.preferred_contact,
      validatedRequest.request_type,
      validatedRequest.urgency,
      validatedRequest.description,
      requestId
    ).run();

    const updatedRequest = {
      id: requestId,
      ...validatedRequest,
    };

    return new Response(JSON.stringify(updatedRequest), {
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

async function handleDeleteRequest(requestId: string, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Check if request exists
    const existingRequest = await env.DB.prepare("SELECT id FROM requests WHERE id = ?").bind(requestId).first();
    if (!existingRequest) {
      return new Response(JSON.stringify({ message: "Request not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete request
    await env.DB.prepare("DELETE FROM requests WHERE id = ?").bind(requestId).run();

    return new Response(JSON.stringify({ message: "Request deleted successfully" }), {
      status: 200,
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


