import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js imports, no Prisma.
// Used by the middleware for JWT verification only.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    newUser: "/dashboard",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAppPage =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/workspace") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/billing");
      const isAuthPage =
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/forgot-password");

      if (isAppPage && !loggedIn) return false; // NextAuth redirects to pages.signIn
      if (isAuthPage && loggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
      return true;
    },
  },
};
