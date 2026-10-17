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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ tickets: [] });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { email: session.user.email || "" },
      ],
    },
    include: {
      replies: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // User reply to existing ticket
    if (body.ticketId && body.reply) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Login required" }, { status: 401 });
      }

      const ticket = await prisma.supportTicket.findFirst({
        where: {
          id: body.ticketId,
          OR: [
            { userId: session.user.id },
            { email: session.user.email || "" },
          ],
        },
      });

      if (!ticket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }

      if (ticket.status === "closed") {
        return NextResponse.json({ error: "This ticket is closed" }, { status: 400 });
      }

      await prisma.supportReply.create({
        data: {
          ticketId: ticket.id,
          body: String(body.reply).trim(),
          isAdmin: false,
        },
      });
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: "open" }, // reopen so admin sees it
      });

      return NextResponse.json({ success: true });
    }

    // New ticket
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
