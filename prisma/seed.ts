import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin-password-123", 10);
  const memberPasswordHash = await bcrypt.hash("member-password-123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@joby.ai" },
    update: {},
    create: {
      email: "admin@joby.ai",
      name: "Admin",
      role: "admin",
      passwordHash: adminPasswordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "member@joby.ai" },
    update: {},
    create: {
      email: "member@joby.ai",
      name: "Member",
      role: "member",
      passwordHash: memberPasswordHash,
    },
  });

  const today = new Date().toISOString().slice(0, 10);

  await prisma.dailyAnalysis.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      analysisText:
        "Seed analysis: a quiet, focused day. Deep work in the morning, a sync review in the afternoon.",
      published: true,
    },
  });

  await prisma.dailyTask.createMany({
    data: [
      { date: today, title: "Review holographic UI pass", status: "open", order: 0 },
      { date: today, title: "Draft integration mapping rules", status: "in_progress", order: 1 },
    ],
  });

  await prisma.integrationSettings.upsert({
    where: { provider_userId: { provider: "basecamp", userId: admin.id } },
    update: {},
    create: {
      provider: "basecamp",
      userId: admin.id,
      mappingRules: JSON.stringify({ channelOrProjectIds: [], dateTaggingStrategy: "created_date" }),
    },
  });

  await prisma.integrationSettings.upsert({
    where: { provider_userId: { provider: "slack", userId: admin.id } },
    update: {},
    create: {
      provider: "slack",
      userId: admin.id,
      mappingRules: JSON.stringify({ channelOrProjectIds: [], dateTaggingStrategy: "created_date" }),
    },
  });

  console.log("Seed complete. admin@joby.ai / admin-password-123, member@joby.ai / member-password-123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
