import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from "recharts";
import { Sparkles, BookOpen } from "lucide-react";
import { skills as mockSkills } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { analyzeSkillGapFn } from "@/lib/jobs-api";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard/skill-gap")({
  component: SkillGap,
});

function SkillGap() {
  const { preferences } = useOnboarding();
  const { savedJobsList } = useSavedJobs();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ skills: string[], preferred_role: string } | null>(null);

  useEffect(() => {
    if (user) {
      supabase.from("user_profiles").select("skills, preferred_role").eq("user_id", user.id).single()
        .then(({ data }) => {
          if (data) setProfile(data as any);
          else setProfile({ skills: [], preferred_role: preferences.preferredJob });
        });
    }
  }, [user]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["skill-gap", savedJobsList.length, profile?.preferred_role, profile?.skills],
    queryFn: async () => {
      let skills = profile?.skills || [];
      if (skills.length === 0) {
        skills = [preferences.preferredJob, preferences.areaOfInterest, preferences.experienceLevel].filter(Boolean) as string[];
      }
      return await analyzeSkillGapFn({ 
        data: { 
          jobs: savedJobsList, 
          skills, 
          preferredRole: profile?.preferred_role || preferences.preferredJob 
        } 
      });
    },
    enabled: !!profile, // Wait for profile to load
    refetchOnWindowFocus: false,
  });

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-purple" />
        <p className="text-muted-foreground animate-pulse">AI is analyzing your skills against your saved jobs...</p>
      </div>
    );
  }

  const skillsData = data?.skills && data.skills.length > 0 ? data.skills : mockSkills;
  const suggestions = data?.suggestions && data.suggestions.length > 0 
    ? data.suggestions 
    : ["Focus on System Design — highest ROI for target roles.", "Build 1 LLM project to close the LLMs gap.", "Take the SQL bootcamp — 6h to move from 55 → 75."];
  const roadmap = data?.roadmap && data.roadmap.length > 0 
    ? data.roadmap 
    : [
        { w: "Week 1–2", t: "SQL for Data Analysts" },
        { w: "Week 3–4", t: "System Design fundamentals" },
        { w: "Week 5–6", t: "Applied LLMs project" },
        { w: "Week 7", t: "Mock interviews" }
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analysis</h1>
        <p className="text-muted-foreground">Your skills vs the top-matching roles.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">You vs Required</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                <Radar name="You" dataKey="you" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.35} />
                <Radar name="Required" dataKey="required" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.25} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Progress</h3>
          <div className="mt-4 space-y-4">
            {skillsData.map((s: any) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm"><span>{s.name}</span><span className="text-muted-foreground">{s.you} / {s.required}</span></div>
                <div className="relative mt-1 h-2 rounded-full bg-secondary">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-brand-purple/40" style={{ width: `${Math.min(100, s.required)}%` }} />
                  <div className="absolute inset-y-0 left-0 rounded-full gradient-brand" style={{ width: `${Math.min(100, s.you)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-purple" /><h3 className="font-semibold">AI Suggestions</h3></div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {suggestions.map((s: string, i: number) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skillsData.map((s: any) => <Badge key={s.name} variant="secondary">{s.name}</Badge>)}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-brand-purple" /><h3 className="font-semibold">Learning roadmap</h3></div>
          <ol className="mt-3 space-y-3 text-sm">
            {roadmap.map((r: any, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full gradient-brand text-[10px] font-bold text-white">✓</div>
                <div><div className="text-xs text-muted-foreground">{r.w}</div><div className="font-medium">{r.t}</div></div>
              </li>
            ))}
          </ol>
          <Progress value={35} className="mt-4" />
        </div>
      </div>
    </div>
  );
}
