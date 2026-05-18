import { z } from "zod";

/**
 * Event Transport Protocol (ETP) Specification v0.1
 * MIME Type: application/etp+json
 */

export const ETPEventLifecycle = z.enum([
  "draft",
  "scheduled",
  "updated",
  "delayed",
  "rescheduled",
  "cancelled",
  "completed",
  "archived",
  "expired"
]);

export type ETPEventLifecycle = z.infer<typeof ETPEventLifecycle>;

export const ETPEventSchema = z.object({
  /** EID: Immutable Event Identity (ULID strongly recommended, prefixed with evt_) */
  eid: z.string().regex(/^evt_[0-9A-HJKMNP-TV-Z]{26}$/),
  
  /** Origin: The canonical authority node that manages this object */
  origin: z.string().url(),
  
  /** Alias: Human-readable slug (optional identifier) */
  alias: z.string().regex(/^[a-z0-9-]+$/).optional(),
  
  /** Recurrence Foundation */
  series_id: z.string().optional(), // Links occurrences to a series
  occurrence_id: z.string().optional(), // Individual instance identifier in a series
  
  /** Versioning: Monotonic version count */
  v: z.number().int().min(1).default(1),
  
  /** Revision: Optional hash of the current payload state for quick comparison */
  rev: z.string().optional(),
  
  /** Timestamps */
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  
  /** Lifecycle State */
  lifecycle: ETPEventLifecycle.default("scheduled"),
  
  /** Protocol version compatibility */
  proto: z.string().default("0.1"),
  
  // Core Data
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  
  /** Supersession logic */
  supersedes: z.string().optional(), // EID or EIDv that this update officially invalidates
  location: z.object({
    name: z.string(),
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  
  // Temporal Logic
  start: z.string().datetime(),
  end: z.string().datetime(),
  timezone: z.string().default("UTC"),
  
  // Participant Logic
  organizer: z.object({
    name: z.string(),
    contact: z.string() // etp://, email, or tel
  }).optional(),
  
  // ETP Synchronization Strategy
  sync: z.object({
    strategy: z.enum(["static", "poll", "stream"]).default("poll"),
    stream_url: z.string().url().optional(),
    poll_interval: z.number().int().optional(), // Seconds
    delta_url: z.string().url().optional(), // URL for fetching incremental changes
  }).default({ strategy: "poll", poll_interval: 3600 }),
  
  // Authority & Crust
  auth: z.object({
    signature: z.string().optional(),
    pubkey: z.string().optional(),
    method: z.enum(["none", "ed25519"]).default("none")
  }).optional(),
  
  // Custom Extensions
  ext: z.record(z.string(), z.any()).optional()
});

export type ETPEvent = z.infer<typeof ETPEventSchema>;
export type EVT = ETPEvent;

/**
 * ETP Transport Bindings and Capabilities
 */
export const ETPCapabilitiesProtocol = z.object({
  version: z.string(),
  transports: z.array(z.enum(["http", "sse", "ws"])),
  features: z.object({
    replay: z.boolean(),
    delta_compression: z.boolean(),
    heartbeat_interval: z.number(),
    max_replay_depth: z.number()
  })
});

export type ETPCapabilities = z.infer<typeof ETPCapabilitiesProtocol>;

/**
 * ETP Synchronization Frames
 */
export type ETPSyncFrame = 
  | { type: "snapshot.sync"; v: number; event: ETPEvent; fallback?: boolean }
  | { type: "delta.sync"; v: number; eid: string; changes: Partial<ETPEvent>; event: ETPEvent; mutation_id?: string }
  | { type: "replay.sync"; status: "start" | "end"; since: number; count: number }
  | { type: "heartbeat"; t: number }
  | { type: "error.sync"; code: string; msg: string }
  | { type: "subscription.state"; state: "active" | "stale" | "recovering" };
