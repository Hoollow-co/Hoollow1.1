import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId: params.id },
            orderBy: { createdAt: "asc" },
            include: {
                author: {
                    select: { id: true, name: true, image: true, role: true, impactXP: true },
                },
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Comments fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                text,
                postId: params.id,
                authorId: session.user.id,
            },
            include: {
                author: {
                    select: { id: true, name: true, image: true, role: true, impactXP: true },
                },
            },
        });

        // Award +1 XP to post author for receiving a comment
        const post = await prisma.post.findUnique({ where: { id: params.id }, select: { authorId: true, title: true } });
        if (post && post.authorId !== session.user.id) {
            await prisma.user.update({
                where: { id: post.authorId },
                data: { impactXP: { increment: 1 } },
            });
            // Notify the post author
            const commenter = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
            await (prisma as any).notification.create({
                data: {
                    type: "comment",
                    message: `${commenter?.name || "Someone"} commented on your post "${post.title?.substring(0, 30) || "Untitled"}"`,
                    userId: post.authorId,
                    relatedId: params.id,
                },
            });
        }

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Comment creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
