import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Áp dụng middleware cho dashboard, admin và login
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
  ],
};

