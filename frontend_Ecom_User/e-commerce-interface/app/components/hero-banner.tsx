"use client"

import Image from "next/image"
import { Button } from "@/app/components/ui/button"
import { LucideIcon } from "lucide-react"

interface HeroBannerProps {
  icon: LucideIcon
  badge: string
  headline: string
  description: string
  buttonText?: string
  imageSrc: string
  imageAlt: string
}

export function HeroBanner({
  icon: Icon,
  badge,
  headline,
  description,
  buttonText = "Dat ngay",
  imageSrc,
  imageAlt,
}: HeroBannerProps) {
  return (
    <section className="relative bg-[#0d0d0d] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Icon className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">{badge}</span>
            </div>
            <h1 className="text-3xl font-bold text-white lg:text-4xl">
              {headline}
            </h1>
            <p className="text-white/70 max-w-lg text-sm lg:text-base">
              {description}
            </p>
            <Button size="sm" className="bg-[#ff5528] hover:bg-[#e04a22] text-white">
              {buttonText}
            </Button>
          </div>
          <div className="relative aspect-video lg:aspect-auto lg:h-64">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
