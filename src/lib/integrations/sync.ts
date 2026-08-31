import { prisma } from "@/lib/prisma";
import type { IntegrationProviderId, MappingRules, SyncResult } from "./types";
import { fetchBasecampTodos } from "./basecamp";
import { fetchSlackMessages } from "./slack";

/**
 * Runs a sync for a given provider + user, writing a SyncRunLog entry and
 * upserting DailyTask rows (keyed by sourceRef) from whatever the provider
 * returns.
 *
 * This is INERT for basecamp/slack until real OAuth credentials + a
 * resolved access token are available — it fails fast with a clear
 * SyncRunLog "error" entry rather than fabricating data.
 */
export async function runSync(
  provider: IntegrationProviderId,
  userId: string,
): Promise<SyncResult> {
  const runLog = await prisma.syncRunLog.create({
    data: { provider, status: "running" },
  });

  try {
    const settings = await prisma.integrationSettings.findUnique({
      where: { provider_userId: { provider, userId } },
    });

    if (!settings) {
      throw new Error(
        `No IntegrationSettings configured for provider "${provider}". Configure it in Admin → Integration Settings first.`,
      );
    }

    if (!settings.tokenRef) {
      throw new Error(
        `No tokenRef configured for provider "${provider}". Complete the OAuth flow first (inert until real client credentials are set).`,
      );
    }

    const mapping = JSON.parse(settings.mappingRules) as MappingRules;

    // NOTE: in a real deployment, `settings.tokenRef` is resolved against
    // an encrypted secret store (KMS/Vault) to obtain the live access
    // token. We do not implement that resolution here since it is
    // deployment-specific infrastructure, not application logic.
    const accessToken = await resolveAccessTokenFromSecretStore(settings.tokenRef);

    const items =
      provider === "basecamp"
        ? await fetchBasecampTodos(accessToken, mapping.channelOrProjectIds[0] ?? "", mapping)
        : await fetchSlackMessages(accessToken, mapping);

    let count = 0;
    for (const item of items) {
      const existing = await prisma.dailyTask.findFirst({
        where: { sourceRef: item.sourceRef },
      });

      if (existing) {
        await prisma.dailyTask.update({
          where: { id: existing.id },
          data: { title: item.title, description: item.description, date: item.date },
        });
      } else {
        await prisma.dailyTask.create({
          data: {
            date: item.date,
            title: item.title,
            description: item.description,
            sourceRef: item.sourceRef,
            status: "open",
          },
        });
      }
      count += 1;
    }

    await prisma.syncRunLog.update({
      where: { id: runLog.id },
      data: { status: "success", finishedAt: new Date(), lastCursor: String(items.length) },
    });

    return { status: "success", itemsIngested: count };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown sync error";
    await prisma.syncRunLog.update({
      where: { id: runLog.id },
      data: { status: "error", finishedAt: new Date(), message },
    });
    return { status: "error", itemsIngested: 0, message };
  }
}

async function resolveAccessTokenFromSecretStore(tokenRef: string): Promise<string> {
  // TODO(production): resolve `tokenRef` against your real secret store
  // (AWS Secrets Manager, HashiCorp Vault, etc.) and return the live
  // OAuth access token, refreshing it first if expired.
  throw new Error(
    `Secret store resolution is not implemented in this deployment (tokenRef=${tokenRef}). ` +
      "This is expected until you wire up a real secret store and OAuth token refresh.",
  );
}
