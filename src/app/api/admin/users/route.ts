import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailBanned } from "@/lib/email";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, action, amount } = await req.json();

    if (action === "ban") {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isBanned: true },
      });
      if (user.email) {
        try {
          await emailBanned(user.email);
        } catch (e) {
          console.error("ban email failed", e);
        }
      }
    } else if (action === "unban") {
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned: false },
      });
    } else if (action === "adjust" && typeof amount === "number") {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: Math.max(0, amount) },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
