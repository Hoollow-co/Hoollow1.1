import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLE_LEVEL: Record<string, number> = { owner: 4, coowner: 3, manager: 2, member: 1 };

// GET: List invitations for a club (sent + received by current user)
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const clubId = params.id;

        // Must be a member to view invitations
        const member = await (prisma as any).clubMember.findUnique({
            where: { clubId_userId: { clubId, userId: session.user.id } },
        });
        if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

        const myLevel = ROLE_LEVEL[member.role] || 0;

        // Managers+ see all sent invitations; everyone sees their own received
        const [sent, received] = await Promise.all([
            myLevel >= ROLE_LEVEL.manager
                ? (prisma as any).clubInvitation.findMany({
                    where: { clubId },
                    include: {
                        fromUser: { select: { id: true, name: true, image: true } },
                        toUser: { select: { id: true, name: true, image: true } },
                    },
                    orderBy: { createdAt: "desc" },
                })
                : (prisma as any).clubInvitation.findMany({
                    where: { clubId, fromUserId: session.user.id },
                    include: {
                        toUser: { select: { id: true, name: true, image: true } },
                    },
                    orderBy: { createdAt: "desc" },
                }),
            (prisma as any).clubInvitation.findMany({
                where: { toUserId: session.user.id, status: "pending" },
                include: {
                    club: { select: { id: true, name: true, gradient: true } },
                    fromUser: { select: { id: true, name: true, image: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return NextResponse.json({ sent, received });
    } catch (error) {
        console.error("Club invitations error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Send a club invitation
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const clubId = params.id;
        const { toUserId } = await req.json();
        if (!toUserId) return NextResponse.json({ error: "Target user required" }, { status: 400 });

        // Check sender is manager+
        const member = await (prisma as any).clubMember.findUnique({
            where: { clubId_userId: { clubId, userId: session.user.id } },
        });
        if (!member || (ROLE_LEVEL[member.role] || 0) < ROLE_LEVEL.manager) {
            return NextResponse.json({ error: "Need manager or higher to invite" }, { status: 403 });
        }

        // Check target isn't already a member
        const existing = await (prisma as any).clubMember.findUnique({
            where: { clubId_userId: { clubId, userId: toUserId } },
        });
        if (existing) return NextResponse.json({ error: "User is already a member" }, { status: 409 });

        const invite = await (prisma as any).clubInvitation.create({
            data: { clubId, fromUserId: session.user.id, toUserId },
        });

        // Create notification
        const [fromUser, club] = await Promise.all([
            prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
            (prisma as any).club.findUnique({ where: { id: clubId }, select: { name: true } }),
        ]);
        await (prisma as any).notification.create({
            data: {
                type: "club_invite",
                message: `${fromUser?.name || "Someone"} invited you to join ${club?.name || "a club"}`,
                userId: toUserId,
                relatedId: clubId,
            },
        });

        return NextResponse.json(invite, { status: 201 });
    } catch (error) {
        console.error("Club invite error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Accept or reject a club invitation
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { invitationId, status } = await req.json();
        if (!invitationId || !["accepted", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Valid invitationId and status required" }, { status: 400 });
        }

        const invite = await (prisma as any).clubInvitation.findUnique({ where: { id: invitationId } });
        if (!invite || invite.toUserId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await (prisma as any).clubInvitation.update({ where: { id: invitationId }, data: { status } });

        // If accepted, add user as member
        if (status === "accepted") {
            await (prisma as any).clubMember.create({
                data: { clubId: invite.clubId, userId: session.user.id, role: "member" },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Club invite update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
