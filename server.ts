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
const subscribers = new Map<string, Set<(data: any) => void>>();

/**
 * --- ETP API v0.1 ---
 */

// GET /api/e/:id/stream: Subscribe to EID updates
app.get("/api/e/:id/stream", (c) => {
  const id = c.req.param("id");
  const event = eventStore.get(id);
  
  if (!event) return c.json({ error: "Event not found" }, 404);

  return stream(c, async (stream) => {
    stream.onAbort(() => {
      // Hono's onAbort covers client disconnection
    });
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    // Send initial snapshot
    await stream.write(`data: ${JSON.stringify({ type: 'snapshot', event })}\n\n`);

    const sendUpdate = (data: any) => {
      stream.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    if (!subscribers.has(id)) subscribers.set(id, new Set());
    subscribers.get(id)!.add(sendUpdate);

    // Clean up on disconnect
    c.req.raw.signal.addEventListener("abort", () => {
      subscribers.get(id)?.delete(sendUpdate);
      if (subscribers.get(id)?.size === 0) subscribers.delete(id);
    });

    // Keep connection alive
    while (!c.req.raw.signal.aborted) {
      await new Promise(resolve => setTimeout(resolve, 30000));
      await stream.write(": keep-alive\n\n");
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

// PATCH /api/e/:id: Mutate an event (Authoritative update)
app.patch("/api/e/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = eventStore.get(id);

  if (!existing) return c.json({ error: "Event not found" }, 404);

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

  // BROADCAST TO SUBSCRIBERS
  const eidSubscribers = subscribers.get(id);
  if (eidSubscribers) {
    const delta = { 
      type: 'delta', 
      v: finalEvent.v,
      eid: finalEvent.eid,
      changes: body,
      event: finalEvent // Standard ETP sends full snapshot for v0.1 over stream
    };
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
