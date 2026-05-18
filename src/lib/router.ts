import UAParser from "ua-parser-js";

export type Platform = 'ios' | 'android' | 'desktop' | 'etp-client';

export interface RoutingDecision {
  platform: Platform;
  recommendedAction: 'webcal' | 'google' | 'outlook' | 'native' | 'etp-handshake';
  deepLink?: string;
}

export function detectPlatform(userAgent: string, acceptHeader: string): RoutingDecision {
  // If the client explicitly requests ETP JSON
  if (acceptHeader.includes("application/etp+json")) {
    return { platform: 'etp-client', recommendedAction: 'etp-handshake' };
  }

  const parser = new UAParser(userAgent);
  const os = parser.getOS();
  const name = os.name?.toLowerCase() || "";

  if (name.includes("ios") || name.includes("mac os")) {
    return { 
      platform: 'ios', 
      recommendedAction: 'native',
      deepLink: 'webcal://' 
    };
  }

  if (name.includes("android")) {
    return { 
      platform: 'android', 
      recommendedAction: 'google' 
    };
  }

  return { 
    platform: 'desktop', 
    recommendedAction: 'webcal' 
  };
}
