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
    const { adId } = await req.json();
    if (!adId) {
      return NextResponse.json({ error: "Missing adId" }, { status: 400 });
    }

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad || !ad.isActive) {
      return NextResponse.json({ error: "Ad not found or inactive" }, { status: 404 });
    }

    // Same ad only once every 24 hours
    const recent = await prisma.adView.findFirst({
      where: {
        userId: session.user.id,
        adId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recent) {
      return NextResponse.json(
        { error: "You already claimed this ad today. Try another one or come back tomorrow." },
        { status: 429 }
      );
    }

    const [view] = await prisma.$transaction([
      prisma.adView.create({
        data: {
          userId: session.user.id,
          adId,
          reward: ad.reward,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          balance: { increment: ad.reward },
          totalEarned: { increment: ad.reward },
        },
      }),
    ]);

    return NextResponse.json({ success: true, reward: ad.reward, viewId: view.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
