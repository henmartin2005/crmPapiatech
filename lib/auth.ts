import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma), // Adapter is optional for Credentials provider, but useful if we add OAuth.
    // We will add it but be careful with Credentials provider which doesn't persist to DB by default.

    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "hello@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("NextAuth Authorize attempt for:", credentials?.email);
                if (!credentials?.email || !credentials.password) {
                    console.log("NextAuth Authorize: Missing credentials");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.password) {
                    console.log("NextAuth Authorize: User not found or no password");
                    return null;
                }

                console.log("NextAuth Authorize: Comparing passwords...");
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    console.log("NextAuth Authorize: Invalid password");
                    return null;
                }

                console.log("NextAuth Authorize: Success for user ID:", user.id);
                return {
                    id: user.id + "",
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
        // OAUTH Providers (Placeholders for now, env vars needed later)
        // GoogleProvider({
        //   clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        // }),
    ],
    callbacks: {
        session: ({ session, token }) => {
            console.log("NextAuth Callback: Session called", { token: !!token });
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                },
            };
        },
        jwt: ({ token, user }) => {
            console.log("NextAuth Callback: JWT called", { hasUser: !!user });
            if (user) {
                const u = user as unknown as any;
                return {
                    ...token,
                    id: u.id,
                    role: u.role,
                };
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
};
