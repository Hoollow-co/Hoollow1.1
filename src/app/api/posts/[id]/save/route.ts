import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Toggle save/unsave a post
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const postId = params.id;

        // Check if already saved
        const existing = await (prisma as any).savedPost.findUnique({
            where: {
                postId_userId: { postId, userId: session.user.id },
            },
        });

        if (existing) {
            // Unsave
            await (prisma as any).savedPost.delete({
                where: { id: existing.id },
            });
            return NextResponse.json({ saved: false });
        } else {
            // Save
            await (prisma as any).savedPost.create({
                data: { postId, userId: session.user.id },
            });
            return NextResponse.json({ saved: true });
        }
    } catch (error) {
        console.error("Save toggle error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
