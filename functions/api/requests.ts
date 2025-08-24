import { z } from 'zod';
import { insertRequestSchema } from '../schema';
import { initializeStorage } from '../storage';

export async function onRequest(context: any) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: "Method not allowed" }), 
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = insertRequestSchema.parse(body);
    
    // Check if database is available
    if (!env.DB) {
      console.log('No database available, using in-memory storage');
      const { MemStorage } = await import('../storage');
      const memStorage = new MemStorage();
      
      // Verify partner exists
      const partner = await memStorage.getPartner(validatedRequest.partnerId);
      if (!partner) {
        return new Response(
          JSON.stringify({ message: "Invalid partner ID" }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const newRequest = await memStorage.createRequest(validatedRequest);
      await sendToZapier(newRequest, partner, env);

      return new Response(
        JSON.stringify(newRequest), 
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use D1 database
    try {
      // Verify partner exists
      const partnerResult = await env.DB.prepare('SELECT * FROM partners WHERE id = ?').bind(validatedRequest.partnerId).first();
      if (!partnerResult) {
        return new Response(
          JSON.stringify({ message: "Invalid partner ID" }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create request
      const requestId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO requests (id, partner_id, referring_case_manager, case_manager_email, case_manager_phone, preferred_contact, request_type, urgency, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        requestId,
        validatedRequest.partnerId,
        validatedRequest.referringCaseManager,
        validatedRequest.caseManagerEmail,
        validatedRequest.caseManagerPhone,
        validatedRequest.preferredContact,
        validatedRequest.requestType,
        validatedRequest.urgency,
        validatedRequest.description,
        new Date().toISOString()
      ).run();

      const newRequest = {
        ...validatedRequest,
        id: requestId,
        createdAt: new Date(),
      };

      await sendToZapier(newRequest, partnerResult, env);

      return new Response(
        JSON.stringify(newRequest), 
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fall back to in-memory storage if database fails
      const { MemStorage } = await import('../storage');
      const memStorage = new MemStorage();
      
      const partner = await memStorage.getPartner(validatedRequest.partnerId);
      if (!partner) {
        return new Response(
          JSON.stringify({ message: "Invalid partner ID" }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const newRequest = await memStorage.createRequest(validatedRequest);
      await sendToZapier(newRequest, partner, env);

      return new Response(
        JSON.stringify(newRequest), 
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          message: "Validation error", 
          errors: error.errors 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ message: "Internal server error" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Function to send data to Zapier webhook
async function sendToZapier(request: any, partner: any, env: any) {
  const zapierWebhookUrl = env.ZAPIER_WEBHOOK_URL;
  
  if (!zapierWebhookUrl) {
    console.log("No Zapier webhook URL configured");
    return;
  }

  try {
    const webhookData = {
      // Request data
      requestId: request.id,
      requestType: request.requestType,
      urgency: request.urgency,
      description: request.description,
      preferredContact: request.preferredContact,
      submittedAt: request.createdAt,
      
      // Partner data
      partnerId: partner.id,
      partnerName: partner.referringCaseManager,
      partnerEmail: partner.caseManagerEmail,
      partnerPhone: partner.caseManagerPhone,
      
      // Additional metadata
      source: "Partner Request Portal",
      timestamp: new Date().toISOString()
    };

    const response = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    if (response.ok) {
      console.log("Successfully sent to Zapier:", response.status);
    } else {
      console.error("Failed to send to Zapier:", response.status);
    }
  } catch (error) {
    console.error("Failed to send to Zapier:", error);
    // Don't throw error - we don't want to break form submission if Zapier fails
  }
}
