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

        // Award +1 XP for commenting
        await prisma.user.update({
            where: { id: session.user.id },
            data: { impactXP: { increment: 1 } },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Comment creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
