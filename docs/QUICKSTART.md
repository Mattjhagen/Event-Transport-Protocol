# ETP Quickstart Guide

Get started with the **Event Transport Protocol (ETP)** in under 5 minutes.

## 1. Install the SDK
Currently, the ETP SDK is available as a lightweight TypeScript reference client.

```bash
# Clone the repository
git clone https://github.com/etp-foundation/etp-js
```

## 2. Connect and Subscribe
Connect to an ETP node and subscribe to an Event Identity (EID) to receive real-time authoritative updates.

```typescript
import { ETPClient } from "./sdk/etp-client";

const client = new ETPClient({
  nodeUrl: "https://node.eventtransport.dev",
  transport: "sse" // and "ws" supported
});

// 1. Listen for state changes
client.onStateChange((state) => {
  console.log(`Connection State: ${state}`);
});

// 2. Listen for synchronization frames
client.onFrame((frame) => {
  if (frame.type === "snapshot.sync") {
    console.log("Initial Event State:", frame.event);
  } else if (frame.type === "delta.sync") {
    console.log("Live Delta Received:", frame.changes);
  }
});

// 3. Initiate Subscription
client.subscribe("evt_k1j8v3m9");
```

## 3. Authoritative Mutation
If you have the authoritative version and necessary tokens, you can broadcast a mutation to the origin node.

```typescript
const result = await client.mutate("evt_k1j8v3m9", {
  location: { name: "New Venue" },
  lifecycle: "updated"
}, 5); // Must provide current version for idempotency

console.log("Mutation Broadcasted:", result.v);
```

## 4. Replay and Recovery
ETP handles connection drops automatically. To recover missed deltas manually:

```typescript
// Reconnect from version 12
client.subscribe("evt_k1j8v3m9", 12);
```

---

## Core Concepts
- **EID**: Immutable Event Identity.
- **EVT**: The event object snapshot.
- **Delta**: Incremental JSON Merge Patches.
- **Fidelity**: Native ETP vs Legacy `.ics` bridges.
