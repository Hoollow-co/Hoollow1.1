import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List DM conversations (accepted message requests)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;

        // Get all accepted requests involving this user
        const requests = await (prisma as any).messageRequest.findMany({
            where: {
                status: "accepted",
                OR: [{ fromUserId: userId }, { toUserId: userId }],
            },
            include: {
                fromUser: { select: { id: true, name: true, image: true, role: true } },
                toUser: { select: { id: true, name: true, image: true, role: true } },
            },
        });

        // For each conversation, get the last message
        const conversations = await Promise.all(
            requests.map(async (req: any) => {
                const otherUser = req.fromUserId === userId ? req.toUser : req.fromUser;
                const lastMsg = await (prisma as any).directMessage.findFirst({
                    where: {
                        OR: [
                            { fromUserId: userId, toUserId: otherUser.id },
                            { fromUserId: otherUser.id, toUserId: userId },
                        ],
                    },
                    orderBy: { createdAt: "desc" },
                });
                return { requestId: req.id, user: otherUser, lastMessage: lastMsg };
            })
        );

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("DM list error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Send a message request or send a DM
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { action, toUserId, text } = await req.json();

        if (action === "request") {
            // Send a message request
            if (!toUserId) return NextResponse.json({ error: "Target user required" }, { status: 400 });
            if (toUserId === session.user.id) return NextResponse.json({ error: "Can't message yourself" }, { status: 400 });

            // Check if request already exists
            const existing = await (prisma as any).messageRequest.findFirst({
                where: {
                    OR: [
                        { fromUserId: session.user.id, toUserId },
                        { fromUserId: toUserId, toUserId: session.user.id },
                    ],
                },
            });
            if (existing) {
                return NextResponse.json({ error: "Request already exists", status: existing.status }, { status: 409 });
            }

            const msgReq = await (prisma as any).messageRequest.create({
                data: { fromUserId: session.user.id, toUserId },
            });

            // Create notification
            const fromUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
            await (prisma as any).notification.create({
                data: {
                    type: "message_request",
                    message: `${fromUser?.name || "Someone"} wants to message you`,
                    userId: toUserId,
                    relatedId: session.user.id,
                },
            });

            return NextResponse.json(msgReq, { status: 201 });
        }

        if (action === "send") {
            // Send a DM (must have accepted request)
            if (!toUserId || !text?.trim()) return NextResponse.json({ error: "Message and recipient required" }, { status: 400 });

            const request = await (prisma as any).messageRequest.findFirst({
                where: {
                    status: "accepted",
                    OR: [
                        { fromUserId: session.user.id, toUserId },
                        { fromUserId: toUserId, toUserId: session.user.id },
                    ],
                },
            });
            if (!request) return NextResponse.json({ error: "No accepted message request" }, { status: 403 });

            const dm = await (prisma as any).directMessage.create({
                data: { text: text.trim(), fromUserId: session.user.id, toUserId },
                include: { fromUser: { select: { id: true, name: true, image: true } } },
            });

            return NextResponse.json(dm, { status: 201 });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("DM error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Accept or reject a message request
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { requestId, status } = await req.json();
        if (!requestId || !["accepted", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Valid requestId and status required" }, { status: 400 });
        }

        const existing = await (prisma as any).messageRequest.findUnique({ where: { id: requestId } });
        if (!existing || existing.toUserId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await (prisma as any).messageRequest.update({
            where: { id: requestId },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Message request update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
