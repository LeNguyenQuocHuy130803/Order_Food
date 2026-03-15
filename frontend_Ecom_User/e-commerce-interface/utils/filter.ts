import type { FilterParams } from "@/types/drink";

/**
 hàm ở dưới làm chức năng như sau chuyển đổi thông tin từ url mà pử file page.tsx để lên url khi người dùng chọn flider ở sidebar, 
 vì bên file page.tsx ở folder drink có hàm là router.push(`/drink${query ? `?${query}` : ""}`); nếu người dùng chọn gì thì nnosex chuyển thành url : /drink?categories=COFFEE&region=HA_NOI nếu ko chọn thì /drink hết
 nó sẽ đọc và return ra 1 object có dạng như sau:
 {
  categories: ["COFFEE"],
  region: "HA_NOI"
 }
  dựa vào đó file page.tsx sẽ gọi hook useDrinks với filters đã được parse từ URL để fetch dữ liệu từ API về và hiển thị ra giao diện
 */
export function parseUrlParamsToFilters(  
  searchParams: URLSearchParams
): FilterParams {
  const filters: FilterParams = {};  // khởi tạo object filters rỗng, nếu URL có param nào thì sẽ thêm vào object này, nếu không có thì nó vẫn là object rỗng và useDrinks sẽ fetch tất cả sản phẩm mà không filter gì cả

  const categories = searchParams.getAll("categories");  // getAll vì có thể có nhiều categories, ví dụ ?categories=COFFEE&categories=TEA thì nó sẽ trả về mảng ["COFFEE", "TEA"]
  if (categories.length > 0) {
    filters.categories = categories;
  }

  const featured = searchParams.get("featured");
  if (featured === "true") {
    filters.featured = true;
  }

  const minPrice = searchParams.get("minPrice");
  if (minPrice) {
    filters.minPrice = parseInt(minPrice);
  }

  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) {
    filters.maxPrice = parseInt(maxPrice);
  }

  const unit = searchParams.get("unit");
  if (unit) {
    filters.unit = unit;
  }

  const region = searchParams.get("region");
  if (region) {
    filters.region = region;
  }

  return filters;
}



/**
 * hàm này làm nhiệm vụ ngược lại của hàm parseUrlParamsToFilters, nó sẽ nhận vào 1 object filters và chuyển đổi thành URLSearchParams để push lên URL khi người dùng chọn filter ở sidebar
 * Ví dụ: nếu filters là 
 * {
 * categories: ["COFFEE"],
 * region: "HA_NOI"
 * }
 * thì nó sẽ trả về URLSearchParams có dạng ?categories=COFFEE&region=HA_NOI để push lên URL thành /drink?categories=COFFEE&region=HA_NOI
 * Nếu filters là {} thì nó sẽ trả về URLSearchParams rỗng để push lên URL thành /drink
 * 
 * Mục đích: Giúp đồng bộ trạng thái filter giữa URL và giao diện, khi người dùng chọn filter thì URL sẽ cập nhật, khi người dùng truy cập URL có filter thì giao diện sẽ hiển thị đúng filter đó
 */
export function filtersToUrlParams(filters: FilterParams): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach((cat) => params.append("categories", cat));
  }

  if (filters.featured) {
    params.set("featured", "true");
  }

  if (filters.minPrice !== undefined) {
    params.set("minPrice", filters.minPrice.toString());
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", filters.maxPrice.toString());
  }

  if (filters.unit) {
    params.set("unit", filters.unit);
  }

  if (filters.region) {
    params.set("region", filters.region);
  }

  return params;
}