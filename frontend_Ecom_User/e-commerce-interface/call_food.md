B1 :
types/drink.ts              ← Define types cho dữ liệu
lib/drink-utils.ts          ← Utility functions (để random thời gian , vì trí , sô sao đánh giá và số lượt xem)
app/components/drink-card.tsx  ← Card component hiển thị từng sản phẩm 
app/food/page.tsx           ← Main page (fetch API + render)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
B2 : file drink.ts để định kiểu dlieu :
export interface Drink {
  id: number
  name: string
  imageUrl: string
  price: number
  type: 'FEATURED' | 'NORMAL'
  // ... other fields
}

export interface DrinkCardProps extends Drink {
  deliveryTime: string  // Random data
  distance: string      // Random data
  rating: number        // Random data
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
file drink-utile.ts thì file random như nói ở trên 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
còn file drink-card.tsx là để cấu hình ui nhận về từ các field được response ra

<div>
  {/* Image */}
  <Image src={imageUrl} />
  
  {/* Featured badge */}
  {type === "FEATURED" && <div>Nổi bật</div>}
  
  {/* Name + Order Button */}
  <h3>{name}</h3>
  <button>Order</button>
  
  {/* Rating sao */}
  <Star rating={rating} reviews={reviewCount} />
  
  {/* Delivery info */}
  <div>
    <Clock /> {deliveryTime}
    <Price /> ${price}
    <MapPin /> {distance}
  </div>
</div>
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
còn file food -> page.tsx là file để fetch api và transform data

c1 : khi dùng đến file drink-card.tsx


useEffect (chạy khi component load)
  ↓
fetch("http://localhost:8080/api/drinks")
  ↓
Response: [
  {id: 1, name: "Iced8", imageUrl: "...", price: 5000, type: "FEATURED"},
  {id: 5, name: "Le huy...", imageUrl: "...", price: 400000, type: "NORMAL"},
  ...
]
  ↓
Transform mỗi item:
  - Thêm deliveryTime: getRandomDeliveryTime()
  - Thêm distance: getRandomDistance()
  - Thêm rating: getRandomRating()
  ↓
setDrinks(transformedData)
  ↓
Render: {drinks.map(drink => <DrinkCard {...drink} />)}


[  code đây :
    const response = await fetch("http://localhost:8080/api/drinks", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  cache: "no-store"  // Luôn fetch fresh data, không cache
});

const data: Drink[] = await response.json();

// Transform: thêm random properties vào mỗi drink
const transformedDrinks: DrinkCardProps[] = data.map((drink) => ({
  ...drink,  // Spread toàn bộ properties gốc
  deliveryTime: getRandomDeliveryTime(),  // Thêm random
  distance: getRandomDistance(),          // Thêm random
  rating: getRandomRating(),              // Thêm random
}));

setDrinks(transformedDrinks);  // Lưu vào state
]


- render bằng lưới grid:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {drinks.map((drink) => (
    <DrinkCard key={drink.id} {...drink} />
  ))}
</div>


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

còn error handing :
// Loading state
{isLoading && <Spinner />}

// Error state
{error && (
  <div>
    <p>❌ {error}</p>
    <button onClick={() => window.location.reload()}>Thử lại</button>
  </div>
)}

// Empty state
{!isLoading && drinks.length === 0 && <p>Không có sản phẩm</p>}

// Success - render data
{drinks.length > 0 && <DrinkGrid />}

Backend API (8080)
      ↓
Fetch JSON
      ↓
Transform + Add Random Data
      ↓
State (setDrinks)
      ↓
Map to DrinkCard components
      ↓
Render Grid (3 columns)
      ↓
User sees products on UI

??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
c2 : khi không dùng đến file drink-card.tsx thì dùng .map như bthg : là cách đang làm 