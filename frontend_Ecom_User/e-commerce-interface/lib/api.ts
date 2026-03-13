export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// API Endpoints (không cần /api ở đầu vì đã có trong API_BASE_URL)
export const DRINK_ENDPOINTS = {
  GET_ALL_PAGINATED: "/drinks/paging",
  GET_BY_ID: "/drinks",
  SEARCH: "/drinks/search",
  FILTER: "/drinks/filter",
  CREATE: "/drinks",
  UPDATE: "/drinks",
  DELETE: "/drinks",
} as const;