'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';

interface SearchFilterProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
}


export function SearchFilter({ showSearch, setShowSearch }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();


  // ============================================================================
  // Handler: Thực hiện tìm kiếm
  // ============================================================================
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Chuyển hướng tới trang search với query param
      router.push(`/search?name=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false); // Đóng search panel
    }
  };

  // ============================================================================
  // Handler: Bắt sự kiện Enter key
  // ============================================================================
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!showSearch) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setShowSearch(false)}
      />

      {/* Search Panel */}
      <div className="fixed top-30 left-0 right-0 bg-white z-50">
        {/* Search Input Section */}
        <div className="container mx-auto px-4 py-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm quán ăn, món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#ff5528] pr-16"
              autoFocus
            />

            {/* Search Button - Icon Kính lúp */}
            <button
              onClick={handleSearch}
              className="absolute top-1/2 right-14 transform -translate-y-1/2 p-2 hover:bg-[#ff5528] hover:text-white text-gray-600 rounded-full transition-all hover:scale-110"
              title="Tìm kiếm (Enter)"
            >
              <Search className="w-6 h-6" />
            </button>

          </div>
        </div>
      </div>
    </>
  );
}