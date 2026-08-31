import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { date: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.dailyTask.findMany({
    where: { date: params.date },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest, { params }: { params: { date: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    title: string;
    description?: string;
    status?: string;
    dueAt?: string;
    order?: number;
  };

  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const task = await prisma.dailyTask.create({
    data: {
      date: params.date,
      title: body.title,
      description: body.description ?? "",
      status: body.status ?? "open",
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      order: body.order ?? 0,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
