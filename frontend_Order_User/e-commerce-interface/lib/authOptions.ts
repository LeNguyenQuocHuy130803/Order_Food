
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'

/**
 * 🔐 NextAuth Configuration - OAuth ONLY
 * 
 * ⚠️ Email + Password login:
 * KHÔNG dùng file này, dùng:
 * ✅ /service/authService.ts → /api/auth/login/route.ts → Backend
 * 
 * OAuth login (Google, GitHub):
 * ✅ Dùng file này → NextAuth callbacks → JWT session
 */

interface UserType {
  id: string;
  email: string;
  name: string;
  roles?: string[];
}

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    /**
     * Google OAuth Provider
     */
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),

    /**
     * GitHub OAuth Provider
     */
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    /**
   * facebook OAuth Provider
   */
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || '',
      clientSecret: process.env.FACEBOOK_SECRET || '',
    }),
  ],


  callbacks: {
    /**
     * JWT Callback - Lưu user info vào token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },

    /**
     * Session Callback - Return session cho client
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },

    /**
     * SignIn Callback - Cho phép OAuth users đăng nhập
     */
    async signIn() {
      return true
    },
  },


  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
}

declare module "next-auth" {
  interface User extends UserType {}
}

declare module "next-auth" {
  interface Session {
    user: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserType {}
}