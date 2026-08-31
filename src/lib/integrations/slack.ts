import type { IngestedItem, MappingRules, OAuthTokenResponse } from "./types";

/**
 * Slack OAuth2 + ingestion.
 *
 * INERT until SLACK_CLIENT_ID / SLACK_CLIENT_SECRET / SLACK_SIGNING_SECRET
 * are supplied. Structured per Slack's OAuth v2 flow
 * (https://api.slack.com/authentication/oauth-v2) and conversations.history
 * API shape.
 */

const AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const TOKEN_URL = "https://slack.com/api/oauth.v2.access";

export function getSlackAuthorizeUrl(redirectUri: string, state: string): string {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "SLACK_CLIENT_ID is not configured. Set it in your environment to enable Slack OAuth.",
    );
  }
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "channels:history,channels:read",
    redirect_uri: redirectUri,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeSlackCode(
  code: string,
  redirectUri: string,
): Promise<OAuthTokenResponse> {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Slack OAuth is not configured (SLACK_CLIENT_ID / SLACK_CLIENT_SECRET missing).",
    );
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`Slack token exchange failed: HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    ok: boolean;
    access_token?: string;
    error?: string;
  };

  if (!data.ok || !data.access_token) {
    throw new Error(`Slack token exchange failed: ${data.error ?? "unknown error"}`);
  }

  return { accessToken: data.access_token };
}

/**
 * Verify a Slack request signature (used for event/interaction webhooks).
 * Real deployments must call this before trusting any inbound Slack payload.
 */
export async function verifySlackSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
): Promise<boolean> {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const base = `v0:${timestamp}:${rawBody}`;
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(base));
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expected = `v0=${hex}`;

  return expected === signature;
}

/**
 * Fetch recent messages from configured Slack channels and normalize them
 * into ingestable items (each message becomes a candidate DailyTask).
 */
export async function fetchSlackMessages(
  accessToken: string,
  mapping: MappingRules,
): Promise<IngestedItem[]> {
  const items: IngestedItem[] = [];

  for (const channelId of mapping.channelOrProjectIds) {
    const url = `https://slack.com/api/conversations.history?channel=${encodeURIComponent(channelId)}&limit=50`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Slack API error for channel ${channelId}: HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      ok: boolean;
      error?: string;
      messages?: Array<{ ts: string; text: string }>;
    };

    if (!data.ok) {
      throw new Error(`Slack API error for channel ${channelId}: ${data.error ?? "unknown"}`);
    }

    for (const message of data.messages ?? []) {
      const date =
        mapping.dateTaggingStrategy === "today"
          ? new Date().toISOString().slice(0, 10)
          : new Date(Number(message.ts) * 1000).toISOString().slice(0, 10);

      items.push({
        externalId: message.ts,
        title: message.text.slice(0, 120),
        description: message.text,
        date,
        sourceRef: `slack:msg:${channelId}.${message.ts}`,
      });
    }
  }

  return items;
}
