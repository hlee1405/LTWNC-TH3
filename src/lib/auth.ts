import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { getUserByEmail } from "./data";
import type { Role } from "@/types/deadline";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "mock_github_id",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "mock_github_secret",
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.login,
          email: profile.email || `${profile.login}@github.com`,
          image: profile.avatar_url,
          role: "user" as Role,
        };
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim();
        const password = String(credentials.password);

        const user = await getUserByEmail(email);
        if (!user) {
          return null;
        }

        // Compare using bcrypt or raw password fallback
        let isValid = false;
        try {
          isValid = bcrypt.compareSync(password, user.password);
        } catch {
          isValid = false;
        }

        // Fallback for raw password check if defined in users.json
        const anyUser = user as unknown as { rawPassword?: string };
        if (!isValid && anyUser.rawPassword && anyUser.rawPassword === password) {
          isValid = true;
        }

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

