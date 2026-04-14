import { Suspense } from 'react'
import { DessertPageClient } from './DessertPageClient'

export const metadata = {
  title: 'Desserts - FoodKing',
  description: 'Browse our delicious dessert collection',
}

export default function DessertPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DessertPageClient />
    </Suspense>
  )
}
