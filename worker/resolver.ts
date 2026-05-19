import { ETPResponse } from "./types";

// Mock resolution for the reference implementation
// In production, this would query a globally distributed KV or DB
const ALIAS_MAP: Record<string, string> = {
  "team-sync": "evt_k8s2x9v01",
  "product-review": "evt_p92m1x8u2",
  "design-crit": "evt_d3k0v4s1z",
};

export async function resolveEID(alias: string): Promise<string | null> {
  // If it already looks like an EID, return it
  if (alias.startsWith("evt_")) return alias;
  
  // Otherwise check alias map
  return ALIAS_MAP[alias] || null;
}

export function getMockETPState(eid: string): ETPResponse {
  return {
    eid,
    origin: "https://cmameet.app",
    state: "active",
    version: 4,
    last_mutation: new Date().toISOString(),
    bindings: [
      { type: "sse", url: `https://cmameet.app/api/e/${eid}/stream` },
      { type: "http", url: `https://cmameet.app/api/e/${eid}` }
    ],
    meta: {
      title: "ETP Technical Sync",
      reference_impl: "CMAMeet"
    }
  };
}
