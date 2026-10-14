import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getMinWithdrawal() {
  const setting = await prisma.setting.findUnique({ where: { key: "minWithdrawal" } });
  return setting ? parseFloat(setting.value) : 50;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });

  const minWithdrawal = await getMinWithdrawal();

  return NextResponse.json({
    balance: user?.balance ?? 0,
    minWithdrawal,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const minWithdrawal = await getMinWithdrawal();

    const schema = z.object({
      amount: z.number().min(minWithdrawal),
      method: z.enum(["bitcoin", "paypal", "amazon"]),
      details: z.string().min(3).max(500),
    });

    const { amount, method, details } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.isBanned) {
      return NextResponse.json({ error: "Account not allowed" }, { status: 403 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (amount < minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is $${minWithdrawal}` },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.withdrawal.create({
        data: {
          userId: user.id,
          amount,
          method,
          details,
          status: "pending",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
