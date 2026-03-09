'use client';

import { Search, MapPin, Clock, DollarSign, Flame } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function SearchFilter() {
  return (
    <section className="bg-gradient-to-b from-secondary to-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="w-full lg:flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Tìm quán ăn, món ăn..."
                className="pl-10 py-3 w-full bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 w-full lg:w-auto flex-wrap lg:flex-nowrap justify-center lg:justify-end">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-border hover:bg-secondary"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Khu vực</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-border hover:bg-secondary"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Mở cửa</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-border hover:bg-secondary"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Giá</span>
            </Button>
            <Button
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground  bg-red-500"
            >
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Nổi bật</span>
            </Button>
          </div>
        </div>

        {/* Quick Category Tags */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {['Cơm', 'Bánh mì', 'Phở', 'Bún', 'Nước ép', 'Cà phê', 'Tráng miệng'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white border border-border rounded-full text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors whitespace-nowrap"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
