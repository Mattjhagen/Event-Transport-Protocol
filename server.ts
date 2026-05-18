import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { stream } from "hono/streaming";
import { ulid } from "ulid";
import dotenv from "dotenv";
import path from "path";
import { createServer as createViteServer } from "vite";

import { ETPEventSchema, ETPEvent } from "./src/types";
import { detectPlatform } from "./src/lib/router";
import { generateICS } from "./src/lib/ics";

dotenv.config();

const app = new Hono();
const eventStore = new Map<string, ETPEvent>();
const deltaHistory = new Map<string, any[]>(); // Stores deltas for replay
const processedMutations = new Set<string>(); // For idempotency
const subscribers = new Map<string, Set<(data: any) => void>>();

/**
 * --- ETP API v0.1 ---
 */

// GET /api/e/:id/stream: Subscribe to EID updates with Replay Support
app.get("/api/e/:id/stream", (c) => {
  const id = c.req.param("id");
  const event = eventStore.get(id);
  const sinceVersion = parseInt(c.req.query("since") || c.req.header("Last-Event-ID") || "0");
  
  if (!event) return c.json({ error: "Event not found" }, 404);

  return stream(c, async (stream) => {
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    // REPLAY SEMANTICS
    if (sinceVersion > 0 && sinceVersion < event.v) {
      const history = deltaHistory.get(id) || [];
      const missedDeltas = history.filter(d => d.v > sinceVersion);
      
      if (missedDeltas.length > 0) {
        for (const delta of missedDeltas) {
          await stream.write(`id: ${delta.v}\n`);
          await stream.write(`data: ${JSON.stringify({ type: 'delta.sync', ...delta })}\n\n`);
        }
      } else {
        // Gap too large or history purged, send full snapshot
        await stream.write(`id: ${event.v}\n`);
        await stream.write(`data: ${JSON.stringify({ type: 'snapshot.sync', event, fallback: true })}\n\n`);
      }
    } else {
      // Direct Snapshot
      await stream.write(`id: ${event.v}\n`);
      await stream.write(`data: ${JSON.stringify({ type: 'snapshot.sync', event })}\n\n`);
    }

    const sendUpdate = (data: any) => {
      stream.write(`id: ${data.v}\n`);
      stream.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    if (!subscribers.has(id)) subscribers.set(id, new Set());
    subscribers.get(id)!.add(sendUpdate);

    // Keep connection alive
    const heartbeat = setInterval(() => {
      stream.write(": heartbeat\n\n");
    }, 15000);

    c.req.raw.signal.addEventListener("abort", () => {
      clearInterval(heartbeat);
      subscribers.get(id)?.delete(sendUpdate);
      if (subscribers.get(id)?.size === 0) subscribers.delete(id);
    });

    while (!c.req.raw.signal.aborted) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });
});

// POST /api/e: Register a new event object
app.post("/api/e", async (c) => {
  const body = await c.req.json();
  
  const eid = `evt_${ulid()}`;
  const now = new Date().toISOString();
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  
  // Inject protocol defaults
  const eventPayload = {
    ...body,
    eid,
    origin: baseUrl,
    v: 1, 
    created_at: now,
    updated_at: now,
    lifecycle: body.lifecycle || "scheduled",
    proto: "0.1",
    sync: body.sync || { 
      strategy: "stream", 
      stream_url: `${baseUrl}/api/e/${eid}/stream`,
      poll_interval: 3600 
    }
  };

  const validation = ETPEventSchema.safeParse(eventPayload);
  
  if (!validation.success) {
    return c.json({ error: "Invalid EVT Object", details: validation.error }, 400);
  }

  const etpEvent = validation.data;
  eventStore.set(eid, etpEvent);
  deltaHistory.set(eid, [{ type: 'event.created', v: 1, eid, event: etpEvent }]);

  c.header("X-ETP-EID", eid);
  c.header("X-ETP-Version", "0.1");
  c.header("X-ETP-Origin", baseUrl);
  
  return c.json({
    event: etpEvent,
    links: {
      etp: `etp://${eid}`,
      universal: `${baseUrl}/e/${eid}`,
      ics: `${baseUrl}/e/${eid}.ics`
    }
  }, 201);
});

// PATCH /api/e/:id: Mutate an event with Idempotency and History
app.patch("/api/e/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const mutationId = c.req.header("X-Mutation-ID") || body.mutation_id;
  
  if (mutationId && processedMutations.has(mutationId)) {
    return c.json(eventStore.get(id), 200, { "X-ETP-Idempotent": "true" });
  }

  const existing = eventStore.get(id);
  if (!existing) return c.json({ error: "Event not found" }, 404);

  // Strict Version Enforcement
  const requestedVersion = parseInt(c.req.header("X-ETP-If-Version") || body.v_expected || "0");
  if (requestedVersion > 0 && requestedVersion !== existing.v) {
    return c.json({ error: "Conflict: Version mismatch", current_v: existing.v }, 409);
  }

  const updatedEvent: ETPEvent = {
    ...existing,
    ...body,
    v: existing.v + 1,
    updated_at: new Date().toISOString(),
  };

  const validation = ETPEventSchema.safeParse(updatedEvent);
  if (!validation.success) {
    return c.json({ error: "Invalid mutation", details: validation.error }, 400);
  }

  const finalEvent = validation.data;
  eventStore.set(id, finalEvent);
  if (mutationId) processedMutations.add(mutationId);

  // RECORD DELTA IN HISTORY
  const delta = { 
    type: 'event.updated', 
    v: finalEvent.v,
    eid: finalEvent.eid,
    changes: body,
    event: finalEvent, // v0.1 simplification
    mutation_id: mutationId
  };
  
  const history = deltaHistory.get(id) || [];
  history.push(delta);
  deltaHistory.set(id, history.slice(-50)); // Retention limit

  // BROADCAST TO SUBSCRIBERS
  const eidSubscribers = subscribers.get(id);
  if (eidSubscribers) {
    eidSubscribers.forEach(send => send(delta));
  }

  return c.json(finalEvent);
});

