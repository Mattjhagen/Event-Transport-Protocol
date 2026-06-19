import { Hono, type Context } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { stream } from "hono/streaming";
import { config } from "dotenv";

import { ETPEventSchema, ETPEvent, ETPCapabilities, ETPNodeIdentity } from "./src/types";
import { detectPlatform } from "./src/lib/router";
import { generateICS } from "./src/lib/ics";
import { EventStore } from "./src/lib/store";
import {
  sanitizeEvent,
  signPayload,
  createEventId,
  findEvent,
} from "./src/lib/event-utils";

config();

const app = new Hono();
const store = new EventStore();

const DEFAULT_EVENT_ID = "evt_01HV2W3J9K4Z7X5M2Y8Q1R0S3N";

function seedDefaultEvent() {
  const baseUrl = process.env.APP_URL || "http://localhost:8081";
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
    description:
      "Aligning on the Event Transport Protocol (ETP) draft updates and scheduling reference implementations.",
    start: new Date(Date.now() + 3600000).toISOString(),
    end: new Date(Date.now() + 7200000).toISOString(),
    timezone: "UTC",
    location: {
      name: "Metaverse / Stockholm E-Node 4",
    },
    sync: {
      strategy: "stream",
      stream_url: `${baseUrl}/api/e/${DEFAULT_EVENT_ID}/stream`,
      poll_interval: 3600,
    },
    auth: {
      signature: "etp-initial-seeded-signature-01",
      method: "ed25519",
    },
    ext: {
      recurrence: "weekly",
      attendees: [
        { email: "organizer@evt.life", status: "accepted" },
        { email: "mattjhagen0@gmail.com", status: "pending" },
        { email: "engineering@etp.dev", status: "accepted" },
      ],
      organizerToken: "demo-organizer-secret-2026",
    },
  };

  store.seed(defaultEvent, {
    type: "event.created",
    v: 1,
    eid: DEFAULT_EVENT_ID,
    event: defaultEvent,
  });
}

seedDefaultEvent();

type ETPHandler = (data: Record<string, unknown>) => void;
const subscribers = new Map<string, Set<ETPHandler>>();

const NODE_IDENTITY: ETPNodeIdentity = {
  node_id: "node.eventtransport.dev",
  public_key: "ed25519_pk_8v2j9k...",
  algorithm: "ed25519",
  metadata: {
    operator: "ETP Foundation",
    region: "us-west-1",
    trust_score: 0.99,
  },
};

function getBaseUrl(c: { req: { url: string } }): string {
  const reqUrl = new URL(c.req.url);
  return process.env.APP_URL || `${reqUrl.protocol}//${reqUrl.host}`;
}

function broadcastDelta(eid: string, delta: Record<string, unknown>) {
  const eidSubscribers = subscribers.get(eid);
  if (eidSubscribers) {
    eidSubscribers.forEach((send) => send(delta));
  }
}

