import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  debug: true, // Enable debug logs
  callbacks: {
    async jwt({ token, account, profile }) {
      
      if (account) {
        try {
          // Make sure we have the tokens
          if (!account.id_token) {
            console.error("No ID token available in account");
            throw new Error("No ID token available");
          }

          const response = await fetch("http://localhost:8000/api/auth/google/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_token: account.id_token,
              access_token: account.access_token,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.error || "Failed to authenticate with backend");
          }

          token.accessToken = responseData.access_token;
          token.refreshToken = responseData.refresh_token;
          token.userProfile = responseData.user;
        } catch (error) {
          console.error("Token exchange error:", error);
          throw error;
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.user = {
          ...session.user,
          ...token.userProfile,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
});

export { handler as GET, handler as POST };