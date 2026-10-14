import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1 to avoid confusion
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
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Generate activation code
    if (action === "generateCode") {
      const code = generateCode();
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { activationCode: code },
      });
      return NextResponse.json({ success: true, activationCode: code });
    }

    // Update status
    if (status && ["pending", "processing", "approved", "rejected"].includes(status)) {
      // If rejecting after money was already deducted, refund
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
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