app.get("/api/capabilities", (c) => {
  const capabilities: ETPCapabilities & { identity: ETPNodeIdentity } = {
    version: "0.1",
    transports: ["http", "sse", "ws"],
    features: {
      replay: true,
      delta_compression: false,
      heartbeat_interval: 15,
      max_replay_depth: 50,
    },
    identity: NODE_IDENTITY,
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
    body { background: #0f172a; color: #e2e8f0; font-family: Inter, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    h1 { margin-top: 0; color: white; }
    a { color: #38bdf8; text-decoration: none; }
    .button { display: inline-block; padding: 12px 18px; margin-right: 12px; margin-top: 12px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>EVT.life</h1>
    <p>Event Transport Protocol Reference Node</p>
    <p>Decentralized event identity, synchronization, federation, and transport.</p>
    <a class="button" href="/api/capabilities">Capabilities</a>
    <a class="button" href="/e/evt_01HV2W3J9K4Z7X5M2Y8Q1R0S3N">Demo Event</a>
  </div>
</body>
</html>
`);
});

app.get("/api/bridges", (c) => {
  return c.json([
    {
      id: "ics-legacy",
      name: "Standard ICS Bridge",
      mode: "snapshot-only",
      features: ["Static Export", "Universal Support"],
      degradations: ["No Sync", "No Authority", "Manual Refresh Only"],
    },
    {
      id: "webcal-compatible",
      name: "WebCal Adaptive Bridge",
      mode: "compatible",
      features: ["Periodic Refresh", "Auto-Polling"],
      degradations: ["High Latency", "No Replay", "Flattened Lifecycle"],
    },
  ]);
});

app.get("/api/e/:id/stream", (c) => {
  const id = c.req.param("id");
  const baseUrl = getBaseUrl(c);
  const event = findEvent(store, id, baseUrl);
  const sinceVersion = parseInt(c.req.query("since") || c.req.header("Last-Event-ID") || "0");

  if (!event) return c.json({ error: "Event not found" }, 404);

  const eid = event.eid;

  return stream(c, async (streamWriter) => {
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    const sendFrame = (data: Record<string, unknown>) => {
      if (data.v) streamWriter.write(`id: ${data.v}\n`);
      streamWriter.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    if (sinceVersion > 0 && sinceVersion < event.v) {
      const history = store.getDeltas(eid);
      const missedDeltas = history.filter((d) => (d as { v: number }).v > sinceVersion);

      if (missedDeltas.length > 0) {
        missedDeltas.forEach((delta) =>
          sendFrame({ type: "delta.sync", ...(delta as Record<string, unknown>) })
        );
      } else {
        sendFrame({ type: "snapshot.sync", event: sanitizeEvent(event), fallback: true });
      }
    } else {
      sendFrame({ type: "snapshot.sync", event: sanitizeEvent(event) });
    }

    if (!subscribers.has(eid)) subscribers.set(eid, new Set());
    subscribers.get(eid)!.add(sendFrame);

    const heartbeat = setInterval(() => {
      streamWriter.write(`event: heartbeat\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`);
    }, 15000);

    c.req.raw.signal.addEventListener("abort", () => {
      clearInterval(heartbeat);
      subscribers.get(eid)?.delete(sendFrame);
    });

    while (!c.req.raw.signal.aborted) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });
});

app.post("/api/e", async (c) => {
  const body = await c.req.json();
  const eid = createEventId(body);
  const now = new Date().toISOString();
  const baseUrl = getBaseUrl(c);

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
      signature: "",
    },
    sync: {
      strategy: body.sync?.strategy || "stream",
      stream_url: body.sync?.stream_url || `${baseUrl}/api/e/${eid}/stream`,
      poll_interval: body.sync?.poll_interval || 3600,
      delta_url: body.sync?.delta_url,
    },
  };

  const validation = ETPEventSchema.safeParse(eventPayload);

  if (!validation.success) {
    return c.json({ error: "Invalid EVT Object", details: validation.error }, 400);
  }

  const etpEvent = validation.data;
  if (etpEvent.auth) {
    etpEvent.auth.signature = signPayload({ eid: etpEvent.eid, v: etpEvent.v, payload: etpEvent.title });
  }

  store.set(etpEvent);
  store.setDeltas(eid, [{ type: "event.created", v: 1, eid, event: etpEvent }]);

  c.header("X-ETP-EID", eid);
  c.header("X-ETP-Version", "0.1");
  c.header("X-ETP-Origin", baseUrl);

  return c.json(
    {
      event: sanitizeEvent(etpEvent),
      links: {
        etp: `etp://${eid}`,
        universal: `${baseUrl}/e/${eid}`,
        ics: `${baseUrl}/e/${eid}.ics`,
      },
    },
    201
  );
});

app.patch("/api/e/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const mutationId = c.req.header("X-Mutation-ID") || body.mutation_id;
  const baseUrl = getBaseUrl(c);

  if (mutationId && store.hasMutation(mutationId)) {
    const existing = findEvent(store, id, baseUrl);
    return c.json(existing ? sanitizeEvent(existing) : { error: "Event not found" }, 200, {
      "X-ETP-Idempotent": "true",
    });
  }

  const existing = findEvent(store, id, baseUrl);
  if (!existing) return c.json({ error: "Event not found" }, 404);

  const requestedVersion = parseInt(c.req.header("X-ETP-If-Version") || body.v_expected || "0");
  if (requestedVersion > 0 && requestedVersion !== existing.v) {
    return c.json({ error: "Conflict: Version mismatch", current_v: existing.v }, 409);
  }

  const updatedEvent: ETPEvent = {
    ...existing,
    ...body,
    eid: existing.eid,
    v: existing.v + 1,
    updated_at: new Date().toISOString(),
    supersedes: body.supersedes || `${existing.eid}v${existing.v}`,
  };

  const validation = ETPEventSchema.safeParse(updatedEvent);
  if (!validation.success) {
    return c.json({ error: "Invalid mutation", details: validation.error }, 400);
  }

  const finalEvent = validation.data;
  if (finalEvent.auth) {
    finalEvent.auth.signature = signPayload({ eid: finalEvent.eid, v: finalEvent.v, cid: mutationId });
  }

  store.set(finalEvent);
  if (mutationId) store.addMutation(mutationId);

  const delta = {
    type: "event.updated",
    v: finalEvent.v,
    eid: finalEvent.eid,
    changes: body,
    event: sanitizeEvent(finalEvent),
    mutation_id: mutationId,
    signature: signPayload({ eid: finalEvent.eid, v: finalEvent.v, delta: true }),
  };

  store.addDelta(finalEvent.eid, delta);
  broadcastDelta(finalEvent.eid, delta);

  return c.json(sanitizeEvent(finalEvent));
});

