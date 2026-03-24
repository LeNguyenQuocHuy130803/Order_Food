import { Suspense } from "react";
import DrinkPageClient from "./DrinkPageClient";

/**
 * 🔧 Fix: useSearchParams() Suspense Boundary Error
 * 
 * ❌ PROBLEM: page.tsx là Server Component, gọi useSearchParams() (Client API)
 * ✅ SOLUTION:
 *   - page.tsx: Server Component + Suspense wrapper
 *   - DrinkPageClient.tsx: Client Component (chứa useSearchParams())
 *   - Suspense: Required by Next.js when rendering Client Component with useSearchParams
 */

export default function DrinkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DrinkPageClient />
    </Suspense>
  );
}