import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { SchemaLogin, type LoginFormData } from './login.schema'
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(SchemaLogin),
  })

  const onSubmit = async (values: LoginFormData) => {
    try {
      setLoading(true)
      setError(null)

      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      // ✅ Check if error occurred
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard-employers')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Login failed, please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * để sau xử lí với login gg
   * const handleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;

      const res = await signIn("credentials", {
        credential: credential,
        redirect: false,
      });

      if (!res?.error) {
        setMessageState({
          type: "success",
          content: "Google login successful!",
        });
        // useEffect sẽ xử lý redirect
      } else {
        setMessageState({ type: "error", content: res.error });
      }
    } catch (error: any) {
      setMessageState({
        type: "error",
        content: error?.message || "Google login failed. Please try again.",
      });
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };
   */
  return (
    <div className="w-full max-w-md">
      {/* Card Container */}
      <div className="bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">
            Welcome back to our store!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium text-center">
                ✓ Login successful! Redirecting...
              </p>
            </div>
          )}

          {/* Server Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium text-center">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              disabled={loading}
              {...register('email')}
              className={`w-full px-4 py-3 bg-gray-50  text-black border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed ${errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                disabled={loading}
                {...register('password')}
                className={`w-full px-4 py-3  bg-gray-50 text-black border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed ${errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
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
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-500 rounded cursor-pointer"
              />
              <span className="ml-2">Remember Me</span>
            </label>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Google Login */}
            <button
              type="button"
              disabled={loading || success}
              onClick={() => console.log('Google login')}
              className="w-full bg-white border border-gray-300 hover:border-[#4285F4] hover:bg-blue-50 text-gray-700 font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <FaGoogle className="w-5 h-5 text-[#4285F4]" />
              Google
            </button>

            {/* GitHub Login */}
            <button
              type="button"
              disabled={loading || success}
              onClick={() => console.log('GitHub login')}
              className="w-full bg-white border border-gray-300 hover:border-gray-700 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <FaGithub className="w-5 h-5 text-gray-800" />
              GitHub
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center border-t border-gray-200 pt-6">
          <p className="text-gray-600">
            Don't have an account yet?{' '}
            <a
              href="/register-page"
              className="text-blue-600 hover:text-blue-800 font-semibold transition"
            >
              Register now
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-600 text-sm mt-6">
        © 2026 E-commerce Store. Security guaranteed.
      </p>
    </div>
  )
}