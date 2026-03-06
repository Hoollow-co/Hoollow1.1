import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch user's notifications
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const notifications = await (prisma as any).notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        const unreadCount = await (prisma as any).notification.count({
            where: { userId: session.user.id, read: false },
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Notifications error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Mark notifications as read
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { ids, readAll } = await req.json();

        if (readAll) {
            await (prisma as any).notification.updateMany({
                where: { userId: session.user.id, read: false },
                data: { read: true },
            });
        } else if (ids?.length > 0) {
            await (prisma as any).notification.updateMany({
                where: { id: { in: ids }, userId: session.user.id },
                data: { read: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Mark read error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
