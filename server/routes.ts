import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRequestSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Partner lookup endpoint
  app.get("/api/partners/:id", async (req, res) => {
    try {
      const partnerId = req.params.id;
      
      // Validate partner ID format (4 digits)
      if (!/^\d{4}$/.test(partnerId)) {
        return res.status(400).json({ message: "Partner ID must be exactly 4 digits" });
      }

      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner ID not found. Please check your ID and try again." });
      }

      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Request submission endpoint
  app.post("/api/requests", async (req, res) => {
    try {
      const validatedRequest = insertRequestSchema.parse(req.body);
      
      // Verify partner exists
      const partner = await storage.getPartner(validatedRequest.partnerId);
      if (!partner) {
        return res.status(400).json({ message: "Invalid partner ID" });
      }

      const request = await storage.createRequest(validatedRequest);

      // Send to Zapier webhook if configured
      await sendToZapier(request, partner);

      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Zapier webhook endpoint for testing
  app.post("/api/zapier/webhook", async (req, res) => {
    try {
      console.log("Zapier webhook received:", req.body);
      res.status(200).json({ 
        message: "Webhook received successfully",
        data: req.body 
      });
    } catch (error) {
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Function to send data to Zapier webhook
async function sendToZapier(request: any, partner: any) {
  const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  
  if (!zapierWebhookUrl) {
    console.log("No Zapier webhook URL configured");
    return;
  }

  try {
    const webhookData = {
      // Request data
      requestId: request.id,
      urgency: request.urgency,
      description: request.description,
      preferredContact: request.preferredContact,
      submittedAt: request.createdAt,
      
      // Partner data
      partnerId: partner.id,
      partnerName: partner.fullName,
      partnerEmail: partner.email,
      partnerPhone: partner.phone,
      
      // Additional metadata
      source: "Partner Request Portal",
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(zapierWebhookUrl, webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log("Successfully sent to Zapier:", response.status);
  } catch (error) {
    console.error("Failed to send to Zapier:", error.message);
    // Don't throw error - we don't want to break form submission if Zapier fails
  }
}
