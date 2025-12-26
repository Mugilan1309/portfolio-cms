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
import { Pencil, Trash2, LogOut, ExternalLink, Copy, Image as ImageIcon, LayoutDashboard, Plus, Save, Eye, XCircle, GripVertical } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

// --- DND KIT IMPORTS ---
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- SORTABLE ROW COMPONENT ---
function SortableRow({ id, children }: { id: string, children: (args: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as 'relative',
    zIndex: isDragging ? 999 : 'auto',
  }

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-blue-50 dark:bg-blue-900/20 shadow-xl border-blue-500" : ""}>
      {children({ attributes, listeners })}
    </TableRow>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Data Lists
  const [projects, setProjects] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([]) 

  // Edit Mode States
  const [editingProjId, setEditingProjId] = useState<string | null>(null)
  const [editingCertId, setEditingCertId] = useState<string | null>(null)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null) 

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

  // --- SKILL FORM STATES ---
  const [skillCategory, setSkillCategory] = useState('')
  const [skillItems, setSkillItems] = useState('')

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

  // --- DND SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // 1. FETCH ALL DATA ON LOAD
  const fetchData = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
      await supabase.auth.signOut() 
      router.push('/login')
      return
    }

    const { data: pData } = await supabase.from('projects').select('*').order('order_index', { ascending: true })
    if (pData) setProjects(pData)

    const { data: cData } = await supabase.from('certificates').select('*').order('order_index', { ascending: true })
    if (cData) setCertificates(cData)

    const { data: sData } = await supabase.from('skills').select('*').order('order_index', { ascending: true })
    if (sData) setSkills(sData)

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
      setCurrentAvatarUrl(profile.avatar_url)
      setCurrentResumeUrl(profile.resume_url)
    }
  }

  useEffect(() => { fetchData() }, [router])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  // UPLOAD FILE HELPER
  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('portfolio-media').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('portfolio-media').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleQuickUpload = async () => {
    if (!helperFile) return
    setHelperLoading(true)
    try { const url = await uploadFile(helperFile); setHelperUrl(url) } catch (err: any) { alert(err.message) } finally { setHelperLoading(false) }
  }

  const removeField = async (table: string, id: string, field: string) => {
    if(!confirm("Are you sure you want to remove this file?")) return;
    await supabase.from(table).update({ [field]: null }).eq('id', id)
    fetchData()
  }

  // --- REORDERING LOGIC ---
  const handleDragEnd = async (event: DragEndEvent, list: any[], setList: Function, tableName: string) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = list.findIndex((item) => item.id === active.id)
    const newIndex = list.findIndex((item) => item.id === over.id)
    
    const newOrder = arrayMove(list, oldIndex, newIndex)
    setList(newOrder)

    try {
        const updates = newOrder.map((item, index) => ({ id: item.id, order_index: index }))
        await Promise.all(updates.map(update => supabase.from(tableName).update({ order_index: update.order_index }).eq('id', update.id)))
    } catch (error) { console.error("Error saving order:", error); alert("Failed to save new order.") }
  }

  // --- SUBMIT HANDLERS ---
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      let imageUrl = undefined; if (projImage) imageUrl = await uploadFile(projImage)
      const payload = { title: projTitle, summary: projSummary, content: projContent, tags: projTags.split(',').map(t => t.trim()), demo_link: projDemo, repo_link: projRepo, ...(imageUrl && { image_url: imageUrl }) }
      if (editingProjId) { await supabase.from('projects').update(payload).eq('id', editingProjId); alert('Updated!'); setEditingProjId(null) } 
      else { await supabase.from('projects').insert({ ...payload, image_url: imageUrl || null, order_index: projects.length }); alert('Created!') }
      setProjTitle(''); setProjSummary(''); setProjContent(''); setProjTags(''); setProjImage(null); setProjDemo(''); setProjRepo(''); setCurrentProjImageUrl(null); fetchData()
    } catch (err: any) { alert(err.message) } setLoading(false)
  }

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      let imageUrl = undefined; if (certImage) imageUrl = await uploadFile(certImage)
      const payload = { title: certTitle, issuer: certIssuer, date_issued: certDate, credential_link: certLink, ...(imageUrl && { image_url: imageUrl }) }
      if (editingCertId) { await supabase.from('certificates').update(payload).eq('id', editingCertId); alert('Updated!') } 
      else { await supabase.from('certificates').insert({ ...payload, image_url: imageUrl || null, order_index: certificates.length }); alert('Added!') }
      setCertTitle(''); setCertIssuer(''); setCertImage(null); fetchData()
    } catch (err: any) { alert(err.message) } setLoading(false)
  }

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
        const payload = { category: skillCategory, items: skillItems }
        if (editingSkillId) { await supabase.from('skills').update(payload).eq('id', editingSkillId); alert('Updated!') } 
        else { await supabase.from('skills').insert({ ...payload, order_index: skills.length }); alert('Added!') }
        setSkillCategory(''); setSkillItems(''); setEditingSkillId(null); fetchData()
    } catch (err: any) { alert(err.message) } setLoading(false)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      let avatarUrl = undefined; let resumeUrl = undefined
      if (avatar) avatarUrl = await uploadFile(avatar); if (resume) resumeUrl = await uploadFile(resume)
      const updates = { full_name: fullName, headline, bio, social_links: { github: githubUrl, linkedin: linkedinUrl, twitter: twitterUrl }, ...(avatarUrl && { avatar_url: avatarUrl }), ...(resumeUrl && { resume_url: resumeUrl }) }
      if (profileId) { await supabase.from('profile').update(updates).eq('id', profileId) } else { await supabase.from('profile').insert(updates) }
      alert('Updated!'); fetchData() 
    } catch (err: any) { alert(err.message) } setLoading(false)
  }

  const cancelEdit = () => { setEditingProjId(null); setEditingCertId(null); setEditingSkillId(null); setProjTitle(''); setProjSummary(''); setProjContent(''); setProjTags(''); setProjDemo(''); setProjRepo(''); setCurrentProjImageUrl(null); setCurrentCertImageUrl(null); setSkillCategory(''); setSkillItems(''); }
  const handleEditProject = (project: any) => { setEditingProjId(project.id); setProjTitle(project.title); setProjSummary(project.summary || ''); setProjContent(project.content || ''); setProjTags(project.tags ? project.tags.join(', ') : ''); setProjDemo(project.demo_link || ''); setProjRepo(project.repo_link || ''); setCurrentProjImageUrl(project.image_url); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleDeleteProject = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('projects').delete().eq('id', id); fetchData() }
  const handleEditCert = (cert: any) => { setEditingCertId(cert.id); setCertTitle(cert.title); setCertIssuer(cert.issuer || ''); setCertDate(cert.date_issued || ''); setCertLink(cert.credential_link || ''); setCurrentCertImageUrl(cert.image_url); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleDeleteCert = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('certificates').delete().eq('id', id); fetchData() }
  const handleEditSkill = (skill: any) => { setEditingSkillId(skill.id); setSkillCategory(skill.category); setSkillItems(skill.items); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleDeleteSkill = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('skills').delete().eq('id', id); fetchData() }

  return (
    <div className="min-h-screen bg-background relative selection:bg-blue-500/20">
      <div className="fixed inset-0 z-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-lg">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-500/10 rounded-xl"><LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
             <div><h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1><p className="text-sm text-muted-foreground">Manage your content securely</p></div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0 items-center">
            <ModeToggle />
            <Button variant="outline" size="sm" onClick={() => router.push('/')} className="hover:bg-accent border-border"><ExternalLink className="w-4 h-4 mr-2" /> View Live Site</Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="projects">Projects</TabsTrigger><TabsTrigger value="skills">Skills</TabsTrigger><TabsTrigger value="certificates">Certifications</TabsTrigger><TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              {/* PROJECTS */}
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
                      <div className="space-y-2"><Label>Full Content (Markdown)</Label><Textarea className="h-64 font-mono text-sm bg-background/50 border-border" value={projContent} onChange={e=>setProjContent(e.target.value)} /></div>
                      {/* Fixed Cursor */}
                      <div className="space-y-2"><Label>Cover Image</Label><Input type="file" onChange={e=>setProjImage(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:cursor-pointer file:text-primary" />{currentProjImageUrl && (<div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900"><Eye className="w-4 h-4" /> <span>Current image saved</span><button type="button" onClick={() => removeField('projects', editingProjId!, 'image_url')} className="ml-auto text-red-500 text-xs hover:underline">Remove</button></div>)}</div>
                      <div className="flex gap-2 pt-4"><Button disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">{editingProjId ? 'Update Project' : 'Publish Project'}</Button>{editingProjId && (<Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">Cancel</Button>)}</div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader><CardTitle>Manage Projects ({projects.length})</CardTitle><CardDescription>Drag the handle to reorder.</CardDescription></CardHeader>
                  <CardContent>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, projects, setProjects, 'projects')}>
                          <Table>
                              <TableHeader><TableRow className="hover:bg-muted/50 border-border"><TableHead className="w-[50px]"></TableHead><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                      {projects.map((p) => (
                                          <SortableRow key={p.id} id={p.id}>
                                              {({ attributes, listeners }: any) => (
                                                <>
                                                  <TableCell className="w-[50px]">
                                                      <div {...attributes} {...listeners} className="cursor-grab touch-none p-2">
                                                          <GripVertical className="w-5 h-5 text-muted-foreground" />
                                                      </div>
                                                  </TableCell>
                                                  <TableCell className="font-medium">{p.title}</TableCell>
                                                  <TableCell className="text-right space-x-2">
                                                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditProject(p); }} className="hover:bg-blue-500/10 hover:text-blue-600 relative z-50"><Pencil className="h-4 w-4" /></Button>
                                                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className="hover:bg-red-500/10 hover:text-red-600 relative z-50"><Trash2 className="h-4 w-4" /></Button>
                                                  </TableCell>
                                                </>
                                              )}
                                          </SortableRow>
                                      ))}
                                  </SortableContext>
                              </TableBody>
                          </Table>
                      </DndContext>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SKILLS */}
              <TabsContent value="skills" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <Card className={`border border-border/50 bg-card/80 backdrop-blur-md shadow-xl ${editingSkillId ? "ring-2 ring-blue-500/50" : ""}`}>
                   <CardHeader><CardTitle className="flex items-center gap-2">{editingSkillId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {editingSkillId ? "Edit Skill Group" : "Add Skill Group"}</CardTitle></CardHeader>
                   <CardContent>
                      <form onSubmit={handleSkillSubmit} className="space-y-4">
                         <div className="space-y-2"><Label>Category Name</Label><Input value={skillCategory} onChange={e=>setSkillCategory(e.target.value)} required className="bg-background/50 border-border" /></div>
                         <div className="space-y-2"><Label>Skills List</Label><Textarea value={skillItems} onChange={e=>setSkillItems(e.target.value)} required className="bg-background/50 border-border h-24" /></div>
                         <div className="flex gap-2 pt-4"><Button disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">{editingSkillId ? "Update Skills" : "Add Skills"}</Button>{editingSkillId && (<Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">Cancel</Button>)}</div>
                      </form>
                   </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                   <CardHeader><CardTitle>Manage Skills ({skills.length})</CardTitle><CardDescription>Drag to reorder.</CardDescription></CardHeader>
                   <CardContent>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, skills, setSkills, 'skills')}>
                          <Table>
                              <TableHeader><TableRow className="hover:bg-muted/50 border-border"><TableHead className="w-[50px]"></TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                      {skills.map((s) => (
                                          <SortableRow key={s.id} id={s.id}>
                                              {({ attributes, listeners }: any) => (
                                                <>
                                                  <TableCell className="w-[50px]">
                                                      <div {...attributes} {...listeners} className="cursor-grab touch-none p-2"><GripVertical className="w-5 h-5 text-muted-foreground" /></div>
                                                  </TableCell>
                                                  <TableCell className="font-medium"><div className="font-bold">{s.category}</div><div className="text-xs text-muted-foreground truncate max-w-[200px]">{s.items}</div></TableCell>
                                                  <TableCell className="text-right space-x-2">
                                                      <Button size="icon" variant="ghost" onClick={(e) => {e.stopPropagation(); handleEditSkill(s)}} className="hover:bg-blue-500/10 hover:text-blue-600"><Pencil className="h-4 w-4" /></Button>
                                                      <Button size="icon" variant="ghost" onClick={(e) => {e.stopPropagation(); handleDeleteSkill(s.id)}} className="hover:bg-red-500/10 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                                  </TableCell>
                                                </>
                                              )}
                                          </SortableRow>
                                      ))}
                                  </SortableContext>
                              </TableBody>
                          </Table>
                      </DndContext>
                   </CardContent>
                </Card>
              </TabsContent>

              {/* CERTIFICATES */}
              <TabsContent value="certificates" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <Card className={`border border-border/50 bg-card/80 backdrop-blur-md shadow-xl ${editingCertId ? "ring-2 ring-blue-500/50" : ""}`}>
                  <CardHeader><CardTitle>{editingCertId ? "Edit Cert" : "Add Cert"}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleCertSubmit} className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={certTitle} onChange={e=>setCertTitle(e.target.value)} required className="bg-background/50 border-border" /></div>
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Issuer</Label><Input value={certIssuer} onChange={e=>setCertIssuer(e.target.value)} className="bg-background/50 border-border" /></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={certDate} onChange={e=>setCertDate(e.target.value)} className="bg-background/50 border-border" /></div></div>
                      <div className="space-y-2"><Label>Credential Link</Label><Input value={certLink} onChange={e=>setCertLink(e.target.value)} className="bg-background/50 border-border" /></div>
                      {/* Fixed Cursor */}
                      <div className="space-y-2"><Label>Image</Label><Input type="file" onChange={e=>setCertImage(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:cursor-pointer file:text-primary" />{currentCertImageUrl && (<div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900"><Eye className="w-4 h-4" /> <span>Current image saved</span><button type="button" onClick={() => removeField('certificates', editingCertId!, 'image_url')} className="ml-auto text-red-500 text-xs hover:underline">Remove</button></div>)}</div>
                      <div className="flex gap-2 pt-4"><Button disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">{editingCertId ? "Update" : "Add"}</Button>{editingCertId && (<Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">Cancel</Button>)}</div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader><CardTitle>Manage Certificates ({certificates.length})</CardTitle><CardDescription>Drag to reorder.</CardDescription></CardHeader>
                  <CardContent>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, certificates, setCertificates, 'certificates')}>
                          <Table>
                              <TableHeader><TableRow className="hover:bg-muted/50 border-border"><TableHead className="w-[50px]"></TableHead><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  <SortableContext items={certificates.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                      {certificates.map((c) => (
                                          <SortableRow key={c.id} id={c.id}>
                                              {({ attributes, listeners }: any) => (
                                                <>
                                                  <TableCell className="w-[50px]">
                                                      <div {...attributes} {...listeners} className="cursor-grab touch-none p-2"><GripVertical className="w-5 h-5 text-muted-foreground" /></div>
                                                  </TableCell>
                                                  <TableCell className="font-medium">{c.title}</TableCell>
                                                  <TableCell className="text-right space-x-2">
                                                      <Button size="icon" variant="ghost" onClick={(e) => {e.stopPropagation(); handleEditCert(c)}} className="hover:bg-blue-500/10 hover:text-blue-600"><Pencil className="h-4 w-4" /></Button>
                                                      <Button size="icon" variant="ghost" onClick={(e) => {e.stopPropagation(); handleDeleteCert(c.id)}} className="hover:bg-red-500/10 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                                  </TableCell>
                                                </>
                                              )}
                                          </SortableRow>
                                      ))}
                                  </SortableContext>
                              </TableBody>
                          </Table>
                      </DndContext>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PROFILE (RESTORED REMOVE BUTTONS) */}
              <TabsContent value="profile" className="animate-in fade-in slide-in-from-left-4 duration-500">
                <Card className="border border-border/50 bg-card/80 backdrop-blur-md shadow-xl">
                  <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={e=>setFullName(e.target.value)} className="bg-background/50 border-border" /></div><div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={e=>setHeadline(e.target.value)} className="bg-background/50 border-border" /></div></div>
                      <div className="space-y-2"><Label>Bio</Label><Textarea className="h-24 bg-background/50 border-border" value={bio} onChange={e=>setBio(e.target.value)} /></div>
                      <div className="space-y-3 pt-2"><Label className="text-muted-foreground font-bold">Social Links</Label><div className="grid grid-cols-3 gap-3"><div className="space-y-1"><Label className="text-xs">GitHub</Label><Input value={githubUrl} onChange={e=>setGithubUrl(e.target.value)} placeholder="https://..." /></div><div className="space-y-1"><Label className="text-xs">LinkedIn</Label><Input value={linkedinUrl} onChange={e=>setLinkedinUrl(e.target.value)} placeholder="https://..." /></div><div className="space-y-1"><Label className="text-xs">Twitter/X</Label><Input value={twitterUrl} onChange={e=>setTwitterUrl(e.target.value)} placeholder="https://..." /></div></div></div>
                      
                      {/* FIXED: Restored Remove buttons & Added Cursor Pointer */}
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                          <Label>Profile Picture</Label>
                          <Input type="file" onChange={e=>setAvatar(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:cursor-pointer file:text-primary" />
                          {currentAvatarUrl && (
                            <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                              <Eye className="w-3 h-3" /> <a href={currentAvatarUrl} target="_blank" className="hover:underline">Current Avatar</a>
                              <button type="button" onClick={() => removeField('profile', profileId!, 'avatar_url')} className="ml-auto text-red-500 text-xs hover:underline flex items-center"><XCircle className="w-3 h-3 mr-1"/> Remove</button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Resume (PDF)</Label>
                          <Input type="file" onChange={e=>setResume(e.target.files?.[0] || null)} className="bg-background/50 border-border cursor-pointer file:cursor-pointer file:text-primary" />
                          {currentResumeUrl && (
                            <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                              <Eye className="w-4 h-4" /> <a href={currentResumeUrl} target="_blank" className="hover:underline">View Resume</a>
                              <button type="button" onClick={() => removeField('profile', profileId!, 'resume_url')} className="ml-auto text-red-500 text-xs hover:underline flex items-center"><XCircle className="w-3 h-3 mr-1"/> Remove</button>
                            </div>
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
          
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full"></div>
              <CardHeader className="relative z-10"><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Media Helper</CardTitle><CardDescription className="text-slate-400">Upload for Markdown.</CardDescription></CardHeader>
              <CardContent className="space-y-4 relative z-10"><Input type="file" className="bg-slate-800 border-slate-700 text-white file:text-white cursor-pointer file:cursor-pointer" onChange={e => setHelperFile(e.target.files?.[0] || null)} /><Button onClick={handleQuickUpload} variant="secondary" className="w-full" disabled={!helperFile || helperLoading}>{helperLoading ? 'Uploading...' : 'Upload & Get Link'}</Button>{helperUrl && (<div className="mt-4 p-3 bg-slate-800 rounded-md break-all"><code className="text-xs text-green-400 select-all block mb-2">![Screenshot]({helperUrl})</code><Button size="sm" variant="ghost" className="w-full h-6 text-xs hover:bg-slate-700" onClick={() => navigator.clipboard.writeText(`![Screenshot](${helperUrl})`)}><Copy className="w-3 h-3 mr-2" /> Copy Markdown</Button></div>)}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}