import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Check if a username is available
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");

        if (!username || username.length < 3) {
            return NextResponse.json({ available: false, error: "Username must be at least 3 characters" });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json({ available: false, error: "Only letters, numbers, and underscores allowed" });
        }

        if (username.length > 20) {
            return NextResponse.json({ available: false, error: "Username must be 20 characters or less" });
        }

        const existing = await prisma.user.findFirst({
            where: { username: { equals: username, mode: "insensitive" } },
        });

        return NextResponse.json({
            available: !existing,
            error: existing ? "Username is already taken" : null,
        });
    } catch (error) {
        console.error("Username check error:", error);
        return NextResponse.json({ available: false, error: "Server error" }, { status: 500 });
    }
}
