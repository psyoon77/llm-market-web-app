import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: { username: credentials.username },
        });

        if (!user || !user.password) {
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.password);

        if (!valid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name || user.username || user.email || "User",
          email: user.email || null,
          role: user.role,
          username: user.username || null,
        } as any;
      },
    }),

  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // credentials login: user object already contains the local DB identity
      if (account?.provider === "credentials" && user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.username = (user as any).username ?? null;
        token.email = user.email ?? null;
        return token;
      }

      // google login or later refreshes: keep email if present
      if (user?.email) {
        token.email = user.email;
      }

      // try email first
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (dbUser) {
          token.id = String(dbUser.id);
          token.role = dbUser.role;
          token.username = dbUser.username || null;
          return token;
        }
      }

      // fallback for local username/password users without email
      if ((token as any).username) {
        const dbUser = await prisma.user.findUnique({
          where: { username: (token as any).username },
        });

        if (dbUser) {
          token.id = String(dbUser.id);
          token.role = dbUser.role;
          token.username = dbUser.username || null;
          token.email = dbUser.email || null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
