import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, Download, Linkedin, Twitter } from 'lucide-react'
import CertificatesSection from '@/components/CertificatesSection' // <--- IMPORT THIS

export const revalidate = 0 

export default async function Home() {
  
  const [profileData, projectsData, certsData] = await Promise.all([
    supabase.from('profile').select('*').single(),
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').order('date_issued', { ascending: false })
  ])

  const profile = profileData.data
  const projects = projectsData.data
  const certificates = certsData.data || [] // Ensure it's an array
  
  const socials = profile?.social_links || {}

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- HERO SECTION --- */}
      <header className="max-w-5xl mx-auto py-24 px-6 flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1">
          <Badge variant="outline" className="mb-4 text-slate-500 border-slate-400">
            {profile?.headline || "AI & Data Science Student"}
          </Badge>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Hi, I'm <span className="text-blue-600">{profile?.full_name || "Your Name"}</span>.
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed mb-6">
            {profile?.bio || "I'm building intelligent systems. Upload your bio in /admin!"}
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-4 mb-8">
            {socials.github && (
              <a href={socials.github} target="_blank" className="text-slate-500 hover:text-black transition-colors">
                <Github className="w-6 h-6" />
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" className="text-slate-500 hover:text-blue-700 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" className="text-slate-500 hover:text-black transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
            )}
          </div>

          <div className="flex gap-4">
            <Link href="#projects">
               <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-700">View Work</Button>
            </Link>
            
            {profile?.resume_url && (
              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  <Download className="mr-2 h-4 w-4" /> Download Resume
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        {profile?.avatar_url && (
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0">
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      {/* --- PROJECTS GRID --- */}
      <main id="projects" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          Selected Projects <span className="text-sm font-normal text-slate-400 ml-2">({projects?.length || 0})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {projects?.map((project) => (
            <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden flex flex-col">
              {project.image_url && (
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                   <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                  <Link href={`/project/${project.id}`}>{project.title}</Link>
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags?.slice(0, 3).map((tag: string) => (<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>))}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-slate-600 text-base line-clamp-3">{project.summary}</CardDescription>
              </CardContent>
              <CardFooter className="border-t pt-4">
                 <Link href={`/project/${project.id}`} className="text-sm font-bold text-blue-600 hover:underline">Read Case Study →</Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* --- CERTIFICATES SECTION (Now handled by the new component) --- */}
        <CertificatesSection certificates={certificates} />

      </main>
    </div>
  )
}