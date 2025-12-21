'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, LogOut, ExternalLink, Copy, Image as ImageIcon, LayoutDashboard, Plus, Save, Eye, XCircle } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Data Lists
  const [projects, setProjects] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])

  // Edit Mode States
  const [editingProjId, setEditingProjId] = useState<string | null>(null)
  const [editingCertId, setEditingCertId] = useState<string | null>(null)

  // --- PROJECT FORM STATES ---
  const [projTitle, setProjTitle] = useState('')
  const [projSummary, setProjSummary] = useState('')
  const [projContent, setProjContent] = useState('')
  const [projTags, setProjTags] = useState('')
  const [projDemo, setProjDemo] = useState('')
  const [projRepo, setProjRepo] = useState('')
  const [projImage, setProjImage] = useState<File | null>(null)
  const [currentProjImageUrl, setCurrentProjImageUrl] = useState<string | null>(null)

  // --- CERTIFICATE FORM STATES ---
  const [certTitle, setCertTitle] = useState('')
  const [certIssuer, setCertIssuer] = useState('')
  const [certDate, setCertDate] = useState('')
  const [certLink, setCertLink] = useState('')
  const [certImage, setCertImage] = useState<File | null>(null)
  const [currentCertImageUrl, setCurrentCertImageUrl] = useState<string | null>(null)

  // --- PROFILE STATES ---
  const [profileId, setProfileId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null) 
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(null)
  
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')

  // --- HELPER MEDIA STATE ---
  const [helperFile, setHelperFile] = useState<File | null>(null)
  const [helperUrl, setHelperUrl] = useState('')
  const [helperLoading, setHelperLoading] = useState(false)

  // 1. FETCH ALL DATA ON LOAD
  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')

    const { data: pData } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (pData) setProjects(pData)

    const { data: cData } = await supabase.from('certificates').select('*').order('created_at', { ascending: false })
    if (cData) setCertificates(cData)

    const { data: profile } = await supabase.from('profile').select('*').single()
    if (profile) {
      setProfileId(profile.id)
      setFullName(profile.full_name || '')
      setHeadline(profile.headline || '')
      setBio(profile.bio || '')
      const socials = profile.social_links || {}
      setGithubUrl(socials.github || '')
      setLinkedinUrl(socials.linkedin || '')
      setTwitterUrl(socials.twitter || '')
      
      // SET CURRENT FILES
      setCurrentAvatarUrl(profile.avatar_url)
      setCurrentResumeUrl(profile.resume_url)
    }
  }

  useEffect(() => { fetchData() }, [router])

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // UPLOAD FILE HELPER
  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('portfolio-media').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('portfolio-media').getPublicUrl(fileName)
    return data.publicUrl
  }

  // --- QUICK MEDIA UPLOADER ---
  const handleQuickUpload = async () => {
    if (!helperFile) return
    setHelperLoading(true)
    try {
      const url = await uploadFile(helperFile)
      setHelperUrl(url)
    } catch (err: any) { alert(err.message) } 
    finally { setHelperLoading(false) }
  }

  // --- DELETE FIELD HELPER ---
  const removeField = async (table: string, id: string, field: string) => {
    if(!confirm("Are you sure you want to remove this file?")) return;
    await supabase.from(table).update({ [field]: null }).eq('id', id)
    fetchData()
  }

  // --- PROJECT LOGIC ---
  const handleEditProject = (project: any) => {
    setEditingProjId(project.id)
    setProjTitle(project.title)
    setProjSummary(project.summary || '')
    setProjContent(project.content || '')
    setProjTags(project.tags ? project.tags.join(', ') : '')
    setProjDemo(project.demo_link || '')
    setProjRepo(project.repo_link || '')
    setCurrentProjImageUrl(project.image_url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    fetchData()
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = undefined
      if (projImage) imageUrl = await uploadFile(projImage)

      const payload = {
        title: projTitle,
        summary: projSummary,
        content: projContent,
        tags: projTags.split(',').map(t => t.trim()),
        demo_link: projDemo,
        repo_link: projRepo,
        ...(imageUrl && { image_url: imageUrl })
      }

      if (editingProjId) {
        await supabase.from('projects').update(payload).eq('id', editingProjId)
        alert('Project Updated!')
        setEditingProjId(null)
      } else {
        await supabase.from('projects').insert({ ...payload, image_url: imageUrl || null })
        alert('Project Created!')
      }
      setProjTitle(''); setProjSummary(''); setProjContent(''); setProjTags(''); setProjImage(null); setProjDemo(''); setProjRepo(''); setCurrentProjImageUrl(null);
      fetchData()
    } catch (err: any) { alert(err.message) }
    setLoading(false)
  }

  // --- CERTIFICATE LOGIC ---
  const handleEditCert = (cert: any) => { 
    setEditingCertId(cert.id)
    setCertTitle(cert.title)
    setCertIssuer(cert.issuer || '')
    setCertDate(cert.date_issued || '')
    setCertLink(cert.credential_link || '')
    setCurrentCertImageUrl(cert.image_url) 
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }
  
  const handleDeleteCert = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('certificates').delete().eq('id', id); fetchData() }
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      let imageUrl = undefined; if (certImage) imageUrl = await uploadFile(certImage)
      const payload = { title: certTitle, issuer: certIssuer, date_issued: certDate, credential_link: certLink, ...(imageUrl && { image_url: imageUrl }) }
      if (editingCertId) { await supabase.from('certificates').update(payload).eq('id', editingCertId); alert('Updated!') } 
      else { await supabase.from('certificates').insert({ ...payload, image_url: imageUrl || null }); alert('Added!') }
      setCertTitle(''); setCertIssuer(''); setCertImage(null); fetchData()
    } catch (err: any) { alert(err.message) }
    setLoading(false)
  }

  // --- PROFILE LOGIC ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      let avatarUrl = undefined; let resumeUrl = undefined
      if (avatar) avatarUrl = await uploadFile(avatar); if (resume) resumeUrl = await uploadFile(resume)

      const updates = {
        full_name: fullName,
        headline,
        bio,
        social_links: { github: githubUrl, linkedin: linkedinUrl, twitter: twitterUrl }, 
        ...(avatarUrl && { avatar_url: avatarUrl }),
        ...(resumeUrl && { resume_url: resumeUrl })
      }

      if (profileId) { await supabase.from('profile').update(updates).eq('id', profileId) } else { await supabase.from('profile').insert(updates) }
      alert('Profile Updated!')
      fetchData() 
    } catch (err: any) { alert(err.message) }
    setLoading(false)
  }
  const cancelEdit = () => { setEditingProjId(null); setEditingCertId(null); setProjTitle(''); setProjSummary(''); setProjContent(''); setProjTags(''); setProjDemo(''); setProjRepo(''); setCurrentProjImageUrl(null); setCurrentCertImageUrl(null); }

  return (
    <div className="min-h-screen bg-background relative selection:bg-blue-500/20">
      <div className="fixed inset-0 z-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-lg">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-500/10 rounded-xl">
               <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
               <p className="text-sm text-muted-foreground">Manage your content securely</p>
             </div>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0 items-center">
            <ModeToggle />
            <Button variant="outline" size="sm" onClick={() => router.push('/')} className="hover:bg-accent border-border">
                <ExternalLink className="w-4 h-4 mr-2" /> View Live Site
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (FORMS) --- */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="projects" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">Projects</TabsTrigger>
                <TabsTrigger value="certificates" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">Certificates</TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">Profile</TabsTrigger>
              </TabsList>

              {/* === PROJECTS TAB === */}
              <TabsContent value="projects" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <Card className={`border border-border/50 bg-card/80 backdrop-blur-md shadow-xl ${editingProjId ? "ring-2 ring-blue-500/50" : ""}`}>
                  <CardHeader><CardTitle className="flex items-center gap-2">{editingProjId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {editingProjId ? "Edit Project" : "Add New Project"}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={projTitle} onChange={e=>setProjTitle(e.target.value)} required className="bg-background/50 border-border" /></div>
                      <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={projTags} onChange={e=>setProjTags(e.target.value)} placeholder="AI, React, Python" className="bg-background/50 border-border" /></div>
                      <div className="space-y-2"><Label>Summary</Label><Textarea value={projSummary} onChange={e=>setProjSummary(e.target.value)} className="bg-background/50 border-border" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Demo Link</Label><Input value={projDemo} onChange={e=>setProjDemo(e.target.value)} placeholder="https://..." className="bg-background/50 border-border" /></div>
                        <div className="space-y-2"><Label>GitHub Repo</Label><Input value={projRepo} onChange={e=>setProjRepo(e.target.value)} placeholder="https://github.com/..." className="bg-background/50 border-border" /></div>
                      </div>
                      <div className="space-y-2"><Label>Full Content (Markdown)</Label><Textarea className="h-64 font-mono text-sm bg-background/50 border-border" value={projContent} onChange={e=>setProjContent(e.target.value)} placeholder="# My Awesome Project..." /></div>
                      
                      <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <Input type="file" onChange={e=>setProjImage(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:text-primary" />
                        {currentProjImageUrl && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900">
                             <Eye className="w-4 h-4" /> <span>Current image saved</span>
                             <button type="button" onClick={() => removeField('projects', editingProjId!, 'image_url')} className="ml-auto text-red-500 text-xs hover:underline">Remove</button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4"><Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">{editingProjId ? 'Update Project' : 'Publish Project'}</Button>{editingProjId && <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>}</div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader><CardTitle>Manage Projects ({projects.length})</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow className="hover:bg-muted/50 border-border"><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>{projects.map((p) => (<TableRow key={p.id} className="hover:bg-muted/50 border-border"><TableCell className="font-medium">{p.title}</TableCell><TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" onClick={() => handleEditProject(p)} className="hover:bg-blue-500/10 hover:text-blue-600"><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => handleDeleteProject(p.id)} className="hover:bg-red-500/10 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* === CERTIFICATES TAB === */}
              <TabsContent value="certificates" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <Card className={`border border-border/50 bg-card/80 backdrop-blur-md shadow-xl ${editingCertId ? "ring-2 ring-blue-500/50" : ""}`}>
                  <CardHeader><CardTitle>{editingCertId ? "Edit Cert" : "Add Cert"}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleCertSubmit} className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={certTitle} onChange={e=>setCertTitle(e.target.value)} required className="bg-background/50 border-border" /></div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2"><Label>Issuer</Label><Input value={certIssuer} onChange={e=>setCertIssuer(e.target.value)} className="bg-background/50 border-border" /></div>
                         <div className="space-y-2"><Label>Date</Label><Input type="date" value={certDate} onChange={e=>setCertDate(e.target.value)} className="bg-background/50 border-border" /></div>
                      </div>
                      <div className="space-y-2"><Label>Credential Link</Label><Input value={certLink} onChange={e=>setCertLink(e.target.value)} className="bg-background/50 border-border" /></div>
                      
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <Input type="file" onChange={e=>setCertImage(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:text-primary" />
                        {currentCertImageUrl && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900">
                             <Eye className="w-4 h-4" /> <span>Current image saved</span>
                             <button type="button" onClick={() => removeField('certificates', editingCertId!, 'image_url')} className="ml-auto text-red-500 text-xs hover:underline">Remove</button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4"><Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">{editingCertId ? "Update" : "Add"}</Button>{editingCertId && <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>}</div>
                    </form>
                  </CardContent>
                </Card>
                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader><CardTitle>Manage Certificates ({certificates.length})</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow className="hover:bg-muted/50 border-border"><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>{certificates.map((c) => (<TableRow key={c.id} className="hover:bg-muted/50 border-border"><TableCell className="font-medium">{c.title}</TableCell><TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" onClick={() => handleEditCert(c)} className="hover:bg-blue-500/10 hover:text-blue-600"><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => handleDeleteCert(c.id)} className="hover:bg-red-500/10 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* === PROFILE TAB === */}
              <TabsContent value="profile" className="animate-in fade-in slide-in-from-left-4 duration-500">
                <Card className="border border-border/50 bg-card/80 backdrop-blur-md shadow-xl">
                  <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={e=>setFullName(e.target.value)} className="bg-background/50 border-border" /></div><div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={e=>setHeadline(e.target.value)} className="bg-background/50 border-border" /></div></div>
                      <div className="space-y-2"><Label>Bio</Label><Textarea className="h-24 bg-background/50 border-border" value={bio} onChange={e=>setBio(e.target.value)} /></div>
                      
                      {/* --- SOCIAL LINKS --- */}
                      <div className="space-y-3 pt-2">
                        <Label className="text-muted-foreground font-bold">Social Links</Label>
                        <div className="grid grid-cols-3 gap-3">
                           <div className="space-y-1"><Label className="text-xs">GitHub</Label><Input value={githubUrl} onChange={e=>setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="bg-background/50 border-border" /></div>
                           <div className="space-y-1"><Label className="text-xs">LinkedIn</Label><Input value={linkedinUrl} onChange={e=>setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className="bg-background/50 border-border" /></div>
                           <div className="space-y-1"><Label className="text-xs">Twitter/X</Label><Input value={twitterUrl} onChange={e=>setTwitterUrl(e.target.value)} placeholder="https://x.com/..." className="bg-background/50 border-border" /></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="space-y-2">
                            <Label>Profile Picture</Label>
                            <Input type="file" onChange={e=>setAvatar(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:text-primary" />
                            {currentAvatarUrl ? (
                              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900 mt-1">
                                 <Eye className="w-4 h-4" /> 
                                 <a href={currentAvatarUrl} target="_blank" className="hover:underline font-medium">View Saved Avatar</a>
                                 <button type="button" onClick={() => removeField('profile', profileId!, 'avatar_url')} className="ml-auto text-red-500 text-xs hover:underline flex items-center"><XCircle className="w-3 h-3 mr-1"/> Remove</button>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">No avatar uploaded.</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Resume (PDF)</Label>
                            <Input type="file" onChange={e=>setResume(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:text-primary" />
                            {currentResumeUrl ? (
                              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900 mt-1">
                                 <Eye className="w-4 h-4" /> 
                                 <a href={currentResumeUrl} target="_blank" className="hover:underline font-medium">View Saved Resume</a>
                                 <button type="button" onClick={() => removeField('profile', profileId!, 'resume_url')} className="ml-auto text-red-500 text-xs hover:underline flex items-center"><XCircle className="w-3 h-3 mr-1"/> Remove</button>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">No resume uploaded.</p>
                            )}
                          </div>
                      </div>
                      <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"><Save className="w-4 h-4 mr-2" /> Save Profile</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* --- RIGHT COLUMN (MEDIA HELPER) --- */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full"></div>
              <CardHeader className="relative z-10"><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Media Helper</CardTitle><CardDescription className="text-slate-400">Upload screenshots here to get a link for your Markdown content.</CardDescription></CardHeader>
              <CardContent className="space-y-4 relative z-10">
                  <Input type="file" className="bg-slate-800 border-slate-700 text-white file:text-white cursor-pointer" onChange={e => setHelperFile(e.target.files?.[0] || null)} />
                  <Button onClick={handleQuickUpload} variant="secondary" className="w-full" disabled={!helperFile || helperLoading}>{helperLoading ? 'Uploading...' : 'Upload & Get Link'}</Button>
                  {helperUrl && (<div className="mt-4 p-3 bg-slate-800 rounded-md break-all"><p className="text-xs text-slate-400 mb-1">Copy this into Content:</p><code className="text-xs text-green-400 select-all block mb-2">![Screenshot]({helperUrl})</code><Button size="sm" variant="ghost" className="w-full h-6 text-xs hover:bg-slate-700" onClick={() => navigator.clipboard.writeText(`![Screenshot](${helperUrl})`)}><Copy className="w-3 h-3 mr-2" /> Copy Markdown</Button></div>)}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}