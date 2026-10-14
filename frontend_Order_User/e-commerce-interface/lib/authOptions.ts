import type { NextAuthOptions, DefaultSession, DefaultUser } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import { log } from 'console'

/**
 * 🔐 NextAuth Configuration - OAuth ONLY
 * 
 * ⚠️ Email + Password login:
 * KHÔNG dùng file này, dùng:
 * ✅ /service/authService.ts → /api/auth/login/route.ts → Backend
 * 
 * OAuth login (Google, Facebook, GitHub):
 * ✅ Dùng file này → NextAuth callbacks → Đồng bộ với Spring Boot Backend → JWT session
 */

interface UserType {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  avatar?: string;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    /**
     * Google OAuth Provider
     */
    GoogleProvider({
      // Hỗ trợ tên biến cũ trong .env.local nhưng ưu tiên tên chuẩn mới.
      // Tuyệt đối không log client secret ra terminal.
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET || '',
    }),
    

    
    /**
     * Facebook OAuth Provider
     */
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_SECRET || process.env.FACEBOOK_CLIENT_SECRET || '',
    }),

    /**
     * GitHub OAuth Provider
     */
    GitHubProvider({
      clientId: process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    /**
     * JWT Callback - Gọi Spring Boot Backend tạo/lấy User & Token hệ thống
     */
    async jwt({ token, user, account }) {
      if (user && account) {
        console.log(`🚀 [NextAuth] Authenticated via ${account.provider}:`, user.email);
        try {
          // Gọi Spring Boot Backend để lưu user hoặc lấy token
          const res = await fetch(`${BACKEND_API_URL}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              avatar: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            console.log(`✅ [NextAuth] Backend social-login success for user ID:`, data.id);
            token.id = String(data.id);
            token.email = data.email;
            token.name = data.username;
            token.roles = data.roles;
            token.avatar = data.avatar;
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken;
          } else {
            console.error(`❌ [NextAuth] Backend social-login failed with status:`, res.status);
          }
        } catch (err) {
          console.error(`❌ [NextAuth] Error syncing social login with backend:`, err);
        }
      }
      return token;
    },

    /**
     * Session Callback - Trả session cho client
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (session.user as UserType).id;
        session.user.email = (token.email as string) || session.user.email || '';
        session.user.name = (token.name as string) || session.user.name || '';
        session.user.roles = token.roles as string[];
        session.user.avatar = (token.avatar as string) || (token.picture as string) || '';
      }
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },

    /**
     * SignIn Callback - Cho phép OAuth users đăng nhập
     */
    async signIn() {
      return true;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// console.log("giá trị của google client id " + process.env.GOOGLE_CLIENT_ID);


declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: UserType & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    roles?: string[];
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    roles?: string[];
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
