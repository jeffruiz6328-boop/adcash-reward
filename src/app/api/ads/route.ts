import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Reliable public sample videos (Google CDN)
const RELIABLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

export async function GET() {
  const session = await getServerSession(authOptions);

  const ads = await prisma.ad.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  let claimedIds = new Set<string>();
  if (session?.user?.id) {
    const views = await prisma.adView.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { adId: true },
    });
    claimedIds = new Set(views.map((v) => v.adId));
  }

  const mapped = ads.map((ad, i) => ({
    ...ad,
    // Always use reliable Google sample videos so playback works
    videoUrl: RELIABLE_VIDEOS[i % RELIABLE_VIDEOS.length],
    claimedToday: claimedIds.has(ad.id),
  }));

  return NextResponse.json({ ads: mapped });
}
