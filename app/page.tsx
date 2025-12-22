import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Github, Download, Linkedin, Twitter, Terminal, Award, FolderKanban, XCircle, Mail } from 'lucide-react'
import CertificatesSection from '@/components/CertificatesSection'
import ProjectsGrid from '@/components/ProjectsGrid' 
import SkillsSection from '@/components/SkillsSection' 
import { ModeToggle } from '@/components/mode-toggle'
import { ScrollToTop } from '@/components/scroll-to-top'

export const revalidate = 0 

const ensureHttp = (url: string) => {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export default async function Home() {
  
  const [profileData, projectsData, certsData, skillsData] = await Promise.all([
    supabase.from('profile').select('*').single(),
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').order('date_issued', { ascending: false }),
    supabase.from('skills').select('*').order('created_at', { ascending: true }) 
  ])

  const profile = profileData.data
  const projects = projectsData.data || [] 
  const certificates = certsData.data || []
  const skills = skillsData.data || [] 
  
  const socials = profile?.social_links || {}

  // Get first letter for fallback avatar (default to 'M' if missing)
  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "M"

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-blue-500/20">
      
      {/* Tech Background Grid */}
      <div className="fixed inset-0 z-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 max-w-6xl mx-auto py-20 md:py-32 px-6">
        
        {/* TOP RIGHT ICONS */}
        <div className="absolute top-6 right-6 flex items-center gap-6 z-50">
           <div className="flex items-center gap-4 border-r border-border pr-6">
              {socials.github && (
                <a href={ensureHttp(socials.github)} target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                  <Github className="w-5 h-5" />
                </a>
              )}
              {socials.linkedin && (
                <a href={ensureHttp(socials.linkedin)} target="_blank" className="text-muted-foreground hover:text-blue-600 transition-all hover:scale-110">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {socials.twitter && (
                <a href={ensureHttp(socials.twitter)} target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              <a href="mailto:mugilanyoganandh@gmail.com" className="text-muted-foreground hover:text-red-500 transition-all hover:scale-110">
                 <Mail className="w-5 h-5" />
              </a>
           </div>
           <ModeToggle />
        </div>

        {/* --- SPLIT LAYOUT FOR TEXT & AVATAR --- */}
        <div className="flex flex-col-reverse md:flex-row gap-12 items-center justify-between mb-12">
          
          {/* LEFT: TEXT */}
          <div className="flex-1 text-center md:text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
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
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mx-auto md:mx-0">
                {profile?.bio || "Engineering intelligent systems. Check /admin to update."}
              </p>
          </div>

          {/* RIGHT: AVATAR */}
          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000 shrink-0">
            {profile?.avatar_url ? (
               <>
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200"></div>
                 <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-background shadow-2xl relative z-10">
                   <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
                 </div>
               </>
            ) : (
               <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-background shadow-2xl relative z-10 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                  <span className="text-7xl font-bold text-white drop-shadow-md relative z-10 select-none">
                    {initial}
                  </span>
               </div>
            )}
          </div>
        </div>

        {/* --- BUTTONS: NOW FULL WIDTH & CENTERED BELOW SPLIT --- */}
        <div className="w-full flex flex-wrap gap-3 justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <Link href="#projects">
                 <Button size="lg" className="h-12 px-6 text-base bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/10 font-bold">
                   <FolderKanban className="mr-2 h-5 w-5" /> View Projects
                 </Button>
              </Link>

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
      </header>

      {/* --- SKILLS SECTION (ADDED 'relative z-10' HERE) --- */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-12">
        <SkillsSection skills={skills} />
      </div>

      {/* --- PROJECTS GRID --- */}
      <main id="projects" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
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

        <ProjectsGrid projects={projects} />

        {/* --- CERTIFICATES SECTION --- */}
        <div id="certificates" className="scroll-mt-24">
           <CertificatesSection certificates={certificates} />
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-xl relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center gap-4 text-sm text-muted-foreground">
          <p className="font-mono text-center">© {new Date().getFullYear()} {profile?.full_name}</p>
        </div>
      </footer>
      
      <ScrollToTop />
    </div>
  )
}