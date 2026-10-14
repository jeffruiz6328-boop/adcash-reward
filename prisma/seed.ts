import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@watchads.com" },
    update: {},
    create: {
      email: "admin@watchads.com",
      name: "Admin",
      password: adminPassword,
      isAdmin: true,
      balance: 0,
      referralCode: "ADMIN1",
    },
  });

  // Demo user
  const userPassword = await bcrypt.hash("user123", 10);
  await prisma.user.upsert({
    where: { email: "demo@watchads.com" },
    update: {},
    create: {
      email: "demo@watchads.com",
      name: "Demo User",
      password: userPassword,
      balance: 12.50,
      totalEarned: 12.50,
      referralCode: "DEMO99",
    },
  });

  // Clear existing ads & tasks for clean re-seed
  await prisma.adView.deleteMany();
  await prisma.taskCompletion.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.task.deleteMany();

  // Realistic video ads (using free public sample videos)
  // These are real playable videos – user must watch to the end
  const ads = [
    {
      title: "Starbucks – Morning Boost",
      description: "Start your day the right way with our signature caramel macchiato.",
      duration: 30,
      reward: 0.18,
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      title: "Nike – Just Do It",
      description: "Push your limits. New running collection available now.",
      duration: 15,
      reward: 0.25,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
    {
      title: "Apple – iPhone 16 Pro",
      description: "Titanium. So strong. So light. So Pro.",
      duration: 30,
      reward: 0.40,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
    {
      title: "Coca-Cola – Open Happiness",
      description: "Share a Coke with someone special today.",
      duration: 20,
      reward: 0.15,
      imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      title: "Samsung Galaxy – Epic Moments",
      description: "Capture life in 200MP ultra clarity.",
      duration: 25,
      reward: 0.30,
      imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    },
    {
      title: "Spotify Premium – Ad Free",
      description: "Music without limits. Try 3 months free.",
      duration: 20,
      reward: 0.22,
      imageUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    },
    {
      title: "Airbnb – Live Anywhere",
      description: "Find unique stays and experiences around the world.",
      duration: 35,
      reward: 0.55,
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    },
    {
      title: "Tesla – Future of Driving",
      description: "Experience the safest, quickest car on the road.",
      duration: 40,
      reward: 0.75,
      imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    },
  ];

  for (const ad of ads) {
    await prisma.ad.create({ data: ad });
  }

  // Other tasks
  const tasks = [
    {
      title: "Daily Check-in Bonus",
      description: "Come back every day and claim your free daily reward.",
      type: "daily",
      reward: 0.10,
      imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400",
    },
    {
      title: "Quick 2-Minute Survey",
      description: "Answer 5 simple questions about your shopping habits.",
      type: "survey",
      reward: 0.45,
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
    },
    {
      title: "Sign up for Newsletter",
      description: "Join our partner’s free newsletter and confirm your email.",
      type: "signup",
      reward: 0.75,
      imageUrl: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400",
    },
    {
      title: "Install Mobile Game",
      description: "Download and reach level 5 in this popular puzzle game.",
      type: "install",
      reward: 1.50,
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
    },
    {
      title: "Complete Shopping Offer",
      description: "Make a small purchase ($10+) with our partner store.",
      type: "offer",
      reward: 3.00,
      imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400",
    },
    {
      title: "Long Survey – Consumer Habits",
      description: "15-minute detailed survey about lifestyle and brands.",
      type: "survey",
      reward: 2.25,
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    },
    {
      title: "Open a Free Demo Account",
      description: "Register for a free trading demo account with our partner.",
      type: "signup",
      reward: 4.50,
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    },
    {
      title: "High-Paying App Install",
      description: "Install and open the app for 30 seconds. Limited offer!",
      type: "install",
      reward: 6.00,
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  // Platform settings
  await prisma.setting.upsert({
    where: { key: "referralReward" },
    update: {},
    create: { key: "referralReward", value: "10" },
  });

  await prisma.setting.upsert({
    where: { key: "minWithdrawal" },
    update: {},
    create: { key: "minWithdrawal", value: "50" },
  });

  console.log("✅ Seed completed with realistic video ads!");
  console.log("Admin: admin@watchads.com / admin123");
  console.log("Demo user: demo@watchads.com / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
