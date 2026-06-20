# Event Transport Protocol (ETP)
**Authoritative event-state synchronization for the living web.**

ETP is a transport-neutral protocol designed to solve the "Meeting Drift" problem. While traditional calendars rely on static snapshots (.ics files), ETP treats events as live, synchronized objects that propagate updates across the network in real-time.

## The Problem: Static Snapshots
Traditional invites are snapshots. Once sent, the connection between organizer and participant is severed. When a meeting link changes or a start time shifts, calendar invites remain stale.

## The Solution: Synchronized State
ETP maintains a persistent, authoritative synchronization heartbeat between the event origin and all subscribers.

## Reference Implementation: CMAMeet
[**CMAMeet**](https://github.com/Mattjhagen/CMAMeet) is the primary real-world demonstration of ETP. It is a lightweight video meeting platform that uses ETP to ensure participants always have the correct meeting link, start time, and lifecycle status.

### Why CMAMeet uses ETP:
- **Authoritative Links**: Link changes propagate instantly via ETP deltas.
- **Dynamic Delays**: Meeting delays are signaled authoritativey to all subscribers.
- **Trust**: Every mutation is signed, ensuring integrity across the transport.

## Core Protocol Pillars
- **Immutable Identity (EID)**: Permanent identifiers for events.
- **Versioned State**: Monotonic versions for replay and recovery.
- **Transport Neutrality**: Support for SSE, WebSockets, and WebHooks.
- **Authoritative Signature**: Cryptographic proof of mutation origin.

## Repository Structure
- `/spec`: formal protocol specification (v0.1).
- `/worker`: reference ETP Edge Gateway (Cloudflare Worker).
- `/sdk`: reference TypeScript client for ETP integration.
- `/src`: reference ETP Node & Router implementation.
- `/docs`: developer onboarding and integration guides.

## Edge Gateway (Cloudflare Worker)
The ETP Edge Gateway handles identity resolution and transport negotiation at the edge.
- **EID Resolution**: Resolves aliases to canonical event identities.
- **Transport Negotiation**: Dynamically switches between ETP-native JSON, legacy ICS snapshots, and application redirects based on `Accept` headers.
- **Efficiency**: Globally distributed for sub-10ms capability negotiation.

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

## Deployment

The reference ETP Node is live at **[https://eventtransport.space/](https://eventtransport.space/)**, running on a self-hosted server via Cloudflare Tunnel (no port forwarding required).

### Server Management Commands

SSH into the server (`ssh matty@192.168.1.73`), then use the following:

```bash
# Restart the ETP app
systemctl --user restart etp.service

# View ETP app logs (live)
journalctl --user -u etp.service -f

# Restart the Cloudflare Tunnel
sudo systemctl restart cloudflared

# View tunnel logs (live)
sudo journalctl -u cloudflared -f

# Check status of both services
systemctl --user status etp.service
sudo systemctl status cloudflared
```

### Architecture
- **ETP Node** — Hono backend + React (Vite) frontend, running on `127.0.0.1:8081` via a user-level systemd service (`etp.service`)
- **Cloudflare Tunnel** — `cloudflared` system service routes `eventtransport.space` → `127.0.0.1:8081` with no open inbound ports
- **TLS** — Handled automatically by Cloudflare end-to-end

---
*ETP is an open, community-driven protocol. Built for a web that is live, not static.*
