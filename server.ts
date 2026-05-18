import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import path from "path";
import { createServer as createViteServer } from "vite";

import { ETPEventSchema, ETPEvent } from "./src/types";
import { detectPlatform } from "./src/lib/router";
import { generateICS } from "./src/lib/ics";

dotenv.config();

const app = new Hono();
const eventStore = new Map<string, ETPEvent>();

/**
 * --- ETP API v0.1 ---
 */

// POST /api/e: Register a new event object
app.post("/api/e", async (c) => {
  const body = await c.req.json();
  const validation = ETPEventSchema.safeParse(body);
  
  if (!validation.success) {
    return c.json({ error: "Invalid ETP Event Object", details: validation.error }, 400);
  }

  const id = uuidv4();
  const now = new Date().toISOString();
  
  const etpEvent: ETPEvent = {
    ...validation.data,
    id,
    created: now,
    updated: now
  };

  eventStore.set(id, etpEvent);

  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  
  return c.json({
    event: etpEvent,
    links: {
      etp: `etp://${id}`,
      universal: `${baseUrl}/e/${id}`,
      ics: `${baseUrl}/e/${id}.ics`
    }
  }, 201);
});

// GET /api/e/:id: Fetch raw EVT object
app.get("/api/e/:id", (c) => {
  const id = c.req.param("id");
  const event = eventStore.get(id);
  
  if (!event) return c.json({ error: "Event not found" }, 404);
  return c.json(event);
});

/**
 * --- UNIVERSAL ROUTER ---
 */

app.get("/e/:id", (c) => {
  const id = c.req.param("id");
  const event = eventStore.get(id);
  
  if (!event) return c.text("Event not found in ETP network", 404);

  const userAgent = c.req.header("user-agent") || "";
  const accept = c.req.header("accept") || "";
  
  const routing = detectPlatform(userAgent, accept);

  // Core Protocol Handshake
  if (routing.platform === 'etp-client') {
    return c.json(event);
  }

  // Native Deep Linking or Redirects
  if (routing.recommendedAction === 'webcal' || routing.recommendedAction === 'native') {
    // In a production environment, we'd handle 302 to webcal://
    // For the UI preview, we'll redirect to the web app for a rich view
    return c.redirect(`/?id=${id}`);
  }

  return c.redirect(`/?id=${id}`);
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

      const res = await new Promise<any>((resolve) => {
        vite.middlewares(c.req.raw as any, c.res.raw as any, resolve);
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
