import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { stream } from "hono/streaming";
import { ulid } from "ulid";
import dotenv from "dotenv";
// import path from "path";
import { createServer as createViteServer } from "vite";

import { WebSocketServer } from "ws";
import crypto from "crypto";
import { ETPEventSchema, ETPEvent, ETPCapabilities, ETPNodeIdentity } from "./src/types";
import { detectPlatform } from "./src/lib/router";
import { generateICS } from "./src/lib/ics";

dotenv.config();

const app = new Hono();
const eventStore = new Map<string, ETPEvent>();
const deltaHistory = new Map<string, any[]>(); // Stores deltas for replay
const processedMutations = new Set<string>(); // For idempotency

// Precompute and seed default recurring event for instant testing
const DEFAULT_EVENT_ID = "evt_01HV2W3J9K4Z7X5M2Y8Q1R0S3N";
const seedDefaultEvent = () => {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const now = new Date().toISOString();
  
  const defaultEvent: ETPEvent = {
    eid: DEFAULT_EVENT_ID,
    origin: baseUrl,
    alias: "demo-sync",
    v: 1,
    created_at: now,
    updated_at: now,
    lifecycle: "scheduled",
    proto: "0.1",
    title: "Weekly Engineering sync (ETP Demo)",
    description: "Aligning on the Event Transport Protocol (ETP) draft updates and scheduling reference implementations.",
    start: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    end: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
    timezone: "UTC",
    location: {
      name: "Metaverse / Stockholm E-Node 4"
    },
    sync: {
      strategy: "stream",
      stream_url: `${baseUrl}/api/e/${DEFAULT_EVENT_ID}/stream`,
      poll_interval: 3600
    },
    auth: {
      signature: "etp-initial-seeded-signature-01",
      method: "ed25519"
    },
    ext: {
      recurrence: "weekly",
      attendees: [
        { email: "organizer@evt.life", status: "accepted" },
        { email: "mattjhagen0@gmail.com", status: "pending" },
        { email: "engineering@etp.dev", status: "accepted" }
      ],
      organizerToken: "demo-organizer-secret-2026"
    }
  };
  eventStore.set(DEFAULT_EVENT_ID, defaultEvent);
  deltaHistory.set(DEFAULT_EVENT_ID, [{ type: 'event.created', v: 1, eid: DEFAULT_EVENT_ID, event: defaultEvent }]);
};
seedDefaultEvent();

// Generic subscriber type for transport neutrality
type ETPHandler = (data: any) => void;
const subscribers = new Map<string, Set<ETPHandler>>();

/**
 * --- ETP NODE IDENTITY ---
 */
const NODE_IDENTITY: ETPNodeIdentity = {
  node_id: "node.eventtransport.dev",
  public_key: "ed25519_pk_8v2j9k...",
  algorithm: "ed25519",
  metadata: {
    operator: "ETP Foundation",
    region: "us-west-1",
    trust_score: 0.99
  }
};

/**
 * SIG-HELPERS: Lightweight authenticity simulation
 * In a real node, this would use Ed25519 private keys.
 */

function sanitizeEvent(event: ETPEvent) {
  const clone = structuredClone(event);

  if (clone.ext?.organizerToken) {
    delete clone.ext.organizerToken;
  }

  return clone;
}

function signPayload(payload: any): string {
  const content = JSON.stringify(payload);
  return crypto.createHmac("sha256", "etp-demo-secret").update(content).digest("hex");
}

function encodeEventToId(body: any): string {
  const startUnix = body.start ? Math.floor(new Date(body.start).getTime() / 1000) : 0;
  const endUnix = body.end ? Math.floor(new Date(body.end).getTime() / 1000) : 0;

  const rec = body.ext?.recurrence || body.recurrence || "none";
  let rCode = "n";
  if (rec === "daily") rCode = "d";
  else if (rec === "weekly") rCode = "w";
  else if (rec === "monthly") rCode = "m";
  else if (rec === "yearly") rCode = "y";

  const compact = {
    t: body.title || "Untitled",
    d: body.description ? body.description.substring(0, 100) : "",
    s: startUnix,
    e: endUnix,
    l: body.location?.name || "",
    g: (body.lifecycle || "scheduled").substring(0, 1),
    r: rCode,
    at: body.ext?.attendees?.map((a: any) => a.email) || []
  };

  const str = JSON.stringify(compact);
  const base64 = Buffer.from(str, "utf-8").toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `evt_c_${base64}`;
}

