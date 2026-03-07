import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { role, displayName, username, bio, skills, openToCollab } = body;

        // Validate required fields
        const errors: Record<string, string> = {};
        if (!displayName || displayName.trim().length === 0) {
            errors.displayName = "Display name is required";
        }
        if (!username || username.trim().length < 3) {
            errors.username = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.username = "Only letters, numbers, and underscores allowed";
        } else if (username.length > 20) {
            errors.username = "Username must be 20 characters or less";
        } else {
            // Check uniqueness (case-insensitive), excluding current user
            const existing = await prisma.user.findFirst({
                where: {
                    username: { equals: username, mode: "insensitive" },
                    NOT: { email: session.user.email },
                },
            });
            if (existing) {
                errors.username = "Username is already taken";
            }
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        const updateData: any = {
            name: displayName,
            username: username.toLowerCase(),
            role: role,
            bio: bio,
            skills: skills,
        };
        if (typeof openToCollab === "boolean") {
            updateData.openToCollab = openToCollab;
        }

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                posts: { orderBy: { createdAt: "desc" }, take: 10 },
                projects: { orderBy: { createdAt: "desc" }, take: 10 },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
