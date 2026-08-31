import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.integrationSettings.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    provider: "basecamp" | "slack";
    mappingRules: Record<string, unknown>;
    tokenRef?: string | null;
  };

  const settings = await prisma.integrationSettings.upsert({
    where: { provider_userId: { provider: body.provider, userId: session.user.id } },
    create: {
      provider: body.provider,
      userId: session.user.id,
      mappingRules: JSON.stringify(body.mappingRules),
      tokenRef: body.tokenRef ?? null,
    },
    update: {
      mappingRules: JSON.stringify(body.mappingRules),
      ...(body.tokenRef !== undefined ? { tokenRef: body.tokenRef } : {}),
    },
  });

  return NextResponse.json({ settings });
}
