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

        const postId = params.id;
        const userId = session.user.id;

        const existing = await prisma.upvote.findUnique({
            where: { postId_userId: { postId, userId } },
        });

        if (existing) {
            await prisma.upvote.delete({ where: { id: existing.id } });
            // Remove XP from post author
            const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
            if (post && post.authorId !== userId) {
                await prisma.user.update({ where: { id: post.authorId }, data: { impactXP: { decrement: 2 } } });
            }
            return NextResponse.json({ upvoted: false });
        } else {
            await prisma.upvote.create({ data: { postId, userId } });
            // Award +2 XP to post author
            const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true, title: true } });
            if (post && post.authorId !== userId) {
                await prisma.user.update({ where: { id: post.authorId }, data: { impactXP: { increment: 2 } } });
                // Create notification
                const voter = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
                await (prisma as any).notification.create({
                    data: {
                        type: "upvote",
                        message: `${voter?.name || "Someone"} upvoted your post "${post.title?.substring(0, 30) || "Untitled"}"`,
                        userId: post.authorId,
                        relatedId: postId,
                    },
                });
            }
            return NextResponse.json({ upvoted: true });
        }
    } catch (error) {
        console.error("Upvote error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
