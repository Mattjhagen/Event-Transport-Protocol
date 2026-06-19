import { ETPEvent, ETPSyncFrame, ETPTrustState } from "../src/types";

export type ETPConnectionState = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "REPLAYING" | "ERROR";

export interface ETPClientOptions {
  nodeUrl: string;
  transport?: "sse" | "ws";
}

export class ETPClient {
  private nodeUrl: string;
  private transport: "sse" | "ws";
  private eventSource: EventSource | null = null;
  private socket: WebSocket | null = null;
  private onFrameHandler: (frame: ETPSyncFrame) => void = () => {};
  private onStateChangeHandler: (state: ETPConnectionState) => void = () => {};

  constructor(options: ETPClientOptions) {
    this.nodeUrl = options.nodeUrl.replace(/\/$/, "");
    this.transport = options.transport || "sse";
  }

  onFrame(handler: (frame: ETPSyncFrame) => void) {
    this.onFrameHandler = handler;
  }

  onStateChange(handler: (state: ETPConnectionState) => void) {
    this.onStateChangeHandler = handler;
  }

  async subscribe(eid: string, since?: number) {
    this.disconnect();
    this.onStateChangeHandler("CONNECTING");

    if (this.transport === "sse") {
      this.connectSSE(eid, since);
    } else {
      this.connectWS(eid, since);
    }
  }

  private connectSSE(eid: string, since?: number) {
    const url = `${this.nodeUrl}/api/e/${eid}/stream${since ? `?since=${since}` : ""}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (e) => {
      try {
        const frame = JSON.parse(e.data);
        this.onFrameHandler(frame);
        if (frame.type === "snapshot.sync" || frame.type === "delta.sync") {
          this.onStateChangeHandler("CONNECTED");
        }
      } catch (err) {
        this.onStateChangeHandler("ERROR");
      }
    };

    this.eventSource.onerror = () => {
      this.onStateChangeHandler("DISCONNECTED");
    };
  }

  private connectWS(eid: string, since?: number) {
    const node = new URL(this.nodeUrl);
    node.protocol = node.protocol === "https:" ? "wss:" : "ws:";
    node.pathname = "/api/etp-ws";
    this.socket = new WebSocket(node.toString());

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify({ type: "etp.subscribe", eid, since: since || 0 }));
    };

    this.socket.onmessage = (e) => {
      try {
        const frame = JSON.parse(e.data);
        this.onFrameHandler(frame);
        if (frame.type === "snapshot.sync" || frame.type === "delta.sync") {
          this.onStateChangeHandler("CONNECTED");
        }
      } catch (err) {
        this.onStateChangeHandler("ERROR");
      }
    };

    this.socket.onclose = () => {
      this.onStateChangeHandler("DISCONNECTED");
    };

    this.socket.onerror = () => {
      this.onStateChangeHandler("ERROR");
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.onStateChangeHandler("DISCONNECTED");
  }

  /**
   * Authoritative Mutation
   */
  async mutate(eid: string, body: Partial<ETPEvent>, ifVersion: number) {
    const res = await fetch(`${this.nodeUrl}/api/e/${eid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-ETP-If-Version": String(ifVersion),
        "X-Mutation-ID": `mut_${Math.random().toString(36).substring(7)}`
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Mutation Failed");
    }
    
    return await res.json();
  }
}