function decodeEventFromId(eid: string, baseUrl: string): ETPEvent | null {
  if (!eid.startsWith("evt_c_")) return null;
  try {
    const base64 = eid.substring(6)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const jsonStr = Buffer.from(padded, "base64").toString("utf-8");
    const compact = JSON.parse(jsonStr);

    const startISO = new Date((compact.s || 0) * 1000).toISOString();
    const endISO = new Date((compact.e || 0) * 1000).toISOString();

    let lifecycle = "scheduled";
    if (compact.g === "d") lifecycle = "draft";
    else if (compact.g === "u") lifecycle = "updated";
    else if (compact.g === "c") lifecycle = "cancelled";

    let recurrence = "none";
    if (compact.r === "d") recurrence = "daily";
    else if (compact.r === "w") recurrence = "weekly";
    else if (compact.r === "m") recurrence = "monthly";
    else if (compact.r === "y") recurrence = "yearly";

    const now = new Date().toISOString();
    return {
      eid,
      origin: baseUrl,
      v: 1,
      created_at: now,
      updated_at: now,
      lifecycle: lifecycle as any,
      proto: "0.1",
      title: compact.t || "Untitled Event",
      description: compact.d || "",
      start: startISO,
      end: endISO,
      timezone: "UTC",
      location: compact.l ? { name: compact.l } : undefined,
      sync: {
        strategy: "stream",
        stream_url: `${baseUrl}/api/e/${eid}/stream`,
        poll_interval: 3600
      },
      auth: {
        signature: "stateless-decoded-sig",
        method: "ed25519"
      },
      ext: {
        recurrence,
        attendees: compact.at ? compact.at.map((email: string) => ({ email, status: "pending" })) : []
      }
    };
  } catch (err) {
    console.error("Failed to decode stateless event ID:", err);
    return null;
  }
}

function findEvent(id: string, baseUrl: string): ETPEvent | undefined {
  let event = eventStore.get(id);
  if (event) return event;
  
  // Try mapping by alias
  event = Array.from(eventStore.values()).find(e => e.alias === id);
  if (event) return event;

  // Try decoding as a stateless self-contained ID
  if (id.startsWith("evt_c_") || id.startsWith("api_e_evt_c_") || id.includes("evt_c_")) {
    const cleanId = id.includes("evt_c_") ? "evt_c_" + id.split("evt_c_")[1] : id;
    const decoded = decodeEventFromId(cleanId, baseUrl);
    if (decoded) return decoded;
  }
  
  return undefined;
}

/**
 * --- ETP PROTOCOL METADATA ---
 */

app.get("/api/capabilities", (c) => {
  const capabilities: ETPCapabilities & { identity: ETPNodeIdentity } = {
    version: "0.1",
    transports: ["http", "sse", "ws"],
    features: {
      replay: true,
      delta_compression: false,
      heartbeat_interval: 15,
      max_replay_depth: 50
    },
    identity: NODE_IDENTITY
  };
  return c.json(capabilities);
});

