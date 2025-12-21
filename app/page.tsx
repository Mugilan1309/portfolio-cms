import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, Download, Linkedin, Twitter, ArrowRight, Terminal, Award, FolderKanban, XCircle, BriefcaseBusiness } from 'lucide-react'
import CertificatesSection from '@/components/CertificatesSection'
import ProjectsGrid from '@/components/ProjectsGrid' 
import { ModeToggle } from '@/components/mode-toggle'
import { ScrollToTop } from '@/components/scroll-to-top'

export const revalidate = 0 

export default async function Home() {
  
  const [profileData, projectsData, certsData] = await Promise.all([
    supabase.from('profile').select('*').single(),
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').order('date_issued', { ascending: false })
  ])

  const profile = profileData.data
  const projects = projectsData.data || [] 
  const certificates = certsData.data || []
  
  const socials = profile?.social_links || {}

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-blue-500/20">
      
      {/* Tech Background Grid */}
      <div className="fixed inset-0 z-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 max-w-6xl mx-auto py-20 md:py-32 px-6">
        
        <div className="absolute top-6 right-6 flex items-center gap-4">
           <ModeToggle />
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-12 items-center md:items-start justify-between">
          <div className="flex-1 text-center md:text-left space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium border border-blue-500/20">
                <Terminal className="w-3 h-3" />
                <span>{profile?.headline || "AI System Architect"}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Hi, I'm <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 animate-gradient">
                  {profile?.full_name || "Your Name"}
                </span>.
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mx-auto md:mx-0">
              {profile?.bio || "Engineering intelligent systems. Check /admin to update."}
            </p>
            
            {/* Action Buttons - POLISHED & SYMMETRIC */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              
              {/* 1. PRIMARY: View Projects (Solid Color) */}
              <Link href="#projects">
                 <Button size="lg" className="h-12 px-6 text-base bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/10 font-bold">
                   <FolderKanban className="mr-2 h-5 w-5" /> View Projects
                 </Button>
              </Link>

              {/* 2. SECONDARY GROUP: Certs & Resume (Identical "Glass/Soft" Style) */}
              <Link href="#certificates">
                 <Button variant="secondary" size="lg" className="h-12 px-6 text-base bg-secondary/50 hover:bg-secondary border border-border/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                   <Award className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" /> Certifications
                 </Button>
              </Link>

              {profile?.resume_url ? (
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="lg" className="h-12 px-6 text-base bg-secondary/50 hover:bg-secondary border border-border/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                      <Download className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" /> Resume
                    </Button>
                  </a>
              ) : (
                  <Button variant="secondary" size="lg" disabled className="h-12 px-6 text-base bg-secondary/20 border-dashed border-red-500/30 text-muted-foreground opacity-70">
                    <XCircle className="mr-2 h-5 w-5 text-red-500" /> No Resume
                  </Button>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex gap-6 justify-center md:justify-start pt-4">
              {socials.github && (
                <a href={socials.github} target="_blank" className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-200">
                  <Github className="w-6 h-6" />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" className="text-muted-foreground hover:text-blue-600 transition-colors transform hover:scale-110 duration-200">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-200">
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>

          {/* Profile Picture */}
          {profile?.avatar_url && (
            <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200"></div>
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-background shadow-2xl relative z-10">
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* --- PROJECTS GRID --- */}
      <main id="projects" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-12 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
                <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
             </div>
             <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
               Projects
             </h2>
          </div>
          <span className="hidden md:block text-muted-foreground font-mono text-sm bg-muted px-2 py-1 rounded">
            {projects?.length || 0} Total
          </span>
        </div>

        {/* Interactive Grid Component */}
        <ProjectsGrid projects={projects} />

        {/* --- CERTIFICATES SECTION --- */}
        <div id="certificates" className="scroll-mt-24">
           <CertificatesSection certificates={certificates} />
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-xl relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p className="font-mono">© {new Date().getFullYear()} {profile?.full_name}</p>
          <div className="flex items-center gap-6">
            <a href="mailto:mugilanyoganandh@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
    </div>
  )
}