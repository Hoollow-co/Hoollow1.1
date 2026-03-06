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

        const projectId = params.id;

        // Simple toggle: increment/decrement the upvotes count on project
        // We store the vote state in a cookie/client since Project doesn't have a join table for upvotes
        const project = await prisma.project.update({
            where: { id: projectId },
            data: { upvotes: { increment: 1 } },
        });

        // Award +2 XP to project author
        if (project.authorId !== session.user.id) {
            await prisma.user.update({
                where: { id: project.authorId },
                data: { impactXP: { increment: 2 } },
            });
        }

        return NextResponse.json({ upvotes: project.upvotes });
    } catch (error) {
        console.error("Project upvote error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
