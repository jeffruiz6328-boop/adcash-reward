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
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter an activation code" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId: session.user.id,
        activationCode: code.trim().toUpperCase(),
        status: "pending",
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Invalid code or withdrawal not found. Check the code and try again." },
        { status: 400 }
      );
    }

    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "processing" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
