import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Github, ExternalLink, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { ModeToggle } from '@/components/mode-toggle'

// This ensures we can get the ID properly in Next.js 15
export const revalidate = 0 

// Updated Interface for Next.js 15 Params
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  // Await the params object (New requirement in Next.js 15)
  const resolvedParams = await params
  const { id } = resolvedParams

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()

  if (!project) return <div className="p-20 text-center text-muted-foreground">Project not found</div>

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-blue-500/20">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 bg-background/50 backdrop-blur-md border-b border-border/40">
        <Link href="/">
           <Button variant="ghost" className="hover:bg-background/80 gap-2">
             <ArrowLeft className="w-4 h-4" /> Back to Projects
           </Button>
        </Link>
        <ModeToggle />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto pt-28 px-6 pb-20">
        
        {/* --- HEADER --- */}
        <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           
           {/* Date & Title */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                 <Calendar className="w-4 h-4" />
                 <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {project.title}
              </h1>
           </div>

           {/* Tags */}
           <div className="flex flex-wrap gap-2">
              {project.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10 px-3 py-1">
                  {tag}
                </Badge>
              ))}
           </div>

           {/* Buttons */}
           <div className="flex flex-wrap gap-3 pt-2">
              {project.demo_link && (
                 <a href={project.demo_link} target="_blank">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                      <ExternalLink className="mr-2 w-4 h-4" /> Live Demo
                    </Button>
                 </a>
              )}
              {project.repo_link && (
                 <a href={project.repo_link} target="_blank">
                    <Button variant="outline" className="border-border hover:bg-accent hover:text-accent-foreground">
                      <Github className="mr-2 w-4 h-4" /> View Code
                    </Button>
                 </a>
              )}
           </div>
        </div>

        {/* --- HERO IMAGE --- */}
        {project.image_url && (
           <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl mb-12 bg-muted animate-in fade-in zoom-in-95 duration-700 delay-100">
              <img src={project.image_url} alt={project.title} className="w-full h-auto object-cover" />
           </div>
        )}

        {/* --- MARKDOWN CONTENT --- */}
        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight 
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border/50
          prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        ">
          <ReactMarkdown>{project.content || "_No content added yet._"}</ReactMarkdown>
        </article>

      </main>
    </div>
  )
}