'use client'

import Link from 'next/link'
import { ForgotPasswordForm } from '@/app/components/ForgotPasswordForm'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen py-12 mt-20">
        <div className="max-w-md mx-auto px-4">
          {/* Back to Login Link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#ff5528] hover:text-orange-600 font-semibold mb-8"
          >
            ← Back to Login
          </Link>

          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <ForgotPasswordForm
              onSuccess={(message) => {
                console.log('✅', message)
              }}
            />
          </div>

          {/* Footer Links */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#ff5528] hover:text-orange-600 font-semibold">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