async function setupWebSocket(server: ReturnType<typeof serve>) {
  const { WebSocketServer } = await import("ws");
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    if (url.pathname === "/api/etp-ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws, request) => {
    let currentEid: string | null = null;
    let sendFrame: ETPHandler | null = null;
    const host = request.headers.host || "localhost:8081";

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type !== "etp.subscribe") return;

        const { eid: subscribeId, since } = data;
        const baseUrl = process.env.APP_URL || `http://${host}`;
        const event = findEvent(store, subscribeId, baseUrl);

        if (!event) {
          ws.send(JSON.stringify({ type: "error.sync", code: "NOT_FOUND", msg: "Event not found" }));
          return;
        }

        if (currentEid && sendFrame) {
          subscribers.get(currentEid)?.delete(sendFrame);
        }

        currentEid = event.eid;
        sendFrame = (frame) => ws.send(JSON.stringify(frame));

        const sinceVersion = parseInt(since || "0");
        if (sinceVersion > 0 && sinceVersion < event.v) {
          const history = store.getDeltas(event.eid);
          const missed = history.filter((d) => (d as { v: number }).v > sinceVersion);
          if (missed.length > 0) {
            missed.forEach((d) => sendFrame!({ type: "delta.sync", ...(d as Record<string, unknown>) }));
          } else {
            sendFrame!({ type: "snapshot.sync", event: sanitizeEvent(event), fallback: true });
          }
        } else {
          sendFrame!({ type: "snapshot.sync", event: sanitizeEvent(event) });
        }

        if (!subscribers.has(event.eid)) subscribers.set(event.eid, new Set());
        subscribers.get(event.eid)!.add(sendFrame);

        ws.send(JSON.stringify({ type: "subscription.state", state: "active", eid: event.eid }));
      } catch {
        ws.send(JSON.stringify({ type: "error.sync", code: "MALFORMED", msg: "Invalid ETP Frame" }));
      }
    });

    const heartbeat = setInterval(() => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "heartbeat", t: Date.now() }));
      }
    }, 15000);

    ws.on("close", () => {
      clearInterval(heartbeat);
      if (currentEid && sendFrame) {
        subscribers.get(currentEid)?.delete(sendFrame);
      }
    });
  });

  console.log("ETP WebSocket Binding Active at /api/etp-ws");
}

