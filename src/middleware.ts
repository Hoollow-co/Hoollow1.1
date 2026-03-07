import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/onboarding",
    },
});

export const config = {
    matcher: [
        "/feed/:path*",
        "/launchpad/:path*",
        "/clubs/:path*",
        "/super/:path*",
        "/profile/:path*",
        "/collab/:path*",
        "/saved/:path*",
        "/messages/:path*",
    ],
};
