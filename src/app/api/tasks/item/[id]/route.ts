import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string;
    status?: string;
    dueAt?: string | null;
    order?: number;
  };

  const task = await prisma.dailyTask.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.dueAt !== undefined ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    },
  });

  return NextResponse.json({ task });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.dailyTask.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