app.get("/api/e/:id", (c) => {
  const id = c.req.param("id");
  const baseUrl = getBaseUrl(c);
  const event = findEvent(store, id, baseUrl);

  if (!event) return c.json({ error: "Event not found" }, 404);

  c.header("Content-Type", "application/etp+json");
  c.header("X-ETP-EID", event.eid);
  c.header("X-ETP-Version", event.proto);

  if (event.sync.strategy === "poll") {
    c.header("X-Poll-Interval", String(event.sync.poll_interval));
  }

  return c.json(sanitizeEvent(event));
});

const handleUniversal = (c: Context) => {
  const id = c.req.param("id");
  const baseUrl = getBaseUrl(c);
  const event = findEvent(store, id, baseUrl);

  if (!event) return c.text("Event Identity not found", 404);

  const userAgent = c.req.header("user-agent") || "";
  const accept = c.req.header("accept") || "";
  const routing = detectPlatform(userAgent, accept);

  c.header("X-ETP-EID", event.eid);

  if (routing.platform === "etp-client") {
    c.header("Content-Type", "application/etp+json");
    c.header("X-ETP-Version", "0.1");
    return c.json(sanitizeEvent(event));
  }

  return c.html(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0f172a; color: #e2e8f0; font-family: Inter, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    h1 { margin-top: 0; color: white; }
    a { color: #38bdf8; text-decoration: none; }
    .button { display: inline-block; padding: 12px 18px; margin-right: 12px; margin-top: 12px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; }
    .button:hover { background: #1d4ed8; }
  </style>
  <title>${event.title}</title>
</head>
<body>
  <div class="card">
    <h1>${event.title}</h1>
    <p>${event.description || ""}</p>
    <p><strong>Event ID:</strong> ${event.eid}</p>
    <p><strong>Starts:</strong> ${event.start}</p>
    <p><strong>Ends:</strong> ${event.end}</p>
    <p>
      <a class="button" href="/api/e/${event.eid}">View JSON</a>
      <a class="button" href="/calendar/${event.eid}">Add to Calendar</a>
      <a class="button" href="/?id=${event.eid}">Open in App</a>
    </p>
  </div>
</body>
</html>
`);
};

const handleICS = (c: Context) => {
  const rawId = c.req.param("id") || c.req.param("id.ics") || "";
  const id = rawId.replace(/\.ics$/i, "");
  const baseUrl = getBaseUrl(c);
  const event = findEvent(store, id, baseUrl);

  if (!event) return c.text("Not found", 404);

  const ics = generateICS(event);

  return c.text(ics, 200, {
    "Content-Type": "text/calendar",
    "Content-Disposition": `attachment; filename="${event.eid}.ics"`,
    "X-ETP-EID": event.eid,
  });
};

app.get("/e/:id.ics", handleICS);
app.get("/api/e/:id.ics", handleICS);
app.get("/calendar/:id", handleICS);
app.get("/e/:id", handleUniversal);
app.get("/api/e/:id/redirect", handleUniversal);

if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use("/assets/*", serveStatic({ root: "./dist" }));
  app.get("/", serveStatic({ path: "./dist/index.html" }));
}

async function main() {
  const port = Number(process.env.PORT) || 8081;
  const isProduction = process.env.NODE_ENV === "production";

  console.log(`ETP Node running at http://localhost:${port} (${isProduction ? "production" : "development"})`);

  const server = serve({
    fetch: app.fetch,
    port,
  });

  await setupWebSocket(server);
}

if (!process.env.VERCEL) {
  main();
}

export default app;
