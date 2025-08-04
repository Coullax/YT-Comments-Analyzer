import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials in environment variables')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: "1039206039434-nv7a7h1fe3uldtt836edeu9u2b0jvmrj.apps.googleusercontent.com",
      clientSecret: "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",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Always return true to allow sign in
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        
        // Check and create subscription after user is created
        try {
          const existingSubscription = await prisma.subscription.findUnique({
            where: { userId: user.id }
          })

          if (!existingSubscription) {
            await prisma.subscription.create({
              data: {
                userId: user.id,
                status: 'active',
                plan: 'free',
              }
            })
          }
        } catch (error) {
          console.error('Error handling subscription:', error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin"
  },
}