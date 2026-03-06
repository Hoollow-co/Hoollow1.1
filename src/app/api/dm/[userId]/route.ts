import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch DM history with a specific user
export async function GET(req: Request, { params }: { params: { userId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const otherUserId = params.userId;

        // Verify accepted request exists
        const request = await (prisma as any).messageRequest.findFirst({
            where: {
                status: "accepted",
                OR: [
                    { fromUserId: session.user.id, toUserId: otherUserId },
                    { fromUserId: otherUserId, toUserId: session.user.id },
                ],
            },
        });
        if (!request) return NextResponse.json({ error: "No accepted request" }, { status: 403 });

        const messages = await (prisma as any).directMessage.findMany({
            where: {
                OR: [
                    { fromUserId: session.user.id, toUserId: otherUserId },
                    { fromUserId: otherUserId, toUserId: session.user.id },
                ],
            },
            orderBy: { createdAt: "asc" },
            include: {
                fromUser: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("DM history error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
