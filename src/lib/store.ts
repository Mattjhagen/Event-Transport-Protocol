import fs from "node:fs";
import path from "node:path";
import type { ETPEvent } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "events.json");

interface PersistedStore {
  events: Record<string, ETPEvent>;
  aliases: Record<string, string>;
  deltas: Record<string, unknown[]>;
  mutations: string[];
}

export class EventStore {
  private events = new Map<string, ETPEvent>();
  private aliases = new Map<string, string>();
  private deltas = new Map<string, unknown[]>();
  private mutations = new Set<string>();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(DATA_FILE)) return;
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw) as PersistedStore;
      for (const [eid, event] of Object.entries(data.events || {})) {
        this.events.set(eid, event);
      }
      for (const [alias, eid] of Object.entries(data.aliases || {})) {
        this.aliases.set(alias, eid);
      }
      for (const [eid, history] of Object.entries(data.deltas || {})) {
        this.deltas.set(eid, history);
      }
      for (const id of data.mutations || []) {
        this.mutations.add(id);
      }
    } catch (err) {
      console.error("Failed to load event store, starting fresh:", err);
    }
  }

  private save(): void {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const data: PersistedStore = {
        events: Object.fromEntries(this.events),
        aliases: Object.fromEntries(this.aliases),
        deltas: Object.fromEntries(this.deltas),
        mutations: Array.from(this.mutations),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Failed to persist event store:", err);
    }
  }

  get(eid: string): ETPEvent | undefined {
    return this.events.get(eid);
  }

  getByAlias(alias: string): ETPEvent | undefined {
    const eid = this.aliases.get(alias);
    return eid ? this.events.get(eid) : undefined;
  }

  findByAliasValue(alias: string): ETPEvent | undefined {
    for (const event of this.events.values()) {
      if (event.alias === alias) return event;
    }
    return undefined;
  }

  set(event: ETPEvent): void {
    this.events.set(event.eid, event);
    if (event.alias) {
      this.aliases.set(event.alias, event.eid);
    }
    this.save();
  }

  seed(event: ETPEvent, initialDelta: unknown): void {
    if (this.events.has(event.eid)) return;
    this.events.set(event.eid, event);
    if (event.alias) {
      this.aliases.set(event.alias, event.eid);
    }
    this.deltas.set(event.eid, [initialDelta]);
    this.save();
  }

  getDeltas(eid: string): unknown[] {
    return this.deltas.get(eid) || [];
  }

  addDelta(eid: string, delta: unknown, maxDepth = 50): void {
    const history = this.deltas.get(eid) || [];
    history.push(delta);
    this.deltas.set(eid, history.slice(-maxDepth));
    this.save();
  }

  setDeltas(eid: string, deltas: unknown[]): void {
    this.deltas.set(eid, deltas);
    this.save();
  }

  hasMutation(id: string): boolean {
    return this.mutations.has(id);
  }

  addMutation(id: string): void {
    this.mutations.add(id);
    this.save();
  }
}
