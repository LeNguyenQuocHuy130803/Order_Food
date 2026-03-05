
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { API_URL } from '@/service/Constant';

interface UserType {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  // accessToken: string; 
  // refreshToken: string;
}
export const authOptions: NextAuthOptions = {
  debug : true,
    pages: {
    signIn: '/login-page',
  },
  providers: [
    //  login bình thường với email + password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        //  ✅ Gọi API Route /api/auth/login (không gọi backend trực tiếp)
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.message || 'Login failed')
          }

          return {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.username,
            roles: data.user.roles,
          } as UserType

        } catch (error: any) {
          console.error('❌ Authorize error:', error)
          throw new Error(error.message || 'Login failed')
        }
      },
    }),

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
  ],

  callbacks: {
    /**
     * JWT Callback
     * ✅ Nhận user từ authorize()
     * ✅ Lưu user info vào token (KHÔNG lưu backend token)
     * 
     * trigger:
     * - 'signIn': khi user đăng nhập
     * - 'update': khi session.update() được gọi
     */
    async jwt({ token, user, trigger, session }) {
      // Khi user đăng nhập lần đầu (authorize trả về user)
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.roles = (user as any).roles || []
      }

      // Nếu trigger là 'update' và có session mới
      if (trigger === 'update' && session) {
        token.name = session.user?.name ?? token.name
        token.roles = (session.user as any)?.roles ?? token.roles
      }

      return token
    },

    /**
     * Session Callback
     * ✅ Nhận token từ jwt()
     * ✅ Return session.user cho client
     * ❌ KHÔNG return token backend
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        // @ts-ignore
        session.user.roles = token.roles
      }
      return session
    },

    /**
     * SignIn Callback
     * ✅ Cho phép user đăng nhập
     */
    async signIn({ user, account, profile }) {
      // ✅ Cho phép OAuth users
      // Backend sẽ auto-create user nếu không tồn tại
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