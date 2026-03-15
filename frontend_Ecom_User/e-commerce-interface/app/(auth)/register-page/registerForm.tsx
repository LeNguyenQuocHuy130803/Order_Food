'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { schemaRegister, type RegisterFormData } from './register.schema'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa'
import { registerUser } from '@/service/RegisterService'

export default function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schemaRegister),
    defaultValues: {
      email: '',
      userName: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      agreeTerms: false,
    },
  })

  const onSubmit = async (values: RegisterFormData) => {
    try {
      setLoading(true)
      setError(null)

      await registerUser({
        email: values.email,
        userName: values.userName,
        password: values.password,
        phoneNumber: values.phoneNumber,
      })

      setSuccess(true)

      setTimeout(() => {
        router.push('/dashboard-employers')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign Up</h1>
          <p className="text-gray-600">
            Create an account to start shopping
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium text-center">
                ✓ Registration successful! Redirecting...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium text-center text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              disabled={loading}
              {...register('email')}
              className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white text-black ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[#ff5528]'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              disabled={loading}
              {...register('userName')}
              className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white text-black ${
                errors.userName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[#ff5528]'
              }`}
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.userName.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="0912345678"
              disabled={loading}
              {...register('phoneNumber')}
              className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white text-black ${
                errors.phoneNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[#ff5528]'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                disabled={loading}
                {...register('password')}
                className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white text-black ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#ff5528]'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}

            <p className="mt-1 text-xs text-gray-500">
              Must contain uppercase, lowercase and numbers
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                disabled={loading}
                {...register('confirmPassword')}
                className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white text-black ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#ff5528]'
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
              >
                {showConfirmPassword ? (
                  <FaEye size={18} />
                ) : (
                  <FaEyeSlash size={18} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-center text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="w-4 h-4 text-[#ff5528] rounded cursor-pointer"
              />
              <span className="ml-2 text-sm">
                I agree to the{' '}
                <a href="#" className="text-[#ff5528] hover:text-[#e64a22]">
                  terms of service
                </a>
              </span>
            </label>

            {errors.agreeTerms && (
              <p className="mt-1 text-sm text-red-600">
                {errors.agreeTerms.message}
              </p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#ff5528] hover:bg-[#e64a22] text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl mt-6"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing up...</span>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Social login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <button className="w-full bg-white border border-gray-300 hover:border-[#ff5528] hover:bg-orange-50 text-gray-700 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
              <FaGoogle className="w-5 h-5 text-[#4285F4]" />
              <span className="text-sm">Google</span>
            </button>

            <button className="w-full bg-white border border-gray-300 hover:border-gray-700 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
              <FaGithub className="w-5 h-5 text-gray-800" />
              <span className="text-sm">GitHub</span>
            </button>
          </div>
        </div>

        {/* Login */}
        <div className="mt-6 text-center border-t border-gray-200 pt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a
              href="/login-page"
              className="text-[#ff5528] hover:text-[#e64a22] font-semibold"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>

      <p className="text-center text-gray-600 text-sm mt-6">
        © 2026 E-commerce Store. Security guaranteed.
      </p>
    </div>
  )
}