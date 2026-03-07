import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch a single post by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const post = await prisma.post.findUnique({
            where: { id: params.id },
            include: {
                author: {
                    select: { id: true, name: true, image: true, role: true, impactXP: true },
                },
                _count: { select: { upvotes: true, comments: true } },
                upvotes: userId ? { where: { userId }, select: { id: true } } : false,
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Check if saved
        let isSaved = false;
        if (userId) {
            const savedPost = await (prisma as any).savedPost.findUnique({
                where: { postId_userId: { postId: post.id, userId } },
            });
            isSaved = !!savedPost;
        }

        const formatted = {
            id: post.id,
            title: post.title,
            body: post.body,
            tags: post.tags,
            isProject: post.isProject,
            imageUrl: (post as any).imageUrl || null,
            openToCollab: (post as any).openToCollab || false,
            author: post.author,
            authorId: post.authorId,
            upvotes: post._count.upvotes,
            commentCount: post._count.comments,
            hasUpvoted: userId ? post.upvotes.length > 0 : false,
            isSaved,
            createdAt: post.createdAt.toISOString(),
        };

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Single post fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
