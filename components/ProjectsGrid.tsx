'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, X, Maximize2, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function ProjectsGrid({ projects }: { projects: any[] }) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
        {projects?.map((project) => (
          <Card 
            key={project.id} 
            className="group border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-blue-500/30 cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            {/* Image Area */}
            {project.image_url ? (
              <div className="h-56 overflow-hidden bg-muted relative shrink-0">
                 <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors z-10 flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 duration-300 drop-shadow-md" />
                 </div>
                 <img src={project.image_url} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />
              </div>
            ) : (
              <div className="h-56 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden flex items-center justify-center p-6 text-center group-hover:brightness-110 transition-all shrink-0">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                <h3 className="relative z-10 text-white font-bold text-2xl tracking-tight leading-tight drop-shadow-lg line-clamp-3">
                  {project.title}
                </h3>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-20 flex items-center justify-center">
                   <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 duration-300" />
                </div>
              </div>
            )}
            
            <CardHeader className="space-y-3 pb-3">
              <div className="flex flex-wrap gap-2">
                {project.tags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10">
                    {tag}
                  </Badge>
                ))}
              </div>
              {/* FIXED HEIGHT TITLE FOR ALIGNMENT */}
              <CardTitle className="text-2xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 h-[4rem] flex items-center">
                  {project.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <CardDescription className="text-muted-foreground text-base leading-relaxed line-clamp-3">
                {project.summary}
              </CardDescription>
            </CardContent>
            
            <CardFooter className="pt-4 pb-6">
               <span className="group/link inline-flex items-center text-sm font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Read More 
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
               </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal remains the same... */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {selectedProject.image_url ? (
               <div className="h-48 sm:h-64 w-full relative shrink-0">
                  <img src={selectedProject.image_url} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
               </div>
            ) : (
               <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0 flex items-center justify-center relative overflow-hidden">
                  <h3 className="text-white font-bold text-3xl opacity-20 scale-150 absolute select-none">{selectedProject.title}</h3>
               </div>
            )}

            <div className="p-6 sm:p-8 overflow-y-auto">
               <div className="space-y-4">
                 <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">{selectedProject.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedProject.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                 </div>

                 <div className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed">
                    <p>{selectedProject.summary}</p>
                 </div>

                 <div className="flex flex-wrap gap-3 pt-6 border-t border-border/50 mt-6">
                    <Link href={`/project/${selectedProject.id}`} className="flex-1 sm:flex-none">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        Full Details <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    {selectedProject.demo_link && (
                      <a href={selectedProject.demo_link} target="_blank" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full gap-2"><ExternalLink className="w-4 h-4" /> Demo</Button>
                      </a>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}