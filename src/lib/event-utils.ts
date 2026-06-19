import crypto from "node:crypto";
import { ulid } from "ulid";
import type { ETPEvent } from "../types";
import type { EventStore } from "./store";

export function sanitizeEvent(event: ETPEvent): ETPEvent {
  const clone = structuredClone(event);
  if (clone.ext?.organizerToken) {
    delete clone.ext.organizerToken;
  }
  return clone;
}

export function signPayload(payload: unknown): string {
  const content = JSON.stringify(payload);
  return crypto.createHmac("sha256", "etp-demo-secret").update(content).digest("hex");
}

export function encodeEventToId(body: Record<string, unknown>): string {
  const startUnix = body.start ? Math.floor(new Date(body.start as string).getTime() / 1000) : 0;
  const endUnix = body.end ? Math.floor(new Date(body.end as string).getTime() / 1000) : 0;

  const ext = body.ext as Record<string, unknown> | undefined;
  const rec = ext?.recurrence || body.recurrence || "none";
  let rCode = "n";
  if (rec === "daily") rCode = "d";
  else if (rec === "weekly") rCode = "w";
  else if (rec === "monthly") rCode = "m";
  else if (rec === "yearly") rCode = "y";

  const location = body.location as { name?: string } | undefined;
  const attendees = ext?.attendees as { email: string }[] | undefined;

  const compact = {
    t: body.title || "Untitled",
    d: body.description ? String(body.description).substring(0, 100) : "",
    s: startUnix,
    e: endUnix,
    l: location?.name || "",
    g: String(body.lifecycle || "scheduled").substring(0, 1),
    r: rCode,
    at: attendees?.map((a) => a.email) || [],
  };

  const str = JSON.stringify(compact);
  const base64 = Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `evt_c_${base64}`;
}

export function createEventId(body: Record<string, unknown>): string {
  if (typeof body.eid === "string" && body.eid.startsWith("evt_")) {
    return body.eid;
  }
  return `evt_${ulid()}`;
}

export function decodeEventFromId(eid: string, baseUrl: string): ETPEvent | null {
  if (!eid.startsWith("evt_c_")) return null;
  try {
    const base64 = eid.substring(6).replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const jsonStr = Buffer.from(padded, "base64").toString("utf-8");
    const compact = JSON.parse(jsonStr) as Record<string, unknown>;

    const startISO = new Date(((compact.s as number) || 0) * 1000).toISOString();
    const endISO = new Date(((compact.e as number) || 0) * 1000).toISOString();

    let lifecycle: ETPEvent["lifecycle"] = "scheduled";
    if (compact.g === "d") lifecycle = "draft";
    else if (compact.g === "u") lifecycle = "updated";
    else if (compact.g === "c") lifecycle = "cancelled";

    let recurrence = "none";
    if (compact.r === "d") recurrence = "daily";
    else if (compact.r === "w") recurrence = "weekly";
    else if (compact.r === "m") recurrence = "monthly";
    else if (compact.r === "y") recurrence = "yearly";

    const now = new Date().toISOString();
    const attendees = compact.at as string[] | undefined;

    return {
      eid,
      origin: baseUrl,
      v: 1,
      created_at: now,
      updated_at: now,
      lifecycle,
      proto: "0.1",
      title: (compact.t as string) || "Untitled Event",
      description: (compact.d as string) || "",
      start: startISO,
      end: endISO,
      timezone: "UTC",
      location: compact.l ? { name: compact.l as string } : undefined,
      sync: {
        strategy: "stream",
        stream_url: `${baseUrl}/api/e/${eid}/stream`,
        poll_interval: 3600,
      },
      auth: {
        signature: "stateless-decoded-sig",
        method: "ed25519",
      },
      ext: {
        recurrence,
        attendees: attendees ? attendees.map((email) => ({ email, status: "pending" })) : [],
      },
    };
  } catch (err) {
    console.error("Failed to decode stateless event ID:", err);
    return null;
  }
}

export function findEvent(store: EventStore, id: string, baseUrl: string): ETPEvent | undefined {
  const direct = store.get(id);
  if (direct) return direct;

  const byAlias = store.getByAlias(id) || store.findByAliasValue(id);
  if (byAlias) return byAlias;

  if (id.startsWith("evt_c_") || id.startsWith("api_e_evt_c_") || id.includes("evt_c_")) {
    const cleanId = id.includes("evt_c_") ? "evt_c_" + id.split("evt_c_")[1] : id;
    const decoded = decodeEventFromId(cleanId, baseUrl);
    if (decoded) return decoded;
  }

  return undefined;
}
