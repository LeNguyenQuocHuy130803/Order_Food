
/**
 * Generate random delivery time (20-50 phút)
 */
export function getRandomDeliveryTime(): string {
  const min = 20
  const max = 50
  const time = Math.floor(Math.random() * (max - min + 1)) + min
  return `${time}-${time + 10} phút`
}

/**
 * Generate random distance (0.5-2.0 km)
 */
export function getRandomDistance(): string {
  const distance = (Math.random() * 1.5 + 0.5).toFixed(1)
  return `${distance} km`
}

/**
 * Generate random rating (4.0-4.9)
 */
export function getRandomRating(): number {
  const baseRating = 4.0
  const randomDecimal = Math.random() * 0.9
  return Math.round((baseRating + randomDecimal) * 10) / 10
}

/**
 * Generate random quantity reviews (100-500)
 */
export function getRandomReviewCount(): number {
  return Math.floor(Math.random() * 401) + 100
}
