import { resolveEID, getMockETPState } from "./resolver";
import { handleCapabilities } from "./capabilities";
import { generateICS } from "./bridge";
import { Env } from "./types";

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const accept = request.headers.get("Accept") || "";

    // 1. Health & Root
    if (url.pathname === "/") {
      return new Response("ETP Edge Gateway v0.1 - Active", { status: 200 });
    }

    // 2. Capability Discovery
    if (url.pathname === "/api/capabilities") {
      return handleCapabilities();
    }

    // 3. EID Resolution & Transport Negotiation
    const eMatch = url.pathname.match(/^\/e\/(.+)$/);
    if (eMatch) {
      const aliasOrEid = eMatch[1];
      const eid = await resolveEID(aliasOrEid);

      if (!eid) {
        return new Response("Event not found", { status: 404 });
      }

      const etpState = getMockETPState(eid);

      // Negotiate Response Format
      if (accept.includes("application/etp+json")) {
        return new Response(JSON.stringify(etpState), {
          headers: {
            "Content-Type": "application/etp+json",
            "X-ETP-Version": "0.1",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      if (accept.includes("text/calendar")) {
        return new Response(generateICS(etpState), {
          headers: {
            "Content-Type": "text/calendar",
            "Content-Disposition": `attachment; filename="${eid}.ics"`,
            "X-ETP-Bridge": "semantic-downgrade"
          }
        });
      }

      // Default: Redirect to Reference Implementation (CMAMeet)
      return Response.redirect(`${etpState.origin}/j/${eid}`, 302);
    }

    // Default 404
    return new Response("Path not resolved", { status: 404 });
  }
};
