export interface ETPCapabilities {
  version: string;
  transports: {
    sse: boolean;
    websocket: boolean;
    polling: boolean;
  };
  features: {
    incremental_updates: boolean;
    authoritative_signing: boolean;
    replay: boolean;
  };
  bridges: string[];
}

export interface ETPResponse {
  eid: string;
  origin: string;
  state: "active" | "canceled" | "tentative";
  version: number;
  last_mutation: string;
  bindings: {
    type: "sse" | "websocket" | "http";
    url: string;
  }[];
  meta: Record<string, any>;
}

export interface Env {
  // Add environment variables if needed in the future
}
