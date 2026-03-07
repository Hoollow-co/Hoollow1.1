import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Search users by name for inviting/messaging
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";

        if (q.length < 2) return NextResponse.json([]);

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: session.user.id } },
                    {
                        OR: [
                            { name: { contains: q } },
                            { email: { contains: q } },
                            { username: { contains: q } },
                        ],
                    },
                ],
            },
            select: { id: true, name: true, username: true, image: true, role: true, impactXP: true },
            take: 10,
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
