/**
 * 📍 AddressSelector Component - Shopee Style
 * Hiển thị địa chỉ + modal chọn từ API list
 * Logic: Nếu user chọn → dùng selectedAddressId, nếu không → dùng isDefault
 * ✅ Persist selectedAddressId to sessionStorage
 */

"use client"

import { useState, useEffect } from "react"
import { MapPin, X } from "lucide-react"
import { useAddresses } from "@/hooks/useAddresses"

const STORAGE_KEY = "checkout_selectedAddressId"

interface AddressSelectorProps {
  selectedAddressId: number | null
  onSelectedAddressChange: (id: number | null) => void
}

export function AddressSelector({ selectedAddressId, onSelectedAddressChange }: AddressSelectorProps) {
  const { addresses, loading: addressesLoading, error: addressesError } = useAddresses() // ✅ Sửa: thêm loading + error
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ✅ Load selectedAddressId from sessionStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // ✅ Set selectedAddressId + save to sessionStorage
  const setSelectedAddressId = (id: number | null) => {
    onSelectedAddressChange(id)
    if (id !== null) {
      sessionStorage.setItem(STORAGE_KEY, id.toString())
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  // Logic: Nếu user vừa chọn → dùng selectedAddressId, nếu không → dùng address.isDefault
  const displayAddress = addresses.find(addr => {
    if (selectedAddressId !== null) {
      return addr.id === selectedAddressId
    }
    return addr.isDefault === true
  })

  console.log('📍 AddressSelector render:', {
    addressesLoading,
    addressesError,
    addressesCount: addresses.length,
    selectedAddressId,
    displayAddress: displayAddress?.id,
    mounted,
  })

  if (!mounted || addressesLoading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (addressesError || !displayAddress) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="text-red-600 text-sm">❌ {addressesError || "Không thể tải địa chỉ"}</p>
      </div>
    )
  }

  return (
    <>
      {/* 📍 Địa Chỉ Nhận Hàng - Shopee Style */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-900 text-lg">Địa Chỉ Nhận Hàng</h3>
          </div>
        </div>

        {/* Address Card - Horizontal Layout */}
        <div className="p-4">
          {/* Row 1: Phone/Name + Badge + Button */}
          <div className="flex items-start justify-between gap-4 mb-2">
            {/* Left: Phone + Name */}
            <p className="font-semibold text-gray-900 text-base">
              {displayAddress.phoneNumber && `${displayAddress.phoneNumber} · `}
              {displayAddress.type || "Địa chỉ"}
            </p>

            <p className="text-gray-700 text-base leading-relaxed">
              {displayAddress.address || "Chưa có địa chỉ"}
            </p>

            {/* Right: Badge + Button - Nằm Ngang */}
            <div className="flex gap-2 items-center min-w-fit">
              {displayAddress.isDefault && (
                <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded whitespace-nowrap">
                  Mặc Định
                </span>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-semibold text-base hover:text-blue-700 transition-colors"
              >
                Thay Đổi
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Modal: Select Address - Shopee Style */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-96 flex flex-col shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-lg">Địa Chỉ Nhận Hàng Của Tôi</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address List */}
            <div className="flex-1 overflow-y-auto">
              {addressesLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : addressesError ? (
                <div className="p-6 text-center">
                  <p className="text-red-600 font-semibold mb-2">❌ Lỗi</p>
                  <p className="text-sm text-gray-600">{addressesError}</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm">Không có địa chỉ nào</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-all ${addr.id === selectedAddressId
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={addr.id === selectedAddressId}
                        onChange={() => {
                          // ✅ Chỉ update selectedAddressId, không gọi API
                          setSelectedAddressId(addr.id)
                          setIsModalOpen(false)
                        }}
                        className="mt-1 cursor-pointer accent-red-500"
                      />
                      <div className="flex-1">
                        {/* Top: Name + Phone + Badge */}
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 text-base">
                            {addr.type || "Địa chỉ"}
                            {addr.phoneNumber && ` · ${addr.phoneNumber}`}
                          </p>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded">
                              Mặc Định
                            </span>
                          )}
                        </div>
                        
                        {/* Address */}
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {addr.address || "Chưa có địa chỉ"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
