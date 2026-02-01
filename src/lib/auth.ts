import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    session({ session, user }) {
      const allowedEmail = process.env.ALLOWED_EMAIL;
      session.user.id = user.id;
      session.user.isAdmin = allowedEmail ? user.email === allowedEmail : false;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
});
