# Event Transport Protocol (ETP)
**Standardizing Live Event State Across the Internet**

ETP is an open protocol designed to replace static event files (.ics) and fragmented scheduling APIs with canonical, synchronized event objects.

## Core Concepts
- **EVT Objects**: Events are stateful JSON objects, not static files.
- **Permanent URI**: Every event has a unique `etp://` identity.
- **Subscription Model**: Calendar clients subscribe to dynamic streams instead of importing snapshots.
- **Universal Routing**: A single gateway link (`https://.../e/{id}`) routes users to the best native or ETP-aware experience based on device capability.

## Repository Structure
- `/spec`: Formal protocol specifications.
- `/docs`: High-level guides and architectural overviews.
- `/src`: Reference implementation of the **ETP Router** and Node.
- `/sdk`: Experimental client libraries for ETP integration.
- `/examples`: Payload examples and integration patterns.

## Technical Summary
- **MIME Type**: `application/etp+json`
- **URI Scheme**: `etp://`
- **Current Version**: v0.1 (Draft)

## Getting Started
The current repository contains a reference **ETP Router** implementation built with Hono and React.

```bash
npm install
npm run dev
```

---
*ETP is an open internet-standard project. We seek to build plumbing, not platforms.*
