import NextAuth, { DefaultSession } from "next-auth";

// Extend the User type
declare module "next-auth" {
    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
    }

    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }
}

// Extend the JWT (used internally by NextAuth)
declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
    }
}
