import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailSupportReply } from "@/lib/email";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { ticketId, status, reply } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    if (reply && typeof reply === "string" && reply.trim()) {
      await prisma.supportReply.create({
        data: {
          ticketId,
          body: reply.trim(),
          isAdmin: true,
        },
      });
      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: status === "closed" ? "closed" : "replied",
          adminReply: reply.trim(),
        },
      });

      if (ticket.email) {
        try {
          await emailSupportReply(ticket.email, {
            subject: ticket.subject,
            reply: reply.trim(),
          });
        } catch (e) {
          console.error("support email failed", e);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (status && ["open", "replied", "closed"].includes(status)) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
