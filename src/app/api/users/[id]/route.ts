import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        // First try with clubMembers (if schema has been pushed)
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { id: params.id },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                    impactXP: true,
                    bio: true,
                    skills: true,
                    openToCollab: true,
                    createdAt: true,
                    posts: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                        include: {
                            _count: { select: { upvotes: true, comments: true } },
                            author: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
                        },
                    },
                    projects: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                        include: {
                            author: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
                        },
                    },
                    clubMembers: {
                        include: {
                            club: {
                                include: { _count: { select: { members: true } } },
                            },
                        },
                    },
                },
            });
        } catch {
            // Fallback without clubMembers if table doesn't exist yet
            user = await prisma.user.findUnique({
                where: { id: params.id },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                    impactXP: true,
                    bio: true,
                    skills: true,
                    openToCollab: true,
                    createdAt: true,
                    posts: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                        include: {
                            _count: { select: { upvotes: true, comments: true } },
                            author: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
                        },
                    },
                    projects: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                        include: {
                            author: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
                        },
                    },
                },
            });
            if (user) {
                (user as any).clubMembers = [];
            }
        }

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("User profile fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