// GET /api/e/:id: Fetch raw EVT object (supports EID or Alias)
app.get("/api/e/:id", (c) => {
  const id = c.req.param("id");
  let event = eventStore.get(id);

  // Simple alias lookup (if not found by ID)
  if (!event) {
    event = Array.from(eventStore.values()).find(e => e.alias === id);
  }
  
  if (!event) return c.json({ error: "Event not found" }, 404);
  
  c.header("Content-Type", "application/etp+json");
  c.header("X-ETP-EID", event.eid);
  c.header("X-ETP-Version", event.proto);
  
  // Cache control for pollers
  if (event.sync.strategy === "poll") {
    c.header("X-Poll-Interval", String(event.sync.poll_interval));
  }

  return c.json(event);
});

/**
 * --- UNIVERSAL ROUTER ---
 */

app.get("/e/:id", (c) => {
  const id = c.req.param("id");
  let event = eventStore.get(id);
  
  if (!event) {
    event = Array.from(eventStore.values()).find(e => e.alias === id);
  }

  if (!event) return c.text("Event Identity not found", 404);

  const userAgent = c.req.header("user-agent") || "";
  const accept = c.req.header("accept") || "";
  
  const routing = detectPlatform(userAgent, accept);

  // Canonical EID Header
  c.header("X-ETP-EID", event.eid);

  // Core Protocol Handshake
  if (routing.platform === 'etp-client') {
    c.header("Content-Type", "application/etp+json");
    c.header("X-ETP-Version", "0.1");
    return c.json(event);
  }

  // Native Deep Linking or Redirects
  // Always append EID to query to ensure UI knows canonical state
  return c.redirect(`/?id=${event.eid}`);
});

/**
 * --- ICS COMPATIBILITY LAYER ---
 */

app.get("/e/:id.ics", (c) => {
  const id = c.req.param("id");
  const event = eventStore.get(id);
  
  if (!event) return c.text("Not found", 404);

  const ics = generateICS(event);
  
  return c.text(ics, 200, {
    "Content-Type": "text/calendar",
    "Content-Disposition": `attachment; filename="${id}.ics"`
  });
});

/**
 * --- DEV SERVER / STATIC ASSETS ---
 */

async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Use Hono's middleware for Vite
    app.all("*", async (c, next) => {
      // Allow API and ICS routes to handle their own responses
      if (c.req.path.startsWith("/api/") || c.req.path.endsWith(".ics") || c.req.path.startsWith("/e/")) {
        return await next();
      }

      // Vite middleware needs standard node request/response
      // The @hono/node-server provides access to raw objects
      const nodeReq = (c.req as any).raw;
      const nodeRes = (c.res as any).raw;

      if (!nodeReq || !nodeRes) return await next();

      const res = await new Promise<any>((resolve) => {
        vite.middlewares(nodeReq, nodeRes, resolve);
      });
      return res;
    });
  } else {
    app.use("*", serveStatic({ root: "./dist" }));
  }

  const port = 3000;
  console.log(`ETP Hono Router running at http://localhost:${port}`);
  
  serve({
    fetch: app.fetch,
    port: port
  });
}

main();
