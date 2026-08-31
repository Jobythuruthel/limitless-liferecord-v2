import type { IngestedItem, MappingRules, OAuthTokenResponse } from "./types";

/**
 * Basecamp OAuth2 + ingestion.
 *
 * INERT until BASECAMP_CLIENT_ID / BASECAMP_CLIENT_SECRET are supplied in
 * the environment. The functions below are real, correctly structured
 * implementations of Basecamp's OAuth2 flow and API shape — they simply
 * have nothing to talk to without real app credentials from
 * https://launchpad.37signals.com/integrations.
 */

const AUTHORIZE_URL = "https://launchpad.37signals.com/authorization/new";
const TOKEN_URL = "https://launchpad.37signals.com/authorization/token";

export function getBasecampAuthorizeUrl(redirectUri: string, state: string): string {
  const clientId = process.env.BASECAMP_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "BASECAMP_CLIENT_ID is not configured. Set it in your environment to enable Basecamp OAuth.",
    );
  }
  const params = new URLSearchParams({
    type: "web_server",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeBasecampCode(
  code: string,
  redirectUri: string,
): Promise<OAuthTokenResponse> {
  const clientId = process.env.BASECAMP_CLIENT_ID;
  const clientSecret = process.env.BASECAMP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Basecamp OAuth is not configured (BASECAMP_CLIENT_ID / BASECAMP_CLIENT_SECRET missing).",
    );
  }

  const params = new URLSearchParams({
    type: "web_server",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(`${TOKEN_URL}?${params.toString()}`, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Basecamp token exchange failed: HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
  };
}

/**
 * Fetch to-dos from configured Basecamp projects and normalize them into
 * ingestable items. `accountId` and `projectId` come from the resolved
 * token/mapping — real deployments would resolve the access token from
 * the encrypted secret store referenced by IntegrationSettings.tokenRef.
 */
export async function fetchBasecampTodos(
  accessToken: string,
  accountId: string,
  mapping: MappingRules,
): Promise<IngestedItem[]> {
  const items: IngestedItem[] = [];

  for (const projectId of mapping.channelOrProjectIds) {
    const url = `https://3.basecampapi.com/${accountId}/buckets/${projectId}/todos.json`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "JOBY AI Liferecord (support@joby.ai)",
      },
    });

    if (!res.ok) {
      throw new Error(`Basecamp API error for project ${projectId}: HTTP ${res.status}`);
    }

    const todos = (await res.json()) as Array<{
      id: number;
      content: string;
      description?: string;
      created_at: string;
      due_on?: string;
    }>;

    for (const todo of todos) {
      const sourceDate =
        mapping.dateTaggingStrategy === "due_date" && todo.due_on
          ? todo.due_on
          : mapping.dateTaggingStrategy === "today"
            ? new Date().toISOString().slice(0, 10)
            : todo.created_at.slice(0, 10);

      items.push({
        externalId: String(todo.id),
        title: todo.content,
        description: todo.description ?? "",
        date: sourceDate,
        sourceRef: `basecamp:todo:${todo.id}`,
      });
    }
  }

  return items;
}
