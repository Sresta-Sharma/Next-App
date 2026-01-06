import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/oauth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              oauth_id: account.providerAccountId,
              avatar: user.image,
            }),
          });

          if (!response.ok) return false;
          return true;
        } catch (error) {
          console.error("OAuth error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Only store minimal data
      if (account?.provider === "google") {
        token.isOAuth = true;
        token.provider = "google";
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).isOAuth = token.isOAuth;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
