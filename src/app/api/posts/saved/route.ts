import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List saved posts for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const savedPosts = await (prisma as any).savedPost.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                post: {
                    include: {
                        author: {
                            select: { id: true, name: true, image: true, role: true, impactXP: true },
                        },
                        _count: { select: { upvotes: true, comments: true } },
                        upvotes: { where: { userId: session.user.id }, select: { id: true } },
                    },
                },
            },
        });

        const formatted = savedPosts.map((sp: any) => ({
            id: sp.post.id,
            title: sp.post.title,
            body: sp.post.body,
            tags: sp.post.tags,
            isProject: sp.post.isProject,
            imageUrl: sp.post.imageUrl || null,
            openToCollab: sp.post.openToCollab || false,
            author: sp.post.author,
            authorId: sp.post.authorId,
            upvotes: sp.post._count.upvotes,
            commentCount: sp.post._count.comments,
            hasUpvoted: sp.post.upvotes.length > 0,
            isSaved: true,
            createdAt: sp.post.createdAt.toISOString(),
            savedAt: sp.createdAt.toISOString(),
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Saved posts error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
