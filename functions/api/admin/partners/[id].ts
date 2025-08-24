import { z } from 'zod';

const partnerUpdateSchema = z.object({
  referring_case_manager: z.string().min(1, "Referring Case Manager is required"),
  case_manager_email: z.string().email("Invalid email format"),
  case_manager_phone: z.string().min(1, "Case Manager's Phone is required"),
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
  const partnerId = params.id;

  // Check authentication
  if (!checkAuth(request)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate partner ID format
  if (!/^\d{4}$/.test(partnerId)) {
    return new Response(JSON.stringify({ message: "Invalid partner ID format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    switch (request.method) {
      case "GET":
        return await handleGetPartner(partnerId, env);
      case "PUT":
        return await handleUpdatePartner(partnerId, request, env);
      case "DELETE":
        return await handleDeletePartner(partnerId, env);
      default:
        return new Response(JSON.stringify({ message: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error in admin partner detail API:", error);
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleGetPartner(partnerId: string, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await env.DB.prepare("SELECT * FROM partners WHERE id = ?").bind(partnerId).first();
    if (!result) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
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

async function handleUpdatePartner(partnerId: string, request: Request, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const validatedPartner = partnerUpdateSchema.parse(body);

    // Check if partner exists
    const existingPartner = await env.DB.prepare("SELECT id FROM partners WHERE id = ?").bind(partnerId).first();
    if (!existingPartner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update partner
    await env.DB.prepare(
      "UPDATE partners SET referring_case_manager = ?, case_manager_email = ?, case_manager_phone = ? WHERE id = ?"
    ).bind(validatedPartner.referring_case_manager, validatedPartner.case_manager_email, validatedPartner.case_manager_phone, partnerId).run();

    const updatedPartner = {
      id: partnerId,
      ...validatedPartner,
    };

    return new Response(JSON.stringify(updatedPartner), {
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

async function handleDeletePartner(partnerId: string, env: any) {
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database not available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Check if partner exists
    const existingPartner = await env.DB.prepare("SELECT id FROM partners WHERE id = ?").bind(partnerId).first();
    if (!existingPartner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if partner has associated requests
    const associatedRequests = await env.DB.prepare("SELECT COUNT(*) as count FROM requests WHERE partner_id = ?").bind(partnerId).first();
    if (associatedRequests && associatedRequests.count > 0) {
      return new Response(JSON.stringify({ 
        message: "Cannot delete partner with associated requests. Delete the requests first." 
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete partner
    await env.DB.prepare("DELETE FROM partners WHERE id = ?").bind(partnerId).run();

    return new Response(JSON.stringify({ message: "Partner deleted successfully" }), {
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


