import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    where: { isActive: true },
    orderBy: { reward: "desc" },
  });
  return NextResponse.json({ tasks });
}
