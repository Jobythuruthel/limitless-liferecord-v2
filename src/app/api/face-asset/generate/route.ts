import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFaceAsset } from "@/lib/faceGenerator";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { prompt?: string };

  const pending = await prisma.faceAsset.create({
    data: { userId: session.user.id, status: "generating" },
  });

  const result = await generateFaceAsset({ userId: session.user.id, prompt: body.prompt });

  const faceAsset = await prisma.faceAsset.update({
    where: { id: pending.id },
    data: {
      status: result.status,
      url: result.url,
      mcpId: result.mcpId,
      checksum: result.checksum,
    },
  });

  return NextResponse.json({ faceAsset, isPlaceholder: result.isPlaceholder, note: result.error });
}
