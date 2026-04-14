'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UserDetail } from '@/types/user'

// ✅ Schema validation với Zod
const profileSchema = z.object({
  userName: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional().refine((val) => !val || val.length >= 10, {
    message: 'Phone number must be at least 10 characters',
  }),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditFormProps {
  profile: UserDetail
  onSubmit: (data: ProfileFormData, avatar?: File) => Promise<void>
  isLoading?: boolean
  error?: string | null
  onCancel: () => void
}

export function ProfileEditForm({
  profile,
  onSubmit,
  isLoading = false,
  error = null,
  onCancel,
}: ProfileEditFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userName: profile.userName,
      email: profile.email,
      phoneNumber: profile.phoneNumber || '',
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = async (data: ProfileFormData) => {
    await onSubmit(data, avatarFile || undefined)
  }

  const handleCancel = () => {
    reset()
    setAvatarFile(null)
    setAvatarPreview('')
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Avatar Upload */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-2">Avatar</label>
        <div className="flex gap-6">
          {/* Preview */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-[#ff5528] shrink-0">
            <Image
              src={
                avatarPreview || profile.avatar || '/image/avatarNull/avatarNull.jpg'
              }
              alt="Avatar Preview"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Upload Input */}
          <div className="flex flex-col justify-center flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#ff5528] file:text-white hover:file:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
            {avatarFile && (
              <p className="text-xs text-green-600 mt-1">✅ {avatarFile.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Username *
        </label>
        <input
          type="text"
          {...register('userName')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] text-[#0d0d0d] disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter username"
          disabled={isLoading}
        />
        {errors.userName && (
          <p className="text-red-600 text-sm mt-1">⚠️ {errors.userName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Email *
        </label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 border  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] text-[#0d0d0d] disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter email"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">⚠️ {errors.email.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          {...register('phoneNumber')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5528] text-[#0d0d0d] disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter phone number"
          disabled={isLoading}
        />
        {errors.phoneNumber && (
          <p className="text-red-600 text-sm mt-1">⚠️ {errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Member Since (Read-only) */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Member Since
        </label>
        <div className="px-4 py-3 bg-gray-200 rounded-lg border border-gray-200 text-[#0d0d0d]">
          {profile.createdAt
            ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Not available'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-[#ff5528] text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-[#0d0d0d] font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
