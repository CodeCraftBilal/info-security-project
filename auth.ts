import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from '@/lib/mongodb';
import Resend from "next-auth/providers/resend";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Resend({
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise, { databaseName: 'secureShare' }),
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Fetch user to check for publicKey
      if (token.id && !token.hasPublicKey) {
        const client = await clientPromise;
        const db = client.db('secureShare');
        const dbUser = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(token.id as string) });
        if (dbUser) {
          token.hasPublicKey = !!dbUser.publicKey;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Expose the MongoDB user ID (_id) in the session
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.hasPublicKey = token.hasPublicKey as boolean;
      }
      return session;
    }
  }
});
