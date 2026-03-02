'use client'

import { Suspense } from 'react'
import RegisterForm from './registerForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
