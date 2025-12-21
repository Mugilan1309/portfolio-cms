"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    // 1. Scroll up visually
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    
    // 2. Clean the URL (remove #projects) without reloading the page
    history.replaceState(null, "", window.location.pathname)
  }

  if (!isVisible) {
    return null
  }

  return (
    <Button
      size="icon"
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full shadow-2xl shadow-blue-500/20 animate-in fade-in zoom-in duration-300 hover:-translate-y-1 transition-transform bg-primary text-primary-foreground"
    >
      <ArrowUp className="h-6 w-6" />
      <span className="sr-only">Scroll to top</span>
    </Button>
  )
}