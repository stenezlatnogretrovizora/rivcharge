import NextAuth, { type Account, type NextAuthOptions, type Profile, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "~/utils/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials');
}

interface ExtendedToken extends JWT {
  accessToken?: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }: {
      token: ExtendedToken,
      account: Account | null,
      profile?: Profile | undefined
    }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = account.userId
        token.email = profile?.email
      }
      return token
    },
    session({ session, user }: { session: Session, user: User }) {
      session.user = user;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
};

export default NextAuth(authOptions);
