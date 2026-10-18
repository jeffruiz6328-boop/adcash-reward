import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { emailWelcome } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional(),
});

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, referralCode } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    let referredById: string | null = null;

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        referralCode: generateReferralCode(),
        referredById,
      },
    });

    if (referredById) {
      const setting = await prisma.setting.findUnique({
        where: { key: "referralReward" },
      });
      const rewardAmount = setting ? parseFloat(setting.value) : 10;

      if (rewardAmount > 0) {
        await prisma.user.update({
          where: { id: referredById },
          data: {
            balance: { increment: rewardAmount },
            totalEarned: { increment: rewardAmount },
          },
        });
      }
    }

    emailWelcome(email, name).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
