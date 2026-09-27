import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Edit, Loader2, Upload, FileText } from "lucide-react";
import { pushNotification } from "@/hooks/use-notifications";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { profile as fallbackProfile } from "@/lib/data";

export const Route = createFileRoute("/dashboard/profile")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeName, setResumeName] = useState(preferences.resumeUploaded ? "resume.pdf" : "");
  
  // Profile state
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Form inputs
  const [formSkills, setFormSkills] = useState("");
  const [formInterests, setFormInterests] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (data) {
      setFullName(data.full_name || user?.user_metadata?.full_name || "Anonymous User");
      setHeadline(data.headline || "Job Seeker");
      setLocation(data.location || "Earth");
      setPreferredRole(data.preferred_role || "Software Engineer");
      setSkills(data.skills || []);
      setInterests(data.interests || []);
      
      setFormSkills((data.skills || []).join(", "));
      setFormInterests((data.interests || []).join(", "));
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const skillsArray = formSkills.split(",").map(s => s.trim()).filter(Boolean);
    const interestsArray = formInterests.split(",").map(s => s.trim()).filter(Boolean);

    const { error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        full_name: fullName,
        headline,
        location,
        preferred_role: preferredRole,
        skills: skillsArray,
        interests: interestsArray
      });

    if (!error) {
      setSkills(skillsArray);
      setInterests(interestsArray);
      setOpen(false);
    }
    setSaving(false);
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    // Simulate upload delay
    setTimeout(() => {
      setResumeName(file.name);
      updatePreferences({ resumeUploaded: true });
      setUploadingResume(false);
      pushNotification("Resume uploaded and parsed successfully! Your ATS score has been updated.", "system");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-8">
        <div className="pointer-events-none absolute inset-x-0 -top-16 h-40 gradient-brand opacity-30 blur-3xl" />
        <div className="relative flex flex-wrap items-start gap-6">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-secondary text-5xl shadow-glow">
            {fullName ? fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground">{headline}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email} · {location}</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              id="resume-upload" 
              className="hidden" 
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
            />
            {resumeName ? (
              <Button variant="outline" onClick={() => document.getElementById('resume-upload')?.click()}>
                {uploadingResume ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4 text-brand-purple" />}
                {uploadingResume ? "Uploading..." : resumeName}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => document.getElementById('resume-upload')?.click()}>
                {uploadingResume ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploadingResume ? "Uploading..." : "Upload Resume"}
              </Button>
            )}
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-brand text-white shadow-glow">
                  <Edit className="mr-2 h-4 w-4" />Edit profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input id="headline" value={headline} onChange={e => setHeadline(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="role">Preferred Role</Label>
                    <Input id="role" value={preferredRole} onChange={e => setPreferredRole(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input id="skills" value={formSkills} onChange={e => setFormSkills(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="interests">Interests (comma separated)</Label>
                    <Input id="interests" value={formInterests} onChange={e => setFormInterests(e.target.value)} className="mt-1" />
                  </div>
                  <Button type="submit" disabled={saving} className="w-full gradient-brand text-white">
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Skills</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.length > 0 ? skills.map((s) => <Badge key={s} className="gradient-brand text-white border-0">{s}</Badge>) : <p className="text-sm text-muted-foreground">No skills added yet.</p>}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Interests</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {interests.length > 0 ? interests.map((s) => <Badge key={s} variant="secondary">{s}</Badge>) : <p className="text-sm text-muted-foreground">No interests added yet.</p>}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Preferred role</h3>
          <p className="mt-2 text-sm text-muted-foreground">{preferredRole}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Preferred location</h3>
          <p className="mt-2 text-sm text-muted-foreground">{location} · Open to remote</p>
        </div>
      </div>
    </div>
  );
}
