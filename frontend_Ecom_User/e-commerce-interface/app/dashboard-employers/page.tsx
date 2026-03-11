'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Footer } from '../components/footer'
import { SearchFilter } from '../components/search_filter'
import { FilterSidebar } from '../components/filter_sidebar'
import { Header } from '../components/header'

type Props = {}

export default function page({}: Props) {
  const { user, logout, isAuthenticated } = useAuth()
  const [showSearch, setShowSearch] = useState(false)

  return (
    // <div>
    //   {/* <div className="flex-1">
    //     <h1>🏢 Dashboard Employers</h1>
        
    //     {isAuthenticated ? (  // dùng isAuthenticated để kiểm tra nếu user đã login hay chưa, nếu có thì hiển thị thông tin user và nút logout, nếu chưa thì hiển thị thông báo lỗi
    //       <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
    //         <h2>✅ Đã vào được dashboard employers</h2>  // nếu có thể vào được trang này thì chứng tỏ đã login thành công và có quyền truy cập, còn nếu chưa login mà cố gắng vào thì sẽ bị chặn ở middleware và redirect về trang login
            
    //         <div style={{ marginTop: '15px', marginBottom: '15px' }}>
    //           <p><strong>User Info:</strong></p>
    //           <p>👤 Tên: <code>{user?.name}</code></p>
    //           <p>📧 Email: <code>{user?.email}</code></p>
    //           <p>🔐 Roles: <code>{user?.roles?.join(', ')}</code></p>
    //         </div>

    //         <button
    //           onClick={logout}
    //           style={{
    //             padding: '10px 20px',
    //             backgroundColor: '#ff4444',
    //             color: 'white',
    //             border: 'none',
    //             borderRadius: '5px',
    //             cursor: 'pointer',
    //             fontSize: '16px',
    //             fontWeight: 'bold'
    //           }}
    //         >
    //           🚪 Logout
    //         </button>
            
    //         <p style={{ marginTop: '15px', color: '#666' }}>
    //           💡 Click logout để kiểm tra redirect, rồi login lại để test
    //         </p>
    //       </div>
    //     ) : (
    //       <div style={{ color: 'red' }}>
    //         ❌ Không được phép! Bạn phải login trước!
    //       </div>
    //     )}
    //   </div> */}
    // </div>

    <main className="bg-background min-h-screen">
      <Header />
      <SearchFilter showSearch={showSearch} setShowSearch={setShowSearch} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Quán ăn ở Đà Nẵng
              </h2>
              <p className="text-muted-foreground">
                Tìm kiếm và đặt hàng từ hơn 1000+ quán ăn
              </p>
            </div>

            {/* Restaurant Grid */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  {...restaurant}
                />
              ))}
            </div> */}

            {/* Load More Button */}
            <div className="mt-12 text-center">
              <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors  bg-red-500">
                Xem thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}