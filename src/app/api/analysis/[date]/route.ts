import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { date: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analysis = await prisma.dailyAnalysis.findUnique({ where: { date: params.date } });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "admin";
  if (!analysis.published && !isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ analysis });
}

export async function PATCH(req: NextRequest, { params }: { params: { date: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    analysisText?: string;
    metadata?: Record<string, unknown>;
    published?: boolean;
  };

  const metadata = body.metadata ? JSON.stringify(body.metadata) : undefined;

  const analysis = await prisma.dailyAnalysis.upsert({
    where: { date: params.date },
    create: {
      date: params.date,
      analysisText: body.analysisText ?? "",
      metadata: metadata ?? "{}",
      published: body.published ?? false,
    },
    update: {
      ...(body.analysisText !== undefined ? { analysisText: body.analysisText } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
    },
  });

  return NextResponse.json({ analysis });
}
