/**
 * Pluggable face-asset generation.
 *
 * IMPORTANT — what this is and is not:
 * MCP (Model Context Protocol) tool access is agent-side only — it exists
 * inside a given Claude session/tool-use context and cannot be called by a
 * deployed Next.js server at runtime. There is no such thing as a live
 * "MCP connector" a web app can reach over HTTP. What this module provides
 * instead is a real, working, pluggable HTTP integration point: point
 * FACE_GEN_API_URL at any image-generation API you control (Stability AI,
 * Replicate, OpenAI Images, your own MCP-bridging microservice, etc.) and
 * this module will call it. If the endpoint is not configured, or the call
 * fails for any reason, it falls back to a static placeholder asset so the
 * feature always degrades gracefully instead of breaking the UI.
 */

export interface FaceGenerationRequest {
  userId: string;
  prompt?: string;
}

export interface FaceGenerationResult {
  status: "ready" | "failed";
  url: string;
  mcpId: string | null;
  checksum: string | null;
  isPlaceholder: boolean;
  error?: string;
}

const PLACEHOLDER_URL = "/face-placeholder.svg";

function simpleChecksum(input: string): string {
  // Not cryptographic — just a stable, cheap fingerprint for the
  // FaceAsset.checksum column so re-generation runs are distinguishable.
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function placeholderResult(reason?: string): FaceGenerationResult {
  return {
    status: "ready",
    url: PLACEHOLDER_URL,
    mcpId: null,
    checksum: simpleChecksum(PLACEHOLDER_URL),
    isPlaceholder: true,
    error: reason,
  };
}

/**
 * Generate (or fall back to a placeholder for) a holographic face asset.
 *
 * This function never throws — callers can always trust the returned
 * `status`/`url` to render something.
 */
export async function generateFaceAsset(
  req: FaceGenerationRequest,
): Promise<FaceGenerationResult> {
  const apiUrl = process.env.FACE_GEN_API_URL;
  const apiKey = process.env.FACE_GEN_API_KEY;

  if (!apiUrl) {
    return placeholderResult("FACE_GEN_API_URL not configured — using placeholder asset.");
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        userId: req.userId,
        prompt:
          req.prompt ??
          "abstract holographic silhouette avatar, cyan glow, particle scan lines, no real person likeness",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return placeholderResult(`Face-gen API returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      url?: string;
      id?: string;
      checksum?: string;
    };

    if (!data.url) {
      return placeholderResult("Face-gen API response missing `url`");
    }

    return {
      status: "ready",
      url: data.url,
      mcpId: data.id ?? null,
      checksum: data.checksum ?? simpleChecksum(data.url),
      isPlaceholder: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling face-gen API";
    return placeholderResult(message);
  }
}

export { PLACEHOLDER_URL };
