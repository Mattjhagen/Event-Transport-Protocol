# ETP Synchronization Semantics

ETP events are designed for real-time consistency.

## Dynamic vs Static Events
- `dynamic: false`: The event is a historical record or a one-time occurrence that is unlikely to change.
- `dynamic: true`: The event represents a live state. Clients SHOULD poll the `subscription_url` or use the Node's polling recommendation (`X-PUBLISHED-TTL`).

## Delta Updates
Future versions of ETP (v0.2+) will support JSON Merge Patches to minimize bandwidth for large recurring event series.

## Versioning Strategy
- Minor versions (e.g., 0.1 -> 0.2) must be backward compatible.
- Major versions (e.g., 1.0) may introduce breaking schema changes requiring a new URI namespace or explicit version negotiation.
