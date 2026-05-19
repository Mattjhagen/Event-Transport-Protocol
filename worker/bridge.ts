import { ETPResponse } from "./types";

export function generateICS(etp: ETPResponse): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ETP//Edge Gateway v0.1//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${etp.eid}`,
    `DTSTAMP:${now}`,
    `SUMMARY:${etp.meta.title || "ETP Event"}`,
    "DESCRIPTION:This is a legacy snapshot of an ETP-native event. For real-time updates, use an ETP-compatible client.",
    `URL:${etp.bindings[1]?.url || etp.origin}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
