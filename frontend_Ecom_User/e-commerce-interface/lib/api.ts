export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const DRINK_ENDPOINTS = {
  GET_ALL_PAGINATED: "/drinks/paging",
  GET_BY_ID: "/drinks",
  SEARCH: "/drinks/search",
  FILTER: "/drinks/filter",
  CREATE: "/drinks",
  UPDATE: "/drinks",
  DELETE: "/drinks",
} as const;