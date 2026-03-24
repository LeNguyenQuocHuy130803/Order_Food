import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

/**
 * 🔧 Fix: useSearchParams() Suspense Boundary Error
 * 
 * ❌ PROBLEM: page.tsx là Server Component, gọi useSearchParams() (Client API)
 * ✅ SOLUTION:
 *   - page.tsx: Server Component + Suspense wrapper
 *   - SearchPageClient.tsx: Client Component (chứa useSearchParams())
 *   - Suspense: Required by Next.js when rendering Client Component with useSearchParams
 */

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
