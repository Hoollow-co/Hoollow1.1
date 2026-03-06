import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { impactXP: "desc" },
            take: 10,
            select: {
                id: true,
                name: true,
                image: true,
                role: true,
                impactXP: true,
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
