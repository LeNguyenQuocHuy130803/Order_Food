'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, ShoppingBag, MapPin, Settings, LogOut, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'
import { userService } from '@/service/userService'
import type { UserDetail } from '@/types/user'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [profile, setProfile] = useState<UserDetail | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !loading) {
      // ✅ Gọi getById API để lấy đầy đủ user detail
      const fetchUserDetail = async () => {
        try {
          setIsLoadingProfile(true)
          setError(null)
          
          console.log(`📥 [AccountPage] Fetching user detail for ID: ${user.id}`)
          const userDetail = await userService.getUserById(user.id)
          
          setProfile(userDetail)
          console.log('✅ [AccountPage] User detail loaded successfully')
        } catch (err: any) {
          const errorMsg = err.message || 'Failed to load profile'
          console.error('❌ [AccountPage] Error loading profile:', errorMsg)
          setError(errorMsg)
        } finally {
          setIsLoadingProfile(false)
        }
      }

      fetchUserDetail()
    }
  }, [user, loading])

  const handleLogout = async () => {
    await logout()
    router.push('/')
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
                      src={user.avatar || '/image/avatarNull/avatarNull.jpg'}
                      alt={user.userName || 'User Avatar'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#0d0d0d]">{user.userName}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
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

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">❌ {error}</p>
                  </div>
                )}

                {activeTab === 'profile' && profile && !isLoadingProfile && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-[#0d0d0d]">Profile Information</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-[#ff5528] text-[#ff5528] rounded-lg hover:bg-[#ff5528] hover:text-white transition-colors font-semibold"
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username */}
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Username</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                          {profile.userName}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Email</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                          {profile.email}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Phone</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                          {profile.phoneNumber || 'Not provided'}
                        </div>
                      </div>

                      {/* Member Since */}
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Member Since</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                          {profile.createdAt 
                            ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : 'Not available'
                          }
                        </div>
                      </div>
                    </div>
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
                  <div className="text-center py-12">
                    <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500">No addresses saved</h3>
                    <p className="text-gray-400 mt-2">Add your delivery addresses here</p>
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
