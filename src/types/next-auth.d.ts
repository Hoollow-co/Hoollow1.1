import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            impactXP: number;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: string;
        impactXP: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        role: string;
        impactXP: number;
    }
}
