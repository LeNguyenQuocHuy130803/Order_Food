'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, ShoppingBag, MapPin, Settings, LogOut, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'
import { useUserDetail, useUpdateUserMutation } from '@/lib/api/queries'
import { ProfileEditForm } from './ProfileEditForm'
import { ChangePasswordForm } from './ChangePasswordForm'
import type { UserDetail } from '@/types/user'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [avatarRefresh, setAvatarRefresh] = useState(0)

  // ✅ React Query - Tự động fetch & cache user data
  const { data: profile, isLoading: isLoadingProfile, error: queryError } = useUserDetail(user?.id ?? 0)

  // ✅ React Query - Tự động update cache on success
  const { mutateAsync: updateUserMutation, isPending: isUpdatingProfile, error: updateError } = useUpdateUserMutation()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleUpdateProfile = async (formData: Partial<UserDetail>, avatar?: File) => {
    if (!user) return

    try {
      console.log(`📤 [AccountPage] Updating user profile with data:`, formData)
      await updateUserMutation({
        userId: user.id,
        data: formData,
        avatar,
      })
      setIsEditing(false)
      // ✅ Force re-render avatar by incrementing refresh key
      setAvatarRefresh(prev => prev + 1)
      console.log('✅ [AccountPage] User updated successfully')
    } catch (err: any) {
      console.error('❌ [AccountPage] Error updating profile:', err.message)
    }
  }



  if (loading || !user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center mt-20">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-[#ff5528] border-t-transparent rounded-full"></div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="text-[#ff5528] hover:text-[#0d0d0d]">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#0d0d0d] font-semibold">Account</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
                {/* Profile Card */}
                <div className="p-6 text-center border-b border-gray-200">
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 border-2 border-[#ff5528]">
                    <Image
                      key={`sidebar-avatar-${avatarRefresh}`}
                      src={`${profile?.avatar || user.avatar || '/image/avatarNull/avatarNull.jpg'}?v=${avatarRefresh}`}
                      alt={profile?.userName || user.userName || 'User Avatar'}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#0d0d0d]">{profile?.userName || user.userName}</h3>
                  <p className="text-xs text-gray-500">{profile?.email || user.email}</p>
                </div>

                {/* Menu Items */}
                <nav className="p-4 space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-[#ff5528] text-white'
                        : 'text-[#0d0d0d] hover:bg-gray-100'
                    }`}
                  >
                    <User size={20} />
                    Profile
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-[#ff5528] text-white'
                        : 'text-[#0d0d0d] hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag size={20} />
                    Orders
                  </button>

                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'addresses'
                        ? 'bg-[#ff5528] text-white'
                        : 'text-[#0d0d0d] hover:bg-gray-100'
                    }`}
                  >
                    <MapPin size={20} />
                    Addresses
                  </button>

                  <button
                    onClick={() => setActiveTab('changePassword')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'changePassword'
                        ? 'bg-[#ff5528] text-white'
                        : 'text-[#0d0d0d] hover:bg-gray-100'
                    }`}
                  >
                    <Edit size={20} />
                    Change Password
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-[#ff5528] text-white'
                        : 'text-[#0d0d0d] hover:bg-gray-100'
                    }`}
                  >
                    <Settings size={20} />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 mt-4 pt-4"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-8">
                {/* Loading State */}
                {isLoadingProfile && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin">
                      <div className="w-8 h-8 border-4 border-[#ff5528] border-t-transparent rounded-full"></div>
                    </div>
                  </div>
                )}

                {/* Query Error State */}
                {queryError && !isLoadingProfile && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">❌ {(queryError as any)?.message || 'Failed to load profile'}</p>
                  </div>
                )}

                {activeTab === 'profile' && profile && !isLoadingProfile && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-[#0d0d0d]">Profile Information</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-[#ff5528] text-[#ff5528] rounded-lg hover:bg-[#ff5528] hover:text-white transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdatingProfile}
                      >
                        <Edit size={18} />
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    {isEditing ? (
                      // ✅ Edit Mode - Using separate form component
                      <ProfileEditForm
                        profile={profile}
                        onSubmit={handleUpdateProfile}
                        isLoading={isUpdatingProfile}
                        error={updateError?.message}
                        onCancel={() => setIsEditing(false)}
                      />
                    ) : (
                      // View Mode
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div>
                          <label className="text-sm font-semibold text-gray-600 block mb-2">
                            Username
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                            {profile.userName}
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="text-sm font-semibold text-gray-600 block mb-2">
                            Email
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                            {profile.email}
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="text-sm font-semibold text-gray-600 block mb-2">
                            Phone
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                            {profile.phoneNumber || 'Not provided'}
                          </div>
                        </div>

                        {/* Member Since */}
                        <div>
                          <label className="text-sm font-semibold text-gray-600 block mb-2">
                            Member Since
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                            {profile.createdAt
                              ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Not available'}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'orders' && (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500">No orders yet</h3>
                    <p className="text-gray-400 mt-2">Start shopping to see your orders here</p>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-[#0d0d0d]">Saved Addresses</h2>
                      <button className="px-4 py-2 bg-[#ff5528] text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm">
                        Add New Address
                      </button>
                    </div>

                    {profile?.addresses && profile.addresses.length > 0 ? (
                      <div className="space-y-4">
                        {[...profile.addresses]
                          .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                          .map((address) => (
                          <div
                            key={address.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                          >
                            {/* Top Row: Type + Default Badge + Action Buttons */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-[#0d0d0d] capitalize">
                                  {address.type || 'Other'}
                                </h3>
                                {address.isDefault && (
                                  <span className="px-3 py-1 bg-[#ff5528] text-white text-xs font-semibold rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-3">
                                <button className="px-4 py-1 text-sm font-semibold text-[#ff5528] border-2 border-[#ff5528] rounded hover:bg-[#ff5528] hover:text-white transition-colors">
                                  Edit
                                </button>
                                <button className="px-4 py-1 text-sm font-semibold text-red-600 border-2 border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors">
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Address Text */}
                            <p className="text-gray-700 mb-2 text-sm leading-relaxed">
                              {address.address}
                            </p>

                            {/* Date Info */}
                            <p className="text-gray-500 text-xs">
                              Added: {new Date(address.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">No addresses saved</h3>
                        <p className="text-gray-400 mb-6">Add your delivery addresses to make checkout faster</p>
                        <button className="px-6 py-2 bg-[#ff5528] text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                          Add Your First Address
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'changePassword' && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#0d0d0d] mb-8">Change Password</h2>
                    <ChangePasswordForm
                      onSuccess={() => {
                        // Successfully changed password, form will reset itself
                        console.log('✅ [AccountPage] Password changed successfully')
                      }}
                    />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="text-center py-12">
                    <Settings size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500">Settings</h3>
                    <p className="text-gray-400 mt-2">Manage your account preferences</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
