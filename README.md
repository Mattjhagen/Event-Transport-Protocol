# Event Transport Protocol (ETP)
**Authoritative, real-time event-state synchronization for the modern internet.**

ETP is a transport-neutral protocol designed to solve the "Meeting Drift" problem. While traditional calendars rely on static snapshots (.ics files), ETP treats events as live, synchronized objects that propagate updates across the network in real-time.

## The Reference Implementation: CMAMeet
[**CMAMeet**](https://github.com/Mattjhagen/CMAMeet) is the primary real-world demonstration of ETP. It is a lightweight video meeting platform that uses ETP to ensure participants always have the correct meeting link, start time, and lifecycle status.

### Why CMAMeet uses ETP:
- **Stale Links**: Traditional invites often contain dead meeting URLs. CMAMeet propagates link changes instantly via ETP deltas.
- **Dynamic Delays**: If a meeting is delayed by 10 minutes, CMAMeet signals the mutation to all ETP-aware calendars.
- **Trust & Authenticity**: Every mutation in CMAMeet is signed, ensuring the participant's calendar only accepts authoritative updates from the organizer.

## Core Protocol Pillars
- **Immutable Identity (EID)**: Every event has a unique identifier that remains constant across its entire lifecycle.
- **Versioned State**: Updates are tracked through monotonic version numbers, allowing for easy replay and recovery.
- **Transport Neutrality**: ETP can be delivered via WebSockets, SSE, WebHooks, or even legacy polling.
- **Authoritative Origin**: Origin Nodes sign mutations to prevent unauthorized event tampering.

## Repository Structure
- `/spec`: formal protocol specification (v0.1).
- `/sdk`: reference TypeScript client for ETP integration.
- `/src`: reference ETP Node & Router implementation.
- `/docs`: developer onboarding and integration guides.

## Quickstart
```bash
# Register a new event identity
curl -X POST https://api.eventtransport.dev/api/e \
     -H "Content-Type: application/json" \
     -d '{"title": "Sync Meeting", "start": "2026-05-19T10:00:00Z"}'

# Subscribe to real-time updates via SSE
curl -N https://api.eventtransport.dev/api/e/{eid}/stream
```

## Documentation
- [**Protocol Specification**](./spec/v0.1.md)
- [**SDK Reference**](./docs/QUICKSTART.md)
- [**Implementation Rationale**](./src/App.tsx)

---
*ETP is an open, community-driven protocol. Built for a web that is live, not static.*
