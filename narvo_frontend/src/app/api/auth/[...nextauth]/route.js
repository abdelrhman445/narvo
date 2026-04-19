import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    /**
     * Called after a successful Google sign-in.
     * Sends the Google ID Token to our backend and saves the app JWT.
     */
    async signIn({ account }) {
      if (account?.provider === 'google' && account?.id_token) {
        try {
          const response = await axios.post(`${API_URL}/auth/google/callback`, {
            idToken: account.id_token,
          });

          // Store backend token for use in the jwt callback
          account.backendToken = response.data.token;
          account.backendUser = response.data.user;
          return true;
        } catch (error) {
          console.error('Backend auth failed:', error.message);
          return false;
        }
      }
      return true;
    },

    /**
     * JWT callback — runs whenever a JWT is created or updated.
     * We store our backend token here.
     */
    async jwt({ token, account }) {
      if (account?.backendToken) {
        token.backendToken = account.backendToken;
        token.backendUser = account.backendUser;
      }
      return token;
    },

    /**
     * Session callback — exposes data to the client via useSession().
     */
    async session({ session, token }) {
      session.backendToken = token.backendToken;
      session.user.backendId = token.backendUser?.id;
      return session;
    },
  },

  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
