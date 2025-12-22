'use client'

import { useState, useEffect } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExternalLink, Award, X, Maximize2 } from 'lucide-react'

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!certificates || certificates.length === 0) return null

  return (
    <section className="pt-10">
      
      {/* --- STANDARDIZED HEADER (Matches Skills & Projects) --- */}
      <div className="flex items-end justify-between mb-12 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-500/10 rounded-lg">
              <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
             Certifications and Achievements
           </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id} className="group border border-border/50 bg-card/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <CardHeader className="p-0 shrink-0">
              {cert.image_url ? (
                <div 
                  className="h-40 bg-muted relative cursor-pointer overflow-hidden border-b border-border/50"
                  onClick={() => setSelectedImage(cert.image_url)}
                >
                  <img 
                    src={cert.image_url} 
                    alt={cert.title} 
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 duration-200" />
                  </div>
                </div>
              ) : (
                <div className="h-40 bg-muted border-b border-border/50 flex items-center justify-center text-muted-foreground">
                   <Award className="w-10 h-10 opacity-20" />
                </div>
              )}
              
              <div className="p-5">
                {/* Fixed Height Title */}
                <CardTitle className="text-base font-bold text-foreground leading-tight mb-2 line-clamp-2 h-[3rem] flex items-center" title={cert.title}>
                  {cert.title}
                </CardTitle>
                <CardDescription className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">{cert.issuer}</span>
                  <span>{cert.date_issued}</span>
                </CardDescription>
              </div>
            </CardHeader>
            
            <div className="flex-grow"></div>

            <CardFooter className="px-5 pb-5 pt-0 justify-end">
              {cert.credential_link && (
                <a 
                  href={cert.credential_link} 
                  target="_blank" 
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 uppercase tracking-wide transition-colors"
                >
                  Verify Credential <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-foreground/50 hover:text-foreground transition-colors p-2 hover:bg-background/10 rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <img 
            src={selectedImage} 
            alt="Certificate View" 
            className="w-auto h-auto max-w-full max-h-full object-contain rounded shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </section>
  )
}