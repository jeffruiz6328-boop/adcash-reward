import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = schema.parse(body);

    const session = await getServerSession(authOptions);

    await prisma.supportTicket.create({
      data: {
        name,
        email,
        subject,
        message,
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please fill all fields correctly" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
