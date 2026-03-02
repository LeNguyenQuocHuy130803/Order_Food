'use client'
import { Suspense } from "react";
import LoginForm from "./loginForm";
export default function LoginPage() {


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
    </div>


  )
}