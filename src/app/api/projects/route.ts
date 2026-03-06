import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { id: true, name: true, image: true, role: true, impactXP: true },
                },
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Projects fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, tags, xpThreshold, githubUrl, imageUrl, openToCollab } = await req.json();

        if (!name || !description) {
            return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                tags: tags || [],
                xpThreshold: xpThreshold || 0,
                githubUrl: githubUrl || null,
                imageUrl: imageUrl || null,
                openToCollab: openToCollab || false,
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                authorId: session.user.id,
            },
            include: {
                author: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
            },
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: { impactXP: { increment: 10 } },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Project creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name, description, tags, githubUrl, imageUrl, openToCollab } = await req.json();
        if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        const existing = await prisma.project.findUnique({ where: { id }, select: { authorId: true } });
        if (!existing || existing.authorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (tags !== undefined) updateData.tags = tags;
        if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (openToCollab !== undefined) updateData.openToCollab = openToCollab;

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
            include: {
                author: { select: { id: true, name: true, image: true, role: true, impactXP: true } },
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Project edit error:", error);
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
        if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        const existing = await prisma.project.findUnique({ where: { id }, select: { authorId: true } });
        if (!existing || existing.authorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.project.delete({ where: { id } });
        return NextResponse.json({ deleted: true });
    } catch (error) {
        console.error("Project delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
