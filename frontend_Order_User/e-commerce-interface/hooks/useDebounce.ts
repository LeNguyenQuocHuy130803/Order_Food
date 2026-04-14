import { useEffect, useRef, useCallback } from 'react'

/**
 * 🔄 Hook useDebounce - Delay gọi function trong N milliseconds
 * 
 * Khi user bấm tăng/giảm nhiều lần liên tiếp, sẽ chỉ gọi function một lần sau khi user ngừng bấp
 * 
 * @param callback - Function cần debounce
 * @param delay - Delay time in milliseconds (default: 1000ms = 1 giây)
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ Cancel timeout nếu component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // ✅ Trả về debounced function
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      // ❌ Clear timeout trước đó
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // ✅ Set timeout mới
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )

  return debouncedFn
}
