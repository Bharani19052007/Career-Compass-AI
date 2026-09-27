import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Github, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/dashboard/projects")({
  component: Projects,
});

type Project = {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  link: string | null;
  github: string | null;
};

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tech, setTech] = useState("");
  const [link, setLink] = useState("");
  const [github, setGithub] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_projects")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    const techArray = tech.split(",").map(t => t.trim()).filter(Boolean);
    
    const { error } = await supabase.from("user_projects").insert({
      user_id: user.id,
      title,
      description,
      tech_stack: techArray,
      link: link || null,
      github: github || null
    });

    if (!error) {
      setOpen(false);
      setTitle("");
      setDescription("");
      setTech("");
      setLink("");
      setGithub("");
      fetchProjects();
    } else {
      console.error("Failed to add project:", error);
      alert("Failed to add project. Make sure the 'user_projects' table exists in Supabase.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("user_projects").delete().eq("id", id);
    fetchProjects();
  };

  const handleUpdateLink = async (id: string, type: 'link' | 'github') => {
    const url = window.prompt(`Enter the ${type === 'link' ? 'Live Demo' : 'GitHub'} URL:`);
    if (!url) return;
    
    // Add simple validation
    try {
      new URL(url);
    } catch {
      alert("Please enter a valid URL including http:// or https://");
      return;
    }

    await supabase.from("user_projects").update({ [type]: url }).eq("id", id);
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-muted-foreground">Manage and showcase your personal projects.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-white shadow-glow">
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AI Resume Builder" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" required value={description} onChange={e => setDescription(e.target.value)} placeholder="What does it do?" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="tech">Tech Stack (comma separated)</Label>
                <Input id="tech" required value={tech} onChange={e => setTech(e.target.value)} placeholder="React, Node, Tailwind" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="github">GitHub URL</Label>
                <Input id="github" type="url" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="link">Live Demo URL</Label>
                <Input id="link" type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full gradient-brand text-white">
                {submitting ? "Adding..." : "Add Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-purple" /></div>
      ) : projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -3 }} className="glass flex flex-col rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tech_stack.map((t) => <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>)}
              </div>
              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                {p.link ? (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(p.link!, '_blank')}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Demo
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleUpdateLink(p.id, 'link')}>
                    <Plus className="mr-1 h-3 w-3" /> Add Demo
                  </Button>
                )}
                {p.github ? (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(p.github!, '_blank')}>
                    <Github className="mr-2 h-4 w-4" /> Code
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleUpdateLink(p.id, 'github')}>
                    <Plus className="mr-1 h-3 w-3" /> Add Code
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">You haven't added any projects yet.</p>
        </div>
      )}
    </div>
  );
}
