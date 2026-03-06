import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ hasSubscription: false });
        }

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: "active",
                expiresAt: { gt: new Date() },
            },
        });

        return NextResponse.json({ hasSubscription: !!subscription });
    } catch (error) {
        console.error("Subscription check error:", error);
        return NextResponse.json({ hasSubscription: false });
    }
}
