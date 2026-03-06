import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clubId = params.id;
        const userId = session.user.id;

        const existing = await prisma.clubMember.findUnique({
            where: { clubId_userId: { clubId, userId } },
        });

        if (existing) {
            // Leave club
            await prisma.clubMember.delete({ where: { id: existing.id } });
            return NextResponse.json({ joined: false });
        } else {
            // Join club
            await prisma.clubMember.create({
                data: { clubId, userId, role: "member" },
            });
            return NextResponse.json({ joined: true });
        }
    } catch (error) {
        console.error("Club join error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
