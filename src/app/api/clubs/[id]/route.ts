import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Role hierarchy for permission checks
const ROLE_LEVEL: Record<string, number> = { owner: 4, coowner: 3, manager: 2, member: 1 };

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const club = await prisma.club.findUnique({
            where: { id: params.id },
            include: {
                _count: { select: { members: true, messages: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
                    },
                    orderBy: { joinedAt: "asc" },
                },
            },
        });

        if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

        const currentMember = userId
            ? club.members.find((m) => m.userId === userId)
            : null;

        return NextResponse.json({
            id: club.id,
            name: club.name,
            description: club.description,
            type: club.type,
            domain: club.domain,
            gradient: club.gradient,
            tags: club.tags,
            creatorId: club.creatorId,
            memberCount: club._count.members,
            messageCount: club._count.messages,
            members: club.members.map((m) => ({
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                user: m.user,
            })),
            currentUserRole: currentMember?.role || null,
            isMember: !!currentMember,
            createdAt: club.createdAt,
        });
    } catch (error) {
        console.error("Club detail error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check permission: owner or coowner only
        const member = await prisma.clubMember.findUnique({
            where: { clubId_userId: { clubId: params.id, userId: session.user.id } },
        });

        if (!member || (ROLE_LEVEL[member.role] || 0) < ROLE_LEVEL.coowner) {
            return NextResponse.json({ error: "Need co-owner or higher" }, { status: 403 });
        }

        const { name, description, type, domain, gradient } = await req.json();
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (domain !== undefined) updateData.domain = domain;
        if (gradient !== undefined) updateData.gradient = gradient;

        const club = await prisma.club.update({ where: { id: params.id }, data: updateData });
        return NextResponse.json(club);
    } catch (error) {
        console.error("Club edit error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const member = await prisma.clubMember.findUnique({
            where: { clubId_userId: { clubId: params.id, userId: session.user.id } },
        });

        if (!member || member.role !== "owner") {
            return NextResponse.json({ error: "Only the owner can delete this club" }, { status: 403 });
        }

        await prisma.club.delete({ where: { id: params.id } });
        return NextResponse.json({ deleted: true });
    } catch (error) {
        console.error("Club delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
