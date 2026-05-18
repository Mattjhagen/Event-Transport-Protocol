import { z } from "zod";

/**
 * Event Transport Protocol (ETP) Specification v0.1
 * MIME Type: application/etp+json
 */

export const ETPEventSchema = z.object({
  id: z.string().uuid().optional(),
  v: z.string().default("0.1"),
  created: z.string().datetime().optional(),
  updated: z.string().datetime().optional(),
  
  // Core Data
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  location: z.object({
    name: z.string(),
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  
  // Temporal
  start: z.string().datetime(),
  end: z.string().datetime(),
  timezone: z.string().default("UTC"),
  
  // Participant Logic
  status: z.enum(["confirmed", "tentative", "cancelled"]).default("confirmed"),
  organizer: z.object({
    name: z.string(),
    contact: z.string() // etp://, email, or tel
  }).optional(),
  
  // ETP Features
  dynamic: z.boolean().default(true),
  subscription_url: z.string().url().optional(),
  
  // Metadata for routing
  metadata: z.record(z.string(), z.any()).optional()
});

export type ETPEvent = z.infer<typeof ETPEventSchema>;
export type EVT = ETPEvent;
