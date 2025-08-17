import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRequestSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
