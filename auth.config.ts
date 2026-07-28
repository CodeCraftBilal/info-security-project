import type { NextAuthConfig } from 'next-auth';
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Resend({
      from: process.env.EMAIL_FROM,
    })
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = ['/dashboard', '/share'];
      
      const isProtectedRoute = protectedRoutes.some(path => nextUrl.pathname.startsWith(path));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
