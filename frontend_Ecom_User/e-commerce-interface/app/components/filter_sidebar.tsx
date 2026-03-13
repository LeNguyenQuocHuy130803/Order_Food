'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import type { FilterParams } from '@/types/drink';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterParams) => void;
  initialFilters?: FilterParams;
}

export function FilterSidebar({ onFilterChange, initialFilters }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'featured']);
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatured, setSelectedFeatured] = useState<boolean | false>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Restore UI state from initialFilters when they change (e.g., when URL params change)
  useEffect(() => {
    if (initialFilters) {
      setSelectedCategories(initialFilters.categories || []);
      setSelectedFeatured(initialFilters.featured || false);
      setMinPrice(initialFilters.minPrice ? initialFilters.minPrice.toString() : '');
      setMaxPrice(initialFilters.maxPrice ? initialFilters.maxPrice.toString() : '');
    }
  }, [initialFilters]);

  const formatPrice = (price: string): string => {
    if (!price) return '';
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Handle category changes
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    setSelectedCategories(newCategories);
    notifyFilterChange(newCategories, selectedFeatured, minPrice, maxPrice);
  };

  // Handle featured changes
  const handleFeaturedChange = (checked: boolean) => {
    setSelectedFeatured(checked);
    notifyFilterChange(selectedCategories, checked, minPrice, maxPrice);
  };

  // Handle price changes
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
      notifyFilterChange(selectedCategories, selectedFeatured, value, maxPrice);
    } else {
      setMaxPrice(value);
      notifyFilterChange(selectedCategories, selectedFeatured, minPrice, value);
    }
  };

  // Notify parent component of filter changes
  const notifyFilterChange = (
    categories: string[],
    featured: boolean,
    min: string,
    max: string
  ) => {
    if (onFilterChange) {
      const filters: FilterParams = {
        categories: categories.length > 0 ? categories : undefined,
        featured: featured ? true : undefined,
        minPrice: min ? parseInt(min) : undefined,
        maxPrice: max ? parseInt(max) : undefined,
      };
      onFilterChange(filters);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedFeatured(false);
    setMinPrice('');
    setMaxPrice('');
    if (onFilterChange) {
      onFilterChange({});
    }
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
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
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
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatured}
                  onChange={(e) => handleFeaturedChange(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm">Nổi bật</span>
              </label>
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
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formatPrice(minPrice)} đ</p>
                </div>
                <div className="w-1/2">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
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
          variant="outline"
          onClick={handleClearFilters}
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
