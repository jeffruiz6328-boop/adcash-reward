import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  referralReward: z.number().min(0).max(100),
  minWithdrawal: z.number().min(1).max(1000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { referralReward, minWithdrawal } = schema.parse(body);

    await prisma.$transaction([
      prisma.setting.upsert({
        where: { key: "referralReward" },
        update: { value: String(referralReward) },
        create: { key: "referralReward", value: String(referralReward) },
      }),
      prisma.setting.upsert({
        where: { key: "minWithdrawal" },
        update: { value: String(minWithdrawal) },
        create: { key: "minWithdrawal", value: String(minWithdrawal) },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid values" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
