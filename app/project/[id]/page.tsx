import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'

// Define what the params look like (It's a Promise now in Next.js 15)
type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectPage(props: PageProps) {
  // 1. AWAIT the params to get the ID
  const { id } = await props.params
  
  // 2. Fetch the specific project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  // Debugging: If it fails, check your VS Code terminal to see why
  if (error) {
    console.error("Supabase Error:", error)
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="text-slate-500">ID searched: {id}</p>
        <Link href="/" className="text-blue-500 underline">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* Top Navigation */}
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900">
            {project.title}
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">
            {project.summary}
          </p>

          <div className="flex flex-wrap gap-4">
            {project.repo_link && (
              <a href={project.repo_link} target="_blank">
                <Button variant="outline">
                  <Github className="mr-2 h-4 w-4" /> View Source
                </Button>
              </a>
            )}
            {project.demo_link && (
              <a href={project.demo_link} target="_blank">
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Hero Image */}
        {project.image_url && (
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-12">
            <img 
              src={project.image_url} 
              alt={project.title} 
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Markdown Content - With Tailwind Typography */}
        <article className="prose prose-slate lg:prose-lg max-w-none">
          <ReactMarkdown>{project.content || ''}</ReactMarkdown>
        </article>

      </main>
    </div>
  )
}