'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '../components/ui/button';

interface FilterSidebarProps {
  onFilterChange?: (results: any[]) => void;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'featured']);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedFeatured, setSelectedFeatured] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatPrice = (price: string): string => {
    if (!price) return '';
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const debouncedPerformFilter = (categories: string[], featured: string[], minP: string, maxP: string) => {
    // Clear previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timeout
    debounceTimerRef.current = setTimeout(() => {
      performFilter(categories, featured, minP, maxP);
    }, 600); // Wait 800ms before calling API
  };
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  const performFilter = async (categories: string[], featured: string[], minP: string, maxP: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Thêm category
      if (categories.length === 1) {
        params.append('category', categories[0]);
      } else if (categories.length > 1) {
        // Nếu chọn nhiều category, gọi từng API rồi merge
        const allResults: any[] = [];
        for (const cat of categories) {
          const catParams = new URLSearchParams(params);
          catParams.append('category', cat);
          if (minP) catParams.append('minPrice', minP);
          if (maxP) catParams.append('maxPrice', maxP);

          console.log('📡 Fetching filter:', catParams.toString());
          const response = await fetch(`http://localhost:8080/api/drinks/filter?${catParams}`);
          if (response.ok) {
            const data = await response.json();
            allResults.push(...data);
          }
        }
        console.log('🎯 Merged results:', allResults);
        onFilterChange?.(allResults);
        setLoading(false);
        return;
      }

      // Thêm featured
      if (featured.length > 0) {
        featured.forEach(f => {
          params.append('featured', f === 'Featured' ? 'true' : 'false');
        });
      }

      // Thêm giá
      if (minP) params.append('minPrice', minP);
      if (maxP) params.append('maxPrice', maxP);

      const url = `http://localhost:8080/api/drinks/filter?${params}`;
      console.log('📡 Fetching filter:', url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Lỗi lọc sản phẩm');
        onFilterChange?.([]);
        setLoading(false);
        return;
      }

      const results = await response.json();
      console.log('✅ Filter results:', results);
      onFilterChange?.(results);
    } catch (err) {
      console.error('💥 Filter error:', err);
      setError('Không thể kết nối tới server');
      onFilterChange?.([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    let newMaxPrice = maxPrice;
    if (maxPrice && parseInt(value) > parseInt(maxPrice)) {
      newMaxPrice = (parseInt(value) + 10000).toString();
      setMaxPrice(newMaxPrice);
    }
    debouncedPerformFilter(selectedCategory, selectedFeatured, value, newMaxPrice);
  };

  const handleMaxPriceChange = (value: string) => {
    if (value && minPrice && parseInt(value) <= parseInt(minPrice)) {
      const newMaxPrice = (parseInt(minPrice) + 10000).toString();
      setMaxPrice(newMaxPrice);
      debouncedPerformFilter(selectedCategory, selectedFeatured, minPrice, newMaxPrice);
      return;
    }
    setMaxPrice(value);
    debouncedPerformFilter(selectedCategory, selectedFeatured, minPrice, value);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategory.includes(category)
      ? selectedCategory.filter(c => c !== category)
      : [...selectedCategory, category];
    setSelectedCategory(newCategories);
    debouncedPerformFilter(newCategories, selectedFeatured, minPrice, maxPrice);
  };

  const toggleFeatured = (featured: string) => {
    const newFeatured = selectedFeatured.includes(featured)
      ? selectedFeatured.filter(f => f !== featured)
      : [...selectedFeatured, featured];
    setSelectedFeatured(newFeatured);
    debouncedPerformFilter(selectedCategory, newFeatured, minPrice, maxPrice);
  };

  const handleResetFilters = () => {
    setMinPrice('0');
    setMaxPrice('');
    setSelectedCategory([]);
    setSelectedFeatured([]);
    setError(null);
    performFilter([], [], '0', '');
  };

  return (
    <>
      {/* Main Sidebar */}
      <aside className={`${
        isOpen 
          ? 'w-64 opacity-100 translate-x-0' 
          : 'w-0 opacity-0 -translate-x-full'
      } bg-white rounded-lg p-6 h-fit sticky top-4 shadow-sm border border-border transition-all duration-300 overflow-hidden`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-full mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Thu gọn bộ lọc"
        >
          <X size={24} className="text-foreground" />
        </button>

        <h2 className="font-bold text-lg mb-6">Bộ lọc</h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Đang lọc...
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full font-semibold text-foreground hover:text-primary transition-colors"
          >
            <span>Danh mục</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.includes('category') ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.includes('category') && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {['COFFEE', 'MILK_TEA', 'JUICE', 'TEA'].map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategory.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Featured Filter */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('featured')}
            className="flex items-center justify-between w-full font-semibold text-foreground hover:text-primary transition-colors"
          >
            <span>Sản phẩm nổi bật</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.includes('featured') ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.includes('featured') && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {['Featured', 'Normal'].map((featured) => (
                <label key={featured} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatured.includes(featured)}
                    onChange={() => toggleFeatured(featured)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">{featured}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full font-semibold text-foreground hover:text-primary transition-colors"
          >
            <span>Khoảng giá</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.includes('price') ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.includes('price') && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formatPrice(minPrice)} đ</p>
                </div>
                <div className="w-1/2">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="0"
                    value={maxPrice}
                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formatPrice(maxPrice)} đ</p>
                </div>
              </div>
              {minPrice && maxPrice && parseInt(minPrice) >= parseInt(maxPrice) && (
                <p className="text-xs text-red-500 mt-2">⚠️ Giá tối đa phải lớn hơn giá tối thiểu</p>
              )}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <Button
          onClick={handleResetFilters}
          variant="outline"
          className="w-full mt-6 border-border hover:bg-secondary"
        >
          Xóa bộ lọc
        </Button>
      </aside>

      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-35 z-50 bg-white p-3 rounded-lg shadow-lg border border-border hover:bg-gray-50 transition-all duration-300"
          title="Mở bộ lọc"
        >
          <div className="text-2xl font-bold text-foreground">☰</div>
        </button>
      )}
    </>
  );
}
