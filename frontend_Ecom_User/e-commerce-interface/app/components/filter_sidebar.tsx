'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import type { FilterParams } from '@/types/drink';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterParams) => void;
  initialFilters?: FilterParams;
  onIsOpenChange?: (isOpen: boolean) => void;
}

export function FilterSidebar({ onFilterChange, initialFilters, onIsOpenChange }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'featured']);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatured, setSelectedFeatured] = useState<boolean>(false); // ✅ FIX TYPE
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const REGIONS = ['HA_NOI', 'HO_CHI_MINH', 'DA_NANG', 'HAI_PHONG', 'CAN_THO', 'QUANG_BINH', 'BINH_DUONG', 'DONG_NAI'];

  useEffect(() => {
    if (initialFilters) {
      setSelectedCategories(initialFilters.categories || []);
      setSelectedFeatured(initialFilters.featured || false);
      setMinPrice(initialFilters.minPrice ? initialFilters.minPrice.toString() : '');
      setMaxPrice(initialFilters.maxPrice ? initialFilters.maxPrice.toString() : '');
      setSelectedRegions(initialFilters.region ? [initialFilters.region] : []);
    }
  }, [initialFilters]);

  // Notify parent when isOpen state changes
  useEffect(() => {
    onIsOpenChange?.(isOpen);
  }, [isOpen, onIsOpenChange]);

  const formatPrice = (price: string): string => {
    if (!price) return '';
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);

    setSelectedCategories(newCategories);
    notifyFilterChange(newCategories, selectedFeatured, minPrice, maxPrice);
  };

  const handleFeaturedChange = (checked: boolean) => {
    setSelectedFeatured(checked);
    notifyFilterChange(selectedCategories, checked, minPrice, maxPrice);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
      notifyFilterChange(selectedCategories, selectedFeatured, value, maxPrice, selectedRegions);
    } else {
      setMaxPrice(value);
      notifyFilterChange(selectedCategories, selectedFeatured, minPrice, value, selectedRegions);
    }
  };

  const handleRegionChange = (region: string, checked: boolean) => {
    const newRegions = checked
      ? [...selectedRegions, region]
      : selectedRegions.filter(r => r !== region);

    setSelectedRegions(newRegions);
    notifyFilterChange(selectedCategories, selectedFeatured, minPrice, maxPrice, newRegions);
  };

  const notifyFilterChange = (
    categories: string[],
    featured: boolean,
    min: string,
    max: string,
    regions: string[] = selectedRegions
  ) => {
    if (onFilterChange) {
      const filters: FilterParams = {
        categories: categories.length > 0 ? categories : undefined,
        featured: featured ? true : undefined,
        minPrice: min ? parseInt(min) : undefined,
        maxPrice: max ? parseInt(max) : undefined,
        region: regions.length > 0 ? regions[0] : undefined,
      };

      onFilterChange(filters);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedFeatured(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedRegions([]);

    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <>
      <aside
        className={`${isOpen
          ? 'block w-64 opacity-100 translate-x-0'
          : 'hidden'
          } bg-white rounded-lg p-6 h-fit sticky top-4 shadow-sm border border-border transition-all duration-300 overflow-hidden`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-full mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-foreground" />
        </button>

        <h2 className="font-bold text-lg mb-6">Bộ lọc</h2>

        {/* CATEGORY */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full font-semibold"
          >
            <span>Danh mục</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.includes('category') ? 'rotate-180' : ''
                }`}
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
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* FEATURED */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('featured')}
            className="flex items-center justify-between w-full font-semibold"
          >
            <span>Sản phẩm nổi bật</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.includes('featured') ? 'rotate-180' : ''
                }`}
            />
          </button>

          {expandedSections.includes('featured') && (
            <label className="flex items-center gap-3 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFeatured}
                onChange={(e) => handleFeaturedChange(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Nổi bật</span>
            </label>
          )}
        </div>

        {/* PRICE */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full font-semibold"
          >
            <span>Khoảng giá</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.includes('price') ? 'rotate-180' : ''
                }`}
            />
          </button>

          {expandedSections.includes('price') && (
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-1/2 px-3 py-2 border rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-1/2 px-3 py-2 border rounded-md text-sm"
              />
            </div>
          )}
        </div>

        {/* REGION */}
        <div className="mb-6 pb-6 border-b border-border">
          <button
            onClick={() => toggleSection('region')}
            className="flex items-center justify-between w-full font-semibold"
          >
            <span>Khu vực</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.includes('region') ? 'rotate-180' : ''
                }`}
            />
          </button>

          {expandedSections.includes('region') && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {REGIONS.map((region) => (
                <label key={region} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region)}
                    onChange={(e) => handleRegionChange(region, e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{region}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="w-full mt-6"
        >
          Xóa bộ lọc
        </Button>
      </aside>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-35 z-50 bg-white p-3 rounded-lg shadow-lg border"
        >
          ☰
        </button>
      )}
    </>
  );
}