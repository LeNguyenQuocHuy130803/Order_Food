'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Key } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { requestPasswordReset, resetPassword } from '@/service/userService'

// Step 1: Email validation
const step1Schema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
})

// Step 2: Reset password validation
const step2Schema = z.object({
  email: z.string().email(),
  otp: z.string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be 6 digits'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const {
    register: register1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: user?.email || '',
    },
  })

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    reset: resetForm2,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
    },
  })

  // Update form2 when email changes
  useEffect(() => {
    resetForm2({
      email,
      otp: '',
      newPassword: '',
    })
  }, [email, resetForm2])

  // Handle Step 1: Request OTP
  const handleStep1Submit = async (data: Step1Data) => {
    setError(undefined)
    setIsLoading(true)

    try {
      await requestPasswordReset(data.email)
      setEmail(data.email)
      setSuccessMessage(`OTP sent to ${data.email}. Check your inbox.`)
      setResendCountdown(60)
      
      // Auto-advance to step 2 after 2 seconds
      setTimeout(() => {
        setStep(2)
        setSuccessMessage('')
      }, 2000)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send OTP'
      setError(errorMsg)
      console.error('Error requesting password reset:', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Step 2: Reset Password with OTP
  const handleStep2Submit = async (data: Step2Data) => {
    setError(undefined)
    setIsLoading(true)

    try {
      await resetPassword(data.email, data.otp, data.newPassword)
      setSuccessMessage('✅ Password changed successfully!')
      onSuccess?.()
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setStep(1)
        setEmail('')
        setSuccessMessage('')
      }, 2000)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to change password'
      setError(errorMsg)
      console.error('Error changing password:', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP countdown
  const handleResendOTP = async () => {
    setError(undefined)
    setIsLoading(true)

    try {
      await requestPasswordReset(email)
      setSuccessMessage('OTP resent successfully!')
      setResendCountdown(60)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to resend OTP'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Timer for resend countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0d0d0d] mb-2">Change Your Password</h2>
        <p className="text-gray-600">
          {step === 1
            ? 'Enter your email address to receive an OTP code'
            : 'Enter the OTP code and your new password'}
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Step 1: Enter Email */}
      {step === 1 && (
        <form onSubmit={handleSubmit1(handleStep1Submit)} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-[#0d0d0d] block mb-2">
              <Mail className="inline mr-2" size={18} />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-[#0d0d0d] placeholder-gray-400 ${
                errors1.email
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-[#ff5528] bg-white'
              }`}
              {...register1('email')}
              disabled={isLoading}
            />
            {errors1.email && (
              <p className="text-red-600 text-xs mt-1 font-semibold">{errors1.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-[#ff5528] text-white rounded-lg hover:bg-orange-600 active:scale-95 transition-all font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}

      {/* Step 2: Enter OTP & New Password */}
      {step === 2 && (
        <form onSubmit={handleSubmit2(handleStep2Submit)} className="space-y-6">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-[#ff5528] hover:text-orange-600 font-semibold text-sm mb-4"
          >
            <ArrowLeft size={18} />
            Back to Email
          </button>

          {/* Email (Read-only) */}
          <div>
            <label className="text-sm font-bold text-[#0d0d0d] block mb-2">
              <Mail className="inline mr-2" size={18} />
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* OTP Input */}
          <div>
            <label className="text-sm font-bold text-[#0d0d0d] block mb-2">
              <Key className="inline mr-2" size={18} />
              OTP Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-[#0d0d0d] placeholder-gray-400 font-mono text-2xl text-center tracking-widest ${
                errors2.otp
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-[#ff5528] bg-white'
              }`}
              {...register2('otp')}
              disabled={isLoading}
            />
            {errors2.otp && (
              <p className="text-red-600 text-xs mt-1 font-semibold">{errors2.otp.message}</p>
            )}
            
            {/* Resend OTP */}
            <div className="mt-3">
              {resendCountdown > 0 ? (
                <p className="text-gray-600 text-xs">
                  Resend OTP in <span className="font-bold text-[#ff5528]">{resendCountdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-[#ff5528] hover:text-orange-600 font-semibold text-xs disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm font-bold text-[#0d0d0d] block mb-2">
              <Lock className="inline mr-2" size={18} />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className={`w-full px-4 py-3 pr-10 border-2 rounded-lg focus:outline-none transition-colors text-[#0d0d0d] placeholder-gray-400 ${
                  errors2.newPassword
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-[#ff5528] bg-white'
                }`}
                {...register2('newPassword')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-[#ff5528] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors2.newPassword ? (
              <p className="text-red-600 text-xs mt-1 font-semibold">{errors2.newPassword.message}</p>
            ) : (
              <p className="text-xs text-gray-600 mt-2 font-semibold">
                Requirements: • Min 8 characters • 1 uppercase • 1 lowercase • 1 number
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-[#ff5528] text-white rounded-lg hover:bg-orange-600 active:scale-95 transition-all font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  )
}
