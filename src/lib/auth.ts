import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // On initial sign-in, `user` only has id/name/email/image from the adapter.
            // We need to fetch the full user from the DB to get custom fields.
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                });
                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                    token.impactXP = dbUser.impactXP;
                }
            }

            // When the session is explicitly updated (e.g. after profile completion)
            if (trigger === "update" && session) {
                if (session.role) token.role = session.role;
                if (session.impactXP !== undefined) token.impactXP = session.impactXP;
                if (session.name) token.name = session.name;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.impactXP = token.impactXP;
            }
            return session;
        },
    },
    pages: {
        signIn: "/onboarding",
        newUser: "/onboarding",
    },
};
