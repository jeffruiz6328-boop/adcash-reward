import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailPasswordReset } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return success so we don't leak which emails exist
    if (!user || user.isBanned) {
      return NextResponse.json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const exp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExp: exp },
    });

    const base = process.env.NEXTAUTH_URL || "https://adcash-reward.vercel.app";
    const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${token}`;

    await emailPasswordReset(user.email, resetUrl);

    return NextResponse.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
