import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || !task.isActive) {
      return NextResponse.json({ error: "Task not found or inactive" }, { status: 404 });
    }

    // For daily tasks: only once per 24h
    // For other tasks: only once ever (simple anti-fraud)
    const windowMs = task.type === "daily" ? 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;

    const recent = await prisma.taskCompletion.findFirst({
      where: {
        userId: session.user.id,
        taskId,
        createdAt: { gte: new Date(Date.now() - windowMs) },
      },
    });

    if (recent) {
      return NextResponse.json(
        { error: task.type === "daily" ? "You already claimed the daily bonus today" : "You already completed this task" },
        { status: 429 }
      );
    }

    await prisma.$transaction([
      prisma.taskCompletion.create({
        data: {
          userId: session.user.id,
          taskId,
          reward: task.reward,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          balance: { increment: task.reward },
          totalEarned: { increment: task.reward },
        },
      }),
    ]);

    return NextResponse.json({ success: true, reward: task.reward });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
