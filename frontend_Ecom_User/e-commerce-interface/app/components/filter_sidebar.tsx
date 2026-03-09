'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';

export function FilterSidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['rating', 'deliveryTime']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  return (
    <aside className="w-64 bg-white rounded-lg p-6 h-fit sticky top-4 shadow-sm border border-border">
      <h2 className="font-bold text-lg mb-6">Bộ lọc</h2>

      {/* Rating Filter */}
      <div className="mb-6 pb-6 border-b border-border">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full font-semibold text-foreground hover:text-primary transition-colors"
        >
          <span>Đánh giá</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.includes('rating') ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.includes('rating') && (
          <div className="mt-4 space-y-3">
            {[5, 4, 3, 2].map((stars) => (
              <label key={stars} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm">
                  {Array(stars).fill('⭐').join('')} trở lên
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Time Filter */}
      <div className="mb-6 pb-6 border-b border-border">
        <button
          onClick={() => toggleSection('deliveryTime')}
          className="flex items-center justify-between w-full font-semibold text-foreground hover:text-primary transition-colors"
        >
          <span>Thời gian giao hàng</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.includes('deliveryTime') ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.includes('deliveryTime') && (
          <div className="mt-4 space-y-3">
            {['Dưới 30 phút', '30-45 phút', '45-60 phút', 'Trên 60 phút'].map((time) => (
              <label key={time} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{time}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Fee Filter */}
      <div className="mb-6 pb-6 border-b border-border">
        <button
          onClick={() => toggleSection('deliveryFee')}
          className="flex items-center justify-between w-full font-semibold text-foreground hover:text-primary transition-colors"
        >
          <span>Phí giao hàng</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.includes('deliveryFee') ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.includes('deliveryFee') && (
          <div className="mt-4 space-y-3">
            {['Miễn phí', 'Dưới $3', '$3-$5', 'Trên $5'].map((fee) => (
              <label key={fee} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{fee}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Cuisine Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('cuisine')}
          className="flex items-center justify-between w-full font-semibold text-foreground hover:text-primary transition-colors"
        >
          <span>Loại ẩm thực</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.includes('cuisine') ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.includes('cuisine') && (
          <div className="mt-4 space-y-3">
            {['Cơm', 'Bánh mì', 'Phở', 'Nước ép', 'Cà phê', 'Tráng miệng'].map((cuisine) => (
              <label key={cuisine} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{cuisine}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="outline"
        className="w-full mt-6 border-border hover:bg-secondary"
      >
        Xóa bộ lọc
      </Button>
    </aside>
  );
}
