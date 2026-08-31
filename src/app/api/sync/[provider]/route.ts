import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runSync } from "@/lib/integrations/sync";
import type { IntegrationProviderId } from "@/lib/integrations/types";

export async function POST(_req: NextRequest, { params }: { params: { provider: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (params.provider !== "basecamp" && params.provider !== "slack") {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  const result = await runSync(params.provider as IntegrationProviderId, session.user.id);

  return NextResponse.json(result, { status: result.status === "success" ? 200 : 502 });
}
