import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLE_LEVEL: Record<string, number> = { owner: 4, coowner: 3, manager: 2, member: 1 };

// PATCH: Change a member's role
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { memberId, newRole } = await req.json();
        if (!memberId || !newRole || !ROLE_LEVEL[newRole]) {
            return NextResponse.json({ error: "Valid memberId and role required" }, { status: 400 });
        }

        // Get acting user's membership
        const actingMember = await prisma.clubMember.findUnique({
            where: { clubId_userId: { clubId: params.id, userId: session.user.id } },
        });
        if (!actingMember || (ROLE_LEVEL[actingMember.role] || 0) < ROLE_LEVEL.coowner) {
            return NextResponse.json({ error: "Need co-owner or higher to change roles" }, { status: 403 });
        }

        // Get target member
        const targetMember = await prisma.clubMember.findUnique({ where: { id: memberId } });
        if (!targetMember || targetMember.clubId !== params.id) {
            return NextResponse.json({ error: "Member not found in this club" }, { status: 404 });
        }

        // Can't change role of someone equal or higher
        if ((ROLE_LEVEL[targetMember.role] || 0) >= (ROLE_LEVEL[actingMember.role] || 0)) {
            return NextResponse.json({ error: "Cannot change role of equal/higher rank" }, { status: 403 });
        }

        // Can't promote to equal or higher than yourself
        if (ROLE_LEVEL[newRole] >= (ROLE_LEVEL[actingMember.role] || 0)) {
            return NextResponse.json({ error: "Cannot promote above your own rank" }, { status: 403 });
        }

        // Only owner can transfer ownership
        if (newRole === "owner" && actingMember.role !== "owner") {
            return NextResponse.json({ error: "Only owner can transfer ownership" }, { status: 403 });
        }

        const updated = await prisma.clubMember.update({
            where: { id: memberId },
            data: { role: newRole },
            include: { user: { select: { id: true, name: true, image: true } } },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Role change error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Kick a member
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get("memberId");
        if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

        const actingMember = await prisma.clubMember.findUnique({
            where: { clubId_userId: { clubId: params.id, userId: session.user.id } },
        });
        if (!actingMember || (ROLE_LEVEL[actingMember.role] || 0) < ROLE_LEVEL.manager) {
            return NextResponse.json({ error: "Need manager or higher to kick members" }, { status: 403 });
        }

        const targetMember = await prisma.clubMember.findUnique({ where: { id: memberId } });
        if (!targetMember || targetMember.clubId !== params.id) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Can't kick equal or higher role
        if ((ROLE_LEVEL[targetMember.role] || 0) >= (ROLE_LEVEL[actingMember.role] || 0)) {
            return NextResponse.json({ error: "Cannot kick equal/higher rank" }, { status: 403 });
        }

        await prisma.clubMember.delete({ where: { id: memberId } });
        return NextResponse.json({ kicked: true });
    } catch (error) {
        console.error("Kick member error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
