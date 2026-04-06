'use client';

import { useEffect, useState } from 'react';
import { Filter, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import type { FilterParams } from '@/types/drink';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterParams) => void;
  initialFilters?: FilterParams;
  categories: Array<{ name: string; displayName: string }>;
}

export function FilterSidebar({ onFilterChange, initialFilters, categories }: FilterSidebarProps) {
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatured, setSelectedFeatured] = useState<boolean>(false);

  useEffect(() => {
    if (initialFilters) {
      setSelectedCategories(initialFilters.categories || []);
      setSelectedFeatured(initialFilters.featured || false);
    }
  }, [initialFilters]);

  const handleCategoryClick = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);
    notifyFilterChange(newCategories, selectedFeatured);
  };

  const handleFeaturedClick = () => {
    const newFeatured = !selectedFeatured;
    setSelectedFeatured(newFeatured);
    notifyFilterChange(selectedCategories, newFeatured);
  };

  const handleAllClick = () => {
    setSelectedCategories([]);
    notifyFilterChange([], selectedFeatured);
  };

  const notifyFilterChange = (categories: string[], featured: boolean) => {
    if (onFilterChange) {
      const filters: FilterParams = {
        categories: categories.length > 0 ? categories : undefined,
        featured: featured || undefined,
      };
      onFilterChange(filters);
    }
  };

  return (
    <section className="border-b border-gray-200 bg-white w-full">
      <div className="mx-auto max-w-7xl px-2 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-2 lg:py-4 gap-2 lg:gap-4">
          {/* Categories with All button */}
          <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1 min-w-0">
            <Button
              variant={selectedCategories.length === 0 ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap flex-shrink-0 text-xs lg:text-sm"
              onClick={handleAllClick}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.name}
                variant={selectedCategories.includes(cat.name) ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap flex-shrink-0 text-xs lg:text-sm"
                onClick={() => handleCategoryClick(cat.name)}
              >
                {cat.displayName}
              </Button>
            ))}
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0 hidden lg:flex">
            <Button 
              variant={selectedFeatured ? 'default' : 'outline'}
              size="sm"
              onClick={handleFeaturedClick}
              className="whitespace-nowrap text-xs lg:text-sm"
            >
              <Star className="h-4 w-4 mr-1 lg:mr-2" />
              Best Seller
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs lg:text-sm">
              <Filter className="h-4 w-4 mr-1 lg:mr-2" />
              Location
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs lg:text-sm">
              <SlidersHorizontal className="h-4 w-4 mr-1 lg:mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}