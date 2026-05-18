import { ETPEvent } from "../types";
import { format } from "date-fns";

export function generateICS(event: ETPEvent): string {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "yyyyMMdd'T'HHmmss'Z'");
  };

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ETP//Event Transport Protocol//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id || "etp-" + Date.now()}`,
    `DTSTAMP:${formatDate(event.updated || new Date().toISOString())}`,
    `DTSTART:${formatDate(event.start)}`,
    `DTEND:${formatDate(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""} (Source: etp://${event.id})`,
    event.location ? `LOCATION:${event.location.name}` : "",
    `X-ETP-ID:${event.id}`,
    `X-ETP-VERSION:${event.v}`,
    event.dynamic ? "X-PUBLISHED-TTL:PT1H" : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return lines.filter(Boolean).join("\r\n");
}
