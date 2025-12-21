'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExternalLink, Award, X, Maximize2 } from 'lucide-react'

// Define the type for the data we passed down
interface Certificate {
  id: string
  title: string
  issuer: string | null
  date_issued: string | null
  image_url: string | null
  credential_link: string | null
}

export default function CertificatesSection({ certificates }: { certificates: Certificate[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Handle "Esc" Key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!certificates || certificates.length === 0) return null

  return (
    <section>
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Award className="w-8 h-8 text-blue-600" /> Certificates & Achievements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id} className="hover:border-blue-300 transition-colors">
            <CardHeader className="pb-2">
              {cert.image_url && (
                <div 
                  className="group mb-4 h-32 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center relative cursor-pointer"
                  onClick={() => setSelectedImage(cert.image_url)}
                >
                  <img 
                    src={cert.image_url} 
                    alt={cert.title} 
                    className="h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                  />
                  {/* Hover Hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="text-slate-700 w-6 h-6" />
                  </div>
                </div>
              )}
              <CardTitle className="text-lg">{cert.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                {cert.issuer} 
                {cert.date_issued && (
                  <span className="text-xs text-slate-400 flex items-center ml-2">
                     • {cert.date_issued}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              {cert.credential_link && (
                <a href={cert.credential_link} target="_blank" className="text-sm font-medium text-blue-600 hover:underline flex items-center">
                  View Credential <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* --- FULL SCREEN MODAL --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)} // Click outside to close
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image */}
          <img 
            src={selectedImage} 
            alt="Full Screen" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Clicking image shouldn't close it
          />
        </div>
      )}
    </section>
  )
}