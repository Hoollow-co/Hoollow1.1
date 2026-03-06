import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { id: true, name: true, image: true, role: true, impactXP: true },
                },
                _count: { select: { upvotes: true, comments: true } },
                upvotes: userId ? { where: { userId }, select: { id: true } } : false,
            },
        });

        const formatted = posts.map((post) => ({
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
            createdAt: post.createdAt.toISOString(),
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Posts fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, body, tags, isProject, imageUrl, openToCollab } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                title,
                body,
                tags: tags || [],
                isProject: isProject || false,
                imageUrl: imageUrl || null,
                openToCollab: openToCollab || false,
                authorId: session.user.id,
            },
            include: {
                author: {
                    select: { id: true, name: true, image: true, role: true, impactXP: true },
                },
            },
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: { impactXP: { increment: 5 } },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Post creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, title, body, tags, imageUrl, openToCollab } = await req.json();
        if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

        const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
        if (!existing || existing.authorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (body !== undefined) updateData.body = body;
        if (tags !== undefined) updateData.tags = tags;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (openToCollab !== undefined) updateData.openToCollab = openToCollab;

        const post = await prisma.post.update({
            where: { id },
            data: updateData,
            include: {
                author: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Post edit error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

        const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
        if (!existing || existing.authorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.post.delete({ where: { id } });
        return NextResponse.json({ deleted: true });
    } catch (error) {
        console.error("Post delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
