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
    `UID:${event.eid}`,
    `DTSTAMP:${formatDate(event.updated_at)}`,
    `DTSTART:${formatDate(event.start)}`,
    `DTEND:${formatDate(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""} (EID: etp://${event.eid})`,
    event.location ? `LOCATION:${event.location.name}` : "",
    `X-ETP-EID:${event.eid}`,
    `X-ETP-ALIAS:${event.alias || ""}`,
    `X-ETP-VERSION:${event.v}`,
    `STATUS:${event.lifecycle.toUpperCase() === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'}`,
    event.sync.strategy !== 'static' ? "X-PUBLISHED-TTL:PT1H" : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return lines.filter(Boolean).join("\r\n");
}
