import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/types/deadline";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user?.role as Role | undefined) ?? "user";
      const { pathname } = nextUrl;

      // 1. Tuyến đường Quản Trị (/admin): Bắt buộc đăng nhập VÀ role 'admin'
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          return false; // Tự động chuyển hướng về /login?callbackUrl=...
        }
        if (userRole !== "admin") {
          // Sinh viên (role 'user') cố vào /admin -> chuyển hướng về /403
          return Response.redirect(new URL("/403", nextUrl));
        }
        return true;
      }

      // 2. Tuyến đường Bảng Điều Khiển (/dashboard): Bắt buộc đăng nhập
      if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
          return false; // Tự động chuyển hướng về /login?callbackUrl=...
        }
        return true;
      }

      // 3. Nếu đã đăng nhập mà vào lại /login -> chuyển hướng về /dashboard
      if (pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) {
        token.role = (user.role as Role) || "user";
        token.id = user.id;
        if (user.name) {
          token.name = user.name.replace(/\s*\([^)]*\)/g, '').trim();
        }
      }
      return token;
    },

    session({ session, token }) {
      if (token && session.user) {
        session.user.role = (token.role as Role) || "user";
        session.user.id = (token.id as string) || "";
        if (session.user.name) {
          session.user.name = session.user.name.replace(/\s*\([^)]*\)/g, '').trim();
        }
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

