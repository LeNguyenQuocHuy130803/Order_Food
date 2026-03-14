import type { FilterParams } from "@/types/drink";

export function parseUrlParamsToFilters(
  searchParams: URLSearchParams
): FilterParams {
  const filters: FilterParams = {};

  const categories = searchParams.getAll("categories");
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