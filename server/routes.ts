/**
 * API Routes Configuration
 * 
 * Express.js routes that provide:
 * - Data fetching endpoints (regions, roles, seniority levels)
 * - Currency exchange rate management
 * - Email sending functionality
 * - Calculator options (workload, duration)
 * 
 * Features:
 * - RESTful API design
 * - Error handling and validation
 * - External API integration
 * - Database operations via Supabase
 * - CORS support
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabaseStorage } from "./supabaseStorage";
import { sendEmail } from "./services/sendgrid";
import { updateExchangeRates } from "./services/currency";
import { insertQuoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all regions
  app.get("/api/regions", async (_req, res) => {
    try {
      const regions = await supabaseStorage.getRegions();
      res.json(regions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch regions" });
    }
  });

  // Get roles by category
  app.get("/api/roles/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const roles = await supabaseStorage.getRolesByCategory(category);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  // Get all seniority levels
  app.get("/api/seniority-levels", async (_req, res) => {
    try {
      const levels = await supabaseStorage.getSeniorityLevels();
      res.json(levels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seniority levels" });
    }
  });

  // Get calculator options (workload and duration)
  app.get("/api/calculator-options", async (_req, res) => {
    try {
      const workloadOptions = await supabaseStorage.getWorkloadOptions();
      const durationOptions = await supabaseStorage.getDurationOptions();
      res.json({
        workloadOptions,
        durationOptions
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calculator options" });
    }
  });

  // Get all currencies
  app.get("/api/currencies", async (_req, res) => {
    try {
      const currencies = await supabaseStorage.getCurrencies();
      const baseCurrency = await supabaseStorage.getCurrentBaseCurrency();
      res.json({ currencies, baseCurrency });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });

  // Update currency exchange rates
  app.post("/api/currencies/update-rates", async (req, res) => {
    try {
      const { baseCurrency = 'AED' } = req.body;
      const rates = await updateExchangeRates(baseCurrency);
      await supabaseStorage.updateCurrencyRates(rates, baseCurrency);
      res.json({ message: "Exchange rates updated successfully", rates, baseCurrency });
    } catch (error) {
      res.status(500).json({ message: "Failed to update exchange rates" });
    }
  });

  // Save quote
  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await supabaseStorage.createQuote(validatedData);
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  // Send email quote
  app.post("/api/send-quote", async (req, res) => {
    try {
      const { recipientEmail, senderName, message, quoteData } = req.body;
      
      if (!recipientEmail || !senderName || !quoteData) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const emailSent = await sendEmail({
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@ratecard.com",
        subject: `Rate Card Quote - ${quoteData.type === 'custom' ? 'Custom Resource' : 'SWAT Team'}`,
        html: generateQuoteEmailHTML(quoteData, senderName, message),
      });

      if (emailSent) {
        res.json({ message: "Quote sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send quote" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateQuoteEmailHTML(quoteData: any, senderName: string, message?: string): string {
  const { type, configuration, finalRate, currency } = quoteData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rate Card Quote</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .rate-highlight { font-size: 24px; font-weight: bold; color: #3b82f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rate Card Quote</h1>
          <p>Professional Resource Planning</p>
        </div>
        <div class="content">
          <p>Dear Client,</p>
          <p>Please find below your ${type === 'custom' ? 'Custom Resource' : 'SWAT Team'} rate calculation:</p>
          
          <div class="quote-details">
            <h3>${type === 'custom' ? 'Custom Resource Calculator' : 'SWAT Team Calculator'}</h3>
            ${type === 'custom' ? `
              <p><strong>Region:</strong> ${configuration.region}</p>
              <p><strong>Role:</strong> ${configuration.role}</p>
              <p><strong>Seniority:</strong> ${configuration.seniority}</p>
            ` : `
              <p><strong>Role:</strong> ${configuration.role}</p>
              <p><strong>Workload:</strong> ${configuration.workload}%</p>
              <p><strong>Duration:</strong> ${configuration.duration} months</p>
              <p><strong>Seniority:</strong> ${configuration.seniority}</p>
            `}
            <hr>
            <p class="rate-highlight">Final Monthly Rate: ${finalRate.toLocaleString()} ${currency}</p>
          </div>
          
          ${message ? `
            <div class="quote-details">
              <h4>Additional Notes:</h4>
              <p>${message}</p>
            </div>
          ` : ''}
          
          <p>Best regards,<br>${senderName}</p>
          
          <hr>
          <p><small>This quote was generated using the Rate Card Calculator system.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
