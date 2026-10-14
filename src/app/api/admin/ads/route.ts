import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      duration: z.number().min(10).max(300),
      reward: z.number().min(0.10).max(8),
      imageUrl: z.string().url().nullable().optional(),
      videoUrl: z.string().url().nullable().optional(),
    });
    const data = schema.parse(body);

    await prisma.ad.create({ data });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { adId, isActive } = await req.json();
    await prisma.ad.update({
      where: { id: adId },
      data: { isActive },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
