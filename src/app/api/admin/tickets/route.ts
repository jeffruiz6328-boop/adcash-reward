import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { ticketId, status, adminReply } = await req.json();

    const data: { status?: string; adminReply?: string } = {};
    if (status && ["open", "replied", "closed"].includes(status)) {
      data.status = status;
    }
    if (typeof adminReply === "string") {
      data.adminReply = adminReply;
      if (!data.status) data.status = "replied";
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
