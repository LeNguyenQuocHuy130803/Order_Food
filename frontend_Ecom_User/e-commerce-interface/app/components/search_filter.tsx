'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface SearchFilterProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
}

interface FilterState {
  region: string | null;
  priceRange: string | null;
  selectedCategories: Set<string>;
}

const REGIONS = [
  'HA_NOI',
  'DA_NANG',
  'HO_CHI_MINH',
  'HAI_PHONG',
  'CAN_THO',
  'QUANG_NINH',
  'BINH_DUONG',
  'DONG_NAI',
  'LAM_DONG',
];

const PRICE_RANGES = [
  { label: 'Dưới 50k', value: 'under-50' },
  { label: '50k - 100k', value: '50-100' },
  { label: '100k - 200k', value: '100-200' },
  { label: 'Trên 200k', value: 'over-200' },
];

export function SearchFilter({ showSearch, setShowSearch }: SearchFilterProps) {
  const [openFilter, setOpenFilter] = useState<'region' | 'price' | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    region: null,
    priceRange: null,
    selectedCategories: new Set(),
  });

  const filterRef = useRef<HTMLDivElement>(null);

  // click outside đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!showSearch) return null;

  const handleRegionSelect = (region: string) => {
    setFilters({ ...filters, region });
    setOpenFilter(null);
  };

  const handlePriceSelect = (price: string) => {
    setFilters({ ...filters, priceRange: price });
    setOpenFilter(null);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = new Set(filters.selectedCategories);

    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }

    setFilters({ ...filters, selectedCategories: newCategories });
  };

  const clearAllFilters = () => {
    setFilters({
      region: null,
      priceRange: null,
      selectedCategories: new Set(),
    });

    setOpenFilter(null);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setShowSearch(false)}
      />

      {/* Search Panel */}
      <div className="fixed top-20 left-0 right-0 bg-white z-50">
        <div>

          {/* Search input */}
          <div className="container mx-auto px-4 py-6 relative">

            <input
              type="text"
              placeholder="Tìm quán ăn, món ăn..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#ff5528]"
              autoFocus
            />

            <button
              onClick={() => setShowSearch(false)}
              className="absolute top-6 right-4 p-3 hover:bg-[#ff5528] hover:text-white rounded-full transition-all bg-gray-100"
            >
              <X className="w-7 h-7 text-gray-700" />
            </button>

          </div>

          {/* Filters */}
          <div className="container mx-auto px-4 pb-6">
            <div
              ref={filterRef}
              className="flex items-center justify-between flex-wrap gap-4"
            >

              {/* LEFT CATEGORY */}
              <div className="flex flex-wrap gap-3">

                {[
                  'COFFEE',
                  'JUICE',
                  'MILK_TEA',
                  'TEA',
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 border-2 rounded-full transition-colors ${
                      filters.selectedCategories.has(category)
                        ? 'border-[#ff5528] text-[#ff5528] bg-orange-50'
                        : 'border-gray-300 hover:border-[#ff5528] hover:text-[#ff5528]'
                    }`}
                  >
                    {category}
                  </button>
                ))}

              </div>

              {/* RIGHT FILTER */}
              <div className="flex items-center gap-3">

                {/* REGION */}
                <div className="relative">

                  <button
                    onClick={() =>
                      setOpenFilter(openFilter === 'region' ? null : 'region')
                    }
                    className="px-4 py-2 border-2 border-gray-300 rounded-full text-sm flex items-center gap-2 hover:border-[#ff5528]"
                  >
                    📍 {filters.region || 'Khu vực'}

                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        openFilter === 'region' ? 'rotate-180' : ''
                      }`}
                    />

                  </button>

                  {openFilter === 'region' && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px] z-50">

                      {REGIONS.map((region) => (
                        <button
                          key={region}
                          onClick={() => handleRegionSelect(region)}
                          className="block w-full text-left px-4 py-2 hover:bg-orange-50"
                        >
                          {region}
                        </button>
                      ))}

                    </div>
                  )}

                </div>

                {/* PRICE */}
                <div className="relative">

                  <button
                    onClick={() =>
                      setOpenFilter(openFilter === 'price' ? null : 'price')
                    }
                    className="px-4 py-2 border-2 border-gray-300 rounded-full text-sm flex items-center gap-2 hover:border-[#ff5528]"
                  >
                    💵{' '}
                    {filters.priceRange
                      ? PRICE_RANGES.find((p) => p.value === filters.priceRange)
                          ?.label
                      : 'Giá'}

                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        openFilter === 'price' ? 'rotate-180' : ''
                      }`}
                    />

                  </button>

                  {openFilter === 'price' && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px] z-50">

                      {PRICE_RANGES.map((price) => (
                        <button
                          key={price.value}
                          onClick={() => handlePriceSelect(price.value)}
                          className="block w-full text-left px-4 py-2 hover:bg-orange-50"
                        >
                          {price.label}
                        </button>
                      ))}

                    </div>
                  )}

                </div>

                {/* FEATURED */}
                <button className="px-6 py-2 bg-[#ff5528] text-white rounded-full font-semibold hover:bg-[#e04420] text-sm">
                  Nổi bật
                </button>

                {/* CLEAR */}
                {(filters.region ||
                  filters.priceRange ||
                  filters.selectedCategories.size > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 border-2 border-red-400 text-red-500 rounded-full text-sm hover:bg-red-50"
                  >
                    Xóa tất cả
                  </button>
                )}

              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}