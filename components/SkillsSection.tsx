'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, Code2, Wrench, Layers } from 'lucide-react'

// Helper to pick an icon
const getIcon = (category: string) => {
  const lower = category.toLowerCase()
  if (lower.includes('ai') || lower.includes('data')) return <Cpu className="w-6 h-6 text-blue-500" />
  if (lower.includes('tool') || lower.includes('cloud')) return <Wrench className="w-6 h-6 text-orange-500" />
  return <Code2 className="w-6 h-6 text-green-500" />
}

export default function SkillsSection({ skills }: { skills: any[] }) {
  // Even if skills are empty, we want to render the section so the Title shows.
  const hasSkills = skills && skills.length > 0

  return (
    <section className="mb-24 w-full">
        
        {/* --- HEADER --- */}
        <div className="flex items-end justify-between mb-12 border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    {/* Icon */}
                    <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    Technical Skills
                </h2>
            </div>
        </div>
        
        {/* --- GRID (3 Columns, same styling as Projects) --- */}
        {hasSkills ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {skills.map((skill) => (
                    <Card 
                        key={skill.id} 
                        // Using the exact same class string from ProjectsGrid for consistency
                        className="group border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-blue-500/30 min-h-[180px]"
                    >
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="p-3 bg-muted rounded-xl shrink-0 group-hover:bg-blue-500/10 transition-colors">
                                {getIcon(skill.category)}
                            </div>
                            <CardTitle className="text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {skill.category}
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="flex-grow pt-2">
                            <div className="flex flex-wrap gap-2">
                                {skill.items.split(',').map((item: string) => (
                                    <Badge 
                                        key={item} 
                                        variant="secondary" 
                                        className="px-3 py-1.5 text-sm font-mono bg-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30 hover:bg-blue-500/20 transition-colors"
                                    >
                                        {item.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            /* Fallback if list is empty */
            <div className="text-center p-12 border border-dashed border-border/50 rounded-xl bg-muted/10">
                <p className="text-muted-foreground">Skills list is currently empty. Add them in the Admin panel.</p>
            </div>
        )}
    </section>
  )
}