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
import { Pencil, Trash2, LogOut, ExternalLink, Copy, Image as ImageIcon } from 'lucide-react'

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

  // --- CERTIFICATE FORM STATES ---
  const [certTitle, setCertTitle] = useState('')
  const [certIssuer, setCertIssuer] = useState('')
  const [certDate, setCertDate] = useState('')
  const [certLink, setCertLink] = useState('')
  const [certImage, setCertImage] = useState<File | null>(null)

  // --- PROFILE STATES ---
  const [profileId, setProfileId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  // Socials
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
      // Load Socials (Supabase stores JSON as an object)
      const socials = profile.social_links || {}
      setGithubUrl(socials.github || '')
      setLinkedinUrl(socials.linkedin || '')
      setTwitterUrl(socials.twitter || '')
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

  // --- PROJECT LOGIC ---
  const handleEditProject = (project: any) => {
    setEditingProjId(project.id)
    setProjTitle(project.title)
    setProjSummary(project.summary || '')
    setProjContent(project.content || '')
    setProjTags(project.tags ? project.tags.join(', ') : '')
    setProjDemo(project.demo_link || '')
    setProjRepo(project.repo_link || '')
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
      setProjTitle(''); setProjSummary(''); setProjContent(''); setProjTags(''); setProjImage(null); setProjDemo(''); setProjRepo('');
      fetchData()
    } catch (err: any) { alert(err.message) }
    setLoading(false)
  }

  // --- CERTIFICATE LOGIC ---
  const handleEditCert = (cert: any) => { setEditingCertId(cert.id); setCertTitle(cert.title); setCertIssuer(cert.issuer || ''); setCertDate(cert.date_issued || ''); setCertLink(cert.credential_link || ''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
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
        social_links: { github: githubUrl, linkedin: linkedinUrl, twitter: twitterUrl }, // <--- SAVING AS JSON
        ...(avatarUrl && { avatar_url: avatarUrl }),
        ...(resumeUrl && { resume_url: resumeUrl })
      }

      if (profileId) { await supabase.from('profile').update(updates).eq('id', profileId) } else { await supabase.from('profile').insert(updates) }
      alert('Profile Updated!')
    } catch (err: any) { alert(err.message) }
    setLoading(false)
  }
  const cancelEdit = () => { setEditingProjId(null); setEditingCertId(null); setProjTitle(''); setProjSummary(''); setProjContent(''); setProjTags(''); setProjDemo(''); setProjRepo(''); }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div><h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/')}><ExternalLink className="w-4 h-4 mr-2" /> View Site</Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="space-y-8">
                <Card className={editingProjId ? "border-blue-500 border-2" : ""}>
                  <CardHeader><CardTitle>{editingProjId ? "Edit Project" : "Add New Project"}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={projTitle} onChange={e=>setProjTitle(e.target.value)} required /></div>
                      <div className="space-y-2"><Label>Tags</Label><Input value={projTags} onChange={e=>setProjTags(e.target.value)} placeholder="AI, React" /></div>
                      <div className="space-y-2"><Label>Summary</Label><Textarea value={projSummary} onChange={e=>setProjSummary(e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Demo Link</Label><Input value={projDemo} onChange={e=>setProjDemo(e.target.value)} placeholder="https://..." /></div><div className="space-y-2"><Label>GitHub Repo</Label><Input value={projRepo} onChange={e=>setProjRepo(e.target.value)} placeholder="https://github.com/..." /></div></div>
                      <div className="space-y-2"><Label>Full Content (Markdown)</Label><Textarea className="h-48 font-mono text-sm" value={projContent} onChange={e=>setProjContent(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Cover Image</Label><Input type="file" onChange={e=>setProjImage(e.target.files?.[0] || null)} /></div>
                      <div className="flex gap-2"><Button disabled={loading} className="w-full">{editingProjId ? 'Update' : 'Publish'}</Button>{editingProjId && <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>}</div>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Manage Projects</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>{projects.map((p) => (<TableRow key={p.id}><TableCell>{p.title}</TableCell><TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" onClick={() => handleEditProject(p)}><Pencil className="h-4 w-4 text-blue-500" /></Button><Button size="icon" variant="ghost" onClick={() => handleDeleteProject(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificates" className="space-y-8">
                <Card className={editingCertId ? "border-blue-500 border-2" : ""}>
                  <CardHeader><CardTitle>{editingCertId ? "Edit Cert" : "Add Cert"}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleCertSubmit} className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={certTitle} onChange={e=>setCertTitle(e.target.value)} required /></div>
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Issuer</Label><Input value={certIssuer} onChange={e=>setCertIssuer(e.target.value)} /></div><div className="space-y-2"><Label>Date</Label><Input type="date" value={certDate} onChange={e=>setCertDate(e.target.value)} /></div></div>
                      <div className="space-y-2"><Label>Link</Label><Input value={certLink} onChange={e=>setCertLink(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Image</Label><Input type="file" onChange={e=>setCertImage(e.target.files?.[0] || null)} /></div>
                      <div className="flex gap-2"><Button disabled={loading} className="w-full">{editingCertId ? "Update" : "Add"}</Button>{editingCertId && <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>}</div>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Manage Certificates</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>{certificates.map((c) => (<TableRow key={c.id}><TableCell>{c.title}</TableCell><TableCell className="text-right space-x-2"><Button size="icon" variant="ghost" onClick={() => handleEditCert(c)}><Pencil className="h-4 w-4 text-blue-500" /></Button><Button size="icon" variant="ghost" onClick={() => handleDeleteCert(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={e=>setFullName(e.target.value)} /></div><div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={e=>setHeadline(e.target.value)} /></div></div>
                      <div className="space-y-2"><Label>Bio</Label><Textarea className="h-24" value={bio} onChange={e=>setBio(e.target.value)} /></div>
                      
                      {/* --- SOCIAL LINKS --- */}
                      <div className="space-y-2"><Label className="text-slate-500 font-bold">Social Links</Label>
                        <div className="grid grid-cols-3 gap-2">
                           <div className="space-y-1"><Label className="text-xs">GitHub</Label><Input value={githubUrl} onChange={e=>setGithubUrl(e.target.value)} placeholder="https://github.com/..." /></div>
                           <div className="space-y-1"><Label className="text-xs">LinkedIn</Label><Input value={linkedinUrl} onChange={e=>setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
                           <div className="space-y-1"><Label className="text-xs">Twitter/X</Label><Input value={twitterUrl} onChange={e=>setTwitterUrl(e.target.value)} placeholder="https://x.com/..." /></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Profile Picture</Label><Input type="file" onChange={e=>setAvatar(e.target.files?.[0] || null)} /></div><div className="space-y-2"><Label>Resume (PDF)</Label><Input type="file" onChange={e=>setResume(e.target.files?.[0] || null)} /></div></div>
                      <Button disabled={loading} className="w-full">Save Profile</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-slate-900 text-white border-none">
              <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Media Helper</CardTitle><CardDescription className="text-slate-400">Upload screenshots here to get a link for your Markdown content.</CardDescription></CardHeader>
              <CardContent className="space-y-4"><Input type="file" className="bg-slate-800 border-slate-700 text-white file:text-white" onChange={e => setHelperFile(e.target.files?.[0] || null)} /><Button onClick={handleQuickUpload} variant="secondary" className="w-full" disabled={!helperFile || helperLoading}>{helperLoading ? 'Uploading...' : 'Upload & Get Link'}</Button>{helperUrl && (<div className="mt-4 p-3 bg-slate-800 rounded-md break-all"><p className="text-xs text-slate-400 mb-1">Copy this into Content:</p><code className="text-xs text-green-400 select-all block mb-2">![Screenshot]({helperUrl})</code><Button size="sm" variant="ghost" className="w-full h-6 text-xs hover:bg-slate-700" onClick={() => navigator.clipboard.writeText(`![Screenshot](${helperUrl})`)}><Copy className="w-3 h-3 mr-2" /> Copy Markdown</Button></div>)}</CardContent>
            </Card>
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800"><p className="font-bold mb-2">💡 Tips for Content:</p><ul className="list-disc pl-4 space-y-1"><li>Use <b>#</b> for big headings.</li><li>Use <b>**text**</b> for bold.</li><li>Use the Media Helper above to add extra images inside your story!</li><li>To make a Clickable Video, you just put the Image inside the Link brackets: [![Click to Watch](IMAGE_URL_HERE)](VIDEO_URL_HERE)</li></ul></div>
          </div>
        </div>
      </div>
    </div>
  )
}