import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailActivationCode, emailWithdrawalStatus } from "@/lib/email";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 15; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { withdrawalId, status, action } = body;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userEmail = withdrawal.user?.email;

    if (action === "generateCode") {
      const code = generateCode();
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { activationCode: code },
      });

      // Await email so Vercel does not kill the function before it sends
      let emailSent = false;
      if (userEmail) {
        try {
          emailSent = await emailActivationCode(userEmail, {
            amount: withdrawal.amount,
            method: withdrawal.method,
            code,
          });
        } catch (e) {
          console.error("activation email failed", e);
        }
      }

      return NextResponse.json({
        success: true,
        activationCode: code,
        emailSent,
        emailTo: userEmail || null,
      });
    }

    if (status && ["pending", "processing", "approved", "rejected"].includes(status)) {
      if (status === "rejected" && withdrawal.status !== "rejected") {
        await prisma.$transaction([
          prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: { status: "rejected" },
          }),
          prisma.user.update({
            where: { id: withdrawal.userId },
            data: { balance: { increment: withdrawal.amount } },
          }),
        ]);
      } else {
        await prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status },
        });
      }

      if (userEmail && ["pending", "approved", "rejected", "processing"].includes(status)) {
        try {
          await emailWithdrawalStatus(userEmail, {
            amount: withdrawal.amount,
            method: withdrawal.method,
            status,
            activationCode: withdrawal.activationCode,
          });
        } catch (e) {
          console.error("status email failed", e);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
