import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const clubs = await prisma.club.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { members: true } },
                members: {
                    take: 5,
                    include: {
                        user: { select: { id: true, name: true, image: true, impactXP: true } },
                    },
                },
            },
        });

        const formatted = clubs.map((club) => {
            const currentMember = userId
                ? club.members.find((m) => m.userId === userId)
                : null;

            return {
                id: club.id,
                name: club.name,
                description: club.description,
                type: club.type,
                domain: club.domain,
                gradient: club.gradient,
                tags: club.tags,
                memberCount: club._count.members,
                members: club.members.map((m) => m.user),
                impactXP: club.members.reduce((sum, m) => sum + (m.user.impactXP || 0), 0),
                isMember: !!currentMember,
                currentUserRole: currentMember?.role || null,
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Clubs fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, type, domain, tags, gradient } = await req.json();

        if (!name || !description) {
            return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
        }

        const club = await prisma.club.create({
            data: {
                name,
                description,
                type: type || "open",
                domain: domain || "Tech",
                tags: tags || [],
                gradient: gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                creatorId: session.user.id,
                members: {
                    create: { userId: session.user.id, role: "owner" },
                },
            },
        });

        return NextResponse.json(club, { status: 201 });
    } catch (error) {
        console.error("Club creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