app.get("/node", (c) => {
  return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>EVT.life</title>
  <style>
    body {
      background: #0f172a;
      color: #e2e8f0;
      font-family: Inter, Arial, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
    }

    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    h1 {
      margin-top: 0;
      color: white;
    }

    a {
      color: #38bdf8;
      text-decoration: none;
    }

    .button {
      display: inline-block;
      padding: 12px 18px;
      margin-right: 12px;
      margin-top: 12px;
      background: #2563eb;
      color: white;
      border-radius: 10px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>EVT.life</h1>

    <p>Event Transport Protocol Reference Node</p>

    <p>
      Decentralized event identity, synchronization,
      federation, and transport.
    </p>

    <a class="button" href="/api/capabilities">
      Capabilities
    </a>

    <a class="button" href="/e/evt_01HV2W3J9K4Z7X5M2Y8Q1R0S3N">
      Demo Event
    </a>
  </div>
</body>
</html>
`);
});

app.get("/api/bridges", (c) => {
  const bridges = [
    {
      id: "ics-legacy",
      name: "Standard ICS Bridge",
      mode: "snapshot-only",
      features: ["Static Export", "Universal Support"],
      degradations: ["No Sync", "No Authority", "Manual Refresh Only"]
    },
    {
      id: "webcal-compatible",
      name: "WebCal Adaptive Bridge",
      mode: "compatible",
      features: ["Periodic Refresh", "Auto-Polling"],
      degradations: ["High Latency", "No Replay", "Flattened Lifecycle"]
    }
  ];
  return c.json(bridges);
});

/**
 * --- ETP API v0.1 ---
 */

// GET /api/e/:id/stream: SSE Transport Binding
app.get("/api/e/:id/stream", (c) => {
  const id = c.req.param("id");
  const reqUrl = new URL(c.req.url);
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  const event = findEvent(id, baseUrl);
  const sinceVersion = parseInt(c.req.query("since") || c.req.header("Last-Event-ID") || "0");
  
  if (!event) return c.json({ error: "Event not found" }, 404);

  return stream(c, async (stream) => {
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    // Transport initialization frame handled below
    const sendFrame = (data: any) => {
      if (data.v) stream.write(`id: ${data.v}\n`);
      stream.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // REPLAY SEMANTICS
    if (sinceVersion > 0 && sinceVersion < event.v) {
      const history = deltaHistory.get(id) || [];
      const missedDeltas = history.filter(d => d.v > sinceVersion);
      
      if (missedDeltas.length > 0) {
        missedDeltas.forEach(delta => sendFrame({ type: 'delta.sync', ...delta }));
      } else {
        sendFrame({ type: 'snapshot.sync', event: sanitizeEvent(event), fallback: true });
      }
    } else {
      sendFrame({ type: 'snapshot.sync', event: sanitizeEvent(event) });
    }

    if (!subscribers.has(id)) subscribers.set(id, new Set());
    subscribers.get(id)!.add(sendFrame);

    // Heartbeat
    const heartbeat = setInterval(() => {
      stream.write(`event: heartbeat\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`);
    }, 15000);

    c.req.raw.signal.addEventListener("abort", () => {
      clearInterval(heartbeat);
      subscribers.get(id)?.delete(sendFrame);
    });

    while (!c.req.raw.signal.aborted) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });
});

// POST /api/e: Register a new event object
app.post("/api/e", async (c) => {
  const body = await c.req.json();
  
  const eid = encodeEventToId(body);
  const now = new Date().toISOString();
  
  // Dynamically determine the base URL from the incoming request to ensure it's a valid absolute URL matching the environment
  const reqUrl = new URL(c.req.url);
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  
  // Inject protocol defaults
  const eventPayload = {
    ...body,
    eid,
    origin: baseUrl,
    v: 1, 
    created_at: now,
    updated_at: now,
    lifecycle: body.lifecycle || "scheduled",
    timezone: body.timezone || "UTC",
    series_id: body.series_id,
    occurrence_id: body.occurrence_id,
    proto: "0.1",
    auth: {
      method: "ed25519",
      pubkey: NODE_IDENTITY.public_key,
      signature: ""
    },
    sync: {
      strategy: body.sync?.strategy || "stream",
      stream_url: body.sync?.stream_url || `${baseUrl}/api/e/${eid}/stream`,
      poll_interval: body.sync?.poll_interval || 3600,
      delta_url: body.sync?.delta_url
    }
  };

  const validation = ETPEventSchema.safeParse(eventPayload);
  
  if (!validation.success) {
    console.error("ETP Event creation schema validation failed:", JSON.stringify(validation.error.format(), null, 2));
    return c.json({ error: "Invalid EVT Object", details: validation.error }, 400);
  }

  const etpEvent = validation.data;
  // Sign the initial snapshot
  if (etpEvent.auth) {
    etpEvent.auth.signature = signPayload({ eid: etpEvent.eid, v: etpEvent.v, payload: etpEvent.title });
  }
  
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
  
  const reqUrl = new URL(c.req.url);
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  
  if (mutationId && processedMutations.has(mutationId)) {
    return c.json(findEvent(id, baseUrl), 200, { "X-ETP-Idempotent": "true" });
  }

  const existing = findEvent(id, baseUrl);
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
    supersedes: body.supersedes || `${existing.eid}v${existing.v}`
  };

  const validation = ETPEventSchema.safeParse(updatedEvent);
  if (!validation.success) {
    return c.json({ error: "Invalid mutation", details: validation.error }, 400);
  }

  const finalEvent = validation.data;
  // Authoritative Signature for vNext
  if (finalEvent.auth) {
    finalEvent.auth.signature = signPayload({ eid: finalEvent.eid, v: finalEvent.v, cid: mutationId });
  }

  eventStore.set(id, finalEvent);
  if (mutationId) processedMutations.add(mutationId);

  // RECORD DELTA IN HISTORY
  const delta = { 
    type: 'event.updated', 
    v: finalEvent.v,
    eid: finalEvent.eid,
    changes: body,
    event: sanitizeEvent(finalEvent), // v0.1 simplification
    mutation_id: mutationId,
    signature: signPayload({ eid: finalEvent.eid, v: finalEvent.v, delta: true })
  };
  
  const history = deltaHistory.get(id) || [];
  history.push(delta);
  deltaHistory.set(id, history.slice(-50)); // Retention limit

  // BROADCAST TO ALL TRANSPORTS
  const eidSubscribers = subscribers.get(id);
  if (eidSubscribers) {
    eidSubscribers.forEach(send => send(delta));
  }

  return c.json(sanitizeEvent(finalEvent));
});

/**
 * --- ETP WEBSOCKET BINDING ---
 */

function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: any, socket: any, head: any) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    if (url.pathname === '/api/etp-ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    let currentEid: string | null = null;
    let sendFrame: ETPHandler | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'etp.subscribe') {
          const { eid, since } = data;
          const event = eventStore.get(eid);
          
          if (!event) {
            ws.send(JSON.stringify({ type: 'error.sync', code: 'NOT_FOUND', msg: 'Event not found' }));
            return;
          }

          // Unsubscribe from previous if any
          if (currentEid && sendFrame) {
            subscribers.get(currentEid)?.delete(sendFrame);
          }

          currentEid = eid;
          sendFrame = (frame: any) => ws.send(JSON.stringify(frame));

          // Send Replay/Snapshot
          const sinceVersion = parseInt(since || "0");
          if (sinceVersion > 0 && sinceVersion < event.v) {
             const history = deltaHistory.get(eid) || [];
             const missed = history.filter(d => d.v > sinceVersion);
             if (missed.length > 0) {
               missed.forEach(d => sendFrame!({ type: 'delta.sync', ...d }));
             } else {
               if (sendFrame) sendFrame({ type: 'snapshot.sync', event: sanitizeEvent(event), fallback: true });
             }
          } else {
             if (sendFrame) sendFrame({ type: 'snapshot.sync', event: sanitizeEvent(event) });
          }

          if (!subscribers.has(eid)) subscribers.set(eid, new Set());
          subscribers.get(eid)!.add(sendFrame);
          
          ws.send(JSON.stringify({ type: 'subscription.state', state: 'active', eid }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error.sync', code: 'MALFORMED', msg: 'Invalid ETP Frame' }));
      }
    });

    const heartbeat = setInterval(() => {
      if (ws.readyState === 1) { // 1 = OPEN
        ws.send(JSON.stringify({ type: 'heartbeat', t: Date.now() }));
      }
    }, 15000);

    ws.on('close', () => {
      clearInterval(heartbeat);
      if (currentEid && sendFrame) {
        subscribers.get(currentEid)?.delete(sendFrame);
      }
    });
  });

  console.log("ETP WebSocket Binding Active at /api/etp-ws");
}

/**
 * --- GET /api/e/:id: Fetch raw EVT object ---
 */
app.get("/api/e/:id", (c) => {
  const id = c.req.param("id");
  const reqUrl = new URL(c.req.url);
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  let event = findEvent(id, baseUrl);
  
  if (!event) return c.json({ error: "Event not found" }, 404);
  
  c.header("Content-Type", "application/etp+json");
  c.header("X-ETP-EID", event.eid);
  c.header("X-ETP-Version", event.proto);
  
  // Cache control for pollers
  if (event.sync.strategy === "poll") {
    c.header("X-Poll-Interval", String(event.sync.poll_interval));
  }

  return c.json(sanitizeEvent(event));
});

/**
 * --- UNIVERSAL ROUTER ---
 */

const handleUniversal = (c: any) => {
  const id = c.req.param("id");
  const reqUrl = new URL(c.req.url);
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  let event = findEvent(id, baseUrl);

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
    return c.json(sanitizeEvent(event));
  }

  // Native Deep Linking or Redirects
  // Always append EID to query to ensure UI knows canonical state
return c.html(`
<!DOCTYPE html>
<html>
<head>
<style>
body {
  background: #0f172a;
  color: #e2e8f0;
  font-family: Inter, Arial, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  line-height: 1.6;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

h1 {
  margin-top: 0;
  color: white;
}

.meta {
  color: #94a3b8;
}

a {
  color: #38bdf8;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.button {
  display: inline-block;
  padding: 12px 18px;
  margin-right: 12px;
  margin-top: 12px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  text-decoration: none;
}

.button:hover {
  background: #1d4ed8;
}

code {
  background: #0f172a;
  padding: 4px 8px;
  border-radius: 6px;
}
</style>
  <title>${event.title}</title>
</head>
</div>
<body>
<div class="card">
  <h1>${event.title}</h1>

  <p>${event.description}</p>

  <p><strong>Event ID:</strong> ${event.eid}</p>

  <p><strong>Starts:</strong> ${event.start}</p>

  <p><strong>Ends:</strong> ${event.end}</p>

  <p>
<a class="button" href="/api/e/${event.eid}">
  View JSON
</a>
  </p>

  <p>
<a class="button" href="/calendar/${event.eid}">
  Add to  Calendar
</a>
  </p>
</body>
</html>
`);
};


/**
 * --- ICS COMPATIBILITY LAYER ---
 */

const handleICS = (c: any) => {
  console.log("PARAMS:", c.req.param());

const rawId =
  c.req.param("id") ||
  c.req.param("id.ics") ||
  "";

const id = rawId.replace(/\.ics$/i, "");

console.log("RAW ICS ID:", rawId);
console.log("ICS ID:", id);

const reqUrl = new URL(c.req.url);
 
 const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  const event = findEvent(id, baseUrl);

  if (!event) return c.text("Not found", 404);

  const ics = generateICS(event);

  return c.text(ics, 200, {
    "Content-Type": "text/calendar",
    "Content-Disposition": `attachment; filename="${id}.ics"`
  });
};

app.get("/e/:id.ics", handleICS);
app.get("/api/e/:id.ics", handleICS);
app.get("/calendar/:id", handleICS);
app.get("/e/:id", handleUniversal);
app.get("/api/e/:id/redirect", handleUniversal);

/**
 * --- DEV SERVER / STATIC ASSETS ---
 */

async function main() {

  console.log("Vite disabled for testing");

  const port = Number(process.env.PORT) || 8081;

  console.log(`ETP Hono Router running at http://localhost:${port}`);

  const server = serve({

    fetch: app.fetch,

    port: port

  });

  setupWebSocket(server);
}

if (!process.env.VERCEL) {
  main();
}

export default app;
