import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ failed: null });
  }

  const failed = await prisma.withdrawal.findFirst({
    where: {
      userId: session.user.id,
      status: "rejected",
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      amount: true,
      method: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ failed });
}
