import { ETPCapabilities } from "./types";

export const CAPABILITIES: ETPCapabilities = {
  version: "0.1.0",
  transports: {
    sse: true,
    websocket: false, // Planned for v0.2
    polling: true,
  },
  features: {
    incremental_updates: true,
    authoritative_signing: true,
    replay: true,
  },
  bridges: ["text/calendar", "application/json"],
};

export async function handleCapabilities() {
  return new Response(JSON.stringify(CAPABILITIES), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
