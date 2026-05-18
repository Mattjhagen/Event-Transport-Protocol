# ETP Routing Architecture

The ETP Router is a multi-modal gateway that sits between the ETP Protocol Network and end-user devices.

## How it works

1. **Request Ingress**: A client hits a universal event link: `https://eventtransport.dev/e/{event_id}`.
2. **Platform Sensing**: The Router analyzes the `User-Agent` and `Accept` headers.
3. **Dispatch Logic**:
   - **Legacy Calendars**: Served a 302 redirect to `webcal://` or a downloadable `.ics` blob.
   - **Modern Mobile (iOS/Android)**: Attempt a deep link if an ETP-aware app is installed; fallback to a rich web view.
   - **AI Agents / API Clients**: Served the raw JSON payload with `application/etp+json` MIME type.
   - **Desktop Browsers**: Served a "Rich Event Card" with real-time status updates (RSVP state, location changes).

## Universal Routing vs Snapshot Import
Legacy systems use snapshots. ETP uses stable URIs. A single ETP URL can represent a series of events that update over time, avoiding the "Stale ICS" problem common in current email-based workflows.
