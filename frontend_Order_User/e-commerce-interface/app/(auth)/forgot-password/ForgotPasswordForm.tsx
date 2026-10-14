'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { handle_forgotPassWord, resetPassword } from '@/service/userService'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không đúng định dạng'),
  otp: z.string().length(6, 'OTP phải đủ 6 ký tự').optional().or(z.literal('')),
  newPassword: z.string().min(8, 'Mật khẩu ít nhất 8 ký tự').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => !data.otp || data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({ onSuccess }: { onSuccess?: (msg: string) => void }) {
  const router = useRouter()
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '', otp: '', newPassword: '', confirmPassword: '' }
  })

  const currentEmail = watch('email')  // watch Là một hàm của useForm. Nó sẽ lắng nghe mọi thay đổi của input. Mỗi khi người dùng gõ một phím vào ô Email, biến currentEmail sẽ lập tức được cập nhật giá trị mới nhất. Điều này rất hữu ích để chúng ta có thể sử dụng giá trị email mới nhất khi cần thiết, ví dụ như khi gửi lại OTP. Nếu không có watch, chúng ta sẽ không biết được email hiện tại là gì sau khi người dùng đã thay đổi nó. 

  // Đếm ngược gửi lại mã
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      if (!isOtpSent) {
        // bước 1 : gọi api forgot password để Gửi OTP đến email
        await handle_forgotPassWord(data.email)
        toast.success(`OTP đã gửi đến ${data.email}`)
        setIsOtpSent(true)
        setResendCountdown(60)
      } else {
        // bước 2 : gọi api reset password để đặt lại mật khẩu
        await resetPassword(data.email, data.otp!, data.newPassword!)
        toast.success('Đổi mật khẩu thành công!')
        onSuccess?.('Thành công!')
        setTimeout(() => router.push('/login-page'), 2000)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-[#0d0d0d] uppercase tracking-tighter">Reset Password</h2>
        <p className="text-gray-500 font-medium">{!isOtpSent ? 'Nhập email để nhận mã' : 'Nhập mã và mật khẩu mới'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AnimatePresence mode="wait">
          {!isOtpSent ? (
            <motion.div key="email-side" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input {...register('email')} type="email" placeholder="name@example.com" disabled={isLoading} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#ff5528] focus:bg-white outline-none transition-all font-bold" />
                </div>
                {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
              </div>
            </motion.div>
          ) : (
            <motion.div key="otp-side" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <button type="button" onClick={() => setIsOtpSent(false)} className="flex items-center gap-2 text-gray-400 hover:text-[#ff5528] font-black text-[10px] uppercase transition-colors mb-2"><ArrowLeft size={14} /> Thay đổi email</button>
              
              <div className="space-y-2">
                <input {...register('otp')} type="text" maxLength={6} placeholder="OTP" className="w-full py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#ff5528] focus:bg-white outline-none font-black text-3xl text-center tracking-[0.5em]" />
                <div className="text-center">
                   {resendCountdown > 0 ? <span className="text-[10px] text-gray-400 font-bold uppercase">Gửi lại sau {resendCountdown}s</span> : <button type="button" onClick={() => onSubmit({ email: currentEmail, otp: '', newPassword: '', confirmPassword: '' })} className="text-[#ff5528] font-black text-[10px] uppercase hover:underline">Gửi lại mã</button>}
                </div>
                {errors.otp && <p className="text-red-500 text-xs font-bold text-center">{errors.otp.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input {...register('newPassword')} type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu mới" className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#ff5528] focus:bg-white outline-none font-bold" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-xs font-bold">{errors.newPassword.message}</p>}
              </div>

              <input {...register('confirmPassword')} type="password" placeholder="Xác nhận mật khẩu" className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#ff5528] focus:bg-white outline-none font-bold" />
              {errors.confirmPassword && <p className="text-red-500 text-xs font-bold">{errors.confirmPassword.message}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#ff5528] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 active:scale-[0.98] transition-all flex justify-center">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isOtpSent ? 'Cập nhật mật khẩu' : 'Tiếp tục')}
        </button>
      </form>
    </div>
  )
}
