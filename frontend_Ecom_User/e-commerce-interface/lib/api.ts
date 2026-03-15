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

export const FOOD_ENDPOINTS = {
  GET_ALL_PAGINATED: "/foods/paging",
  GET_BY_ID: "/foods",
  SEARCH: "/foods/search",
  FILTER: "/foods/filter",
  CREATE: "/foods",
  UPDATE: "/foods",
  DELETE: "/foods",
} as const;

export const FRESH_ENDPOINTS = {
  GET_ALL_PAGINATED: "/freshs/paging",
  GET_BY_ID: "/freshs",
  SEARCH: "/freshs/search",
  FILTER: "/freshs/filter",
  CREATE: "/freshs",
  UPDATE: "/freshs",
  DELETE: "/freshs",
} as const;