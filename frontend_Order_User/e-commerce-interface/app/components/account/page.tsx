'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, ShoppingBag, MapPin, Settings, LogOut, Edit, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface UserProfile {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  createdAt?: string
}

export default function AccountPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (user && !loading) {
      // Set profile from logged-in user data
      setProfile({
        id: user.id,
        username: user.userName,
        email: user.email,
        phone: '+1 (555) 123-4567',
        avatar: user.avatar,
        createdAt: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      })
      console.log('✅ [AccountPage] User profile loaded:', user.userName)
    }
  }, [user, loading])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-[#ff5528] border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Profile Card */}
              <div className="p-6 text-center border-b border-gray-200">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 border-2 border-[#ff5528]">
                  <Image
                    src={profile?.avatar || '/image/avatarNull/avatarNull.jpg'}
                    alt={profile?.username || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0d0d0d]">{profile?.username}</h3>
                <p className="text-xs text-gray-500">{profile?.email}</p>
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
              {activeTab === 'profile' && profile && (
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
                    {/* Full Name */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">Full Name</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                        {profile.username}
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
                        {profile.phone || 'Not set'}
                      </div>
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-2">Member Since</label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-[#0d0d0d]">
                        {profile.createdAt || 'January 15, 2024'}
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
  )
}