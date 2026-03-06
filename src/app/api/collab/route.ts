import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List collab requests (sent + received by current user)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [sent, received] = await Promise.all([
            prisma.collabRequest.findMany({
                where: { fromUserId: session.user.id },
                include: {
                    toUser: { select: { id: true, name: true, image: true, role: true } },
                    post: { select: { id: true, title: true } },
                    project: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.collabRequest.findMany({
                where: { toUserId: session.user.id },
                include: {
                    fromUser: { select: { id: true, name: true, image: true, role: true } },
                    post: { select: { id: true, title: true } },
                    project: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return NextResponse.json({ sent, received });
    } catch (error) {
        console.error("Collab fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Send a collab request
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId, projectId, toUserId, message } = await req.json();

        if (!toUserId) return NextResponse.json({ error: "Target user required" }, { status: 400 });
        if (!postId && !projectId) return NextResponse.json({ error: "Post or project required" }, { status: 400 });
        if (toUserId === session.user.id) return NextResponse.json({ error: "Cannot collab with yourself" }, { status: 400 });

        const collab = await prisma.collabRequest.create({
            data: {
                postId: postId || null,
                projectId: projectId || null,
                fromUserId: session.user.id,
                toUserId,
                message: message || null,
            },
        });

        return NextResponse.json(collab, { status: 201 });
    } catch (error) {
        console.error("Collab request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Accept or reject a collab request
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();
        if (!id || !["accepted", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Valid ID and status required" }, { status: 400 });
        }

        const existing = await prisma.collabRequest.findUnique({ where: { id } });
        if (!existing || existing.toUserId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const collab = await prisma.collabRequest.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(collab);
    } catch (error) {
        console.error("Collab update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
