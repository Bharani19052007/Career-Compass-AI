import { Link } from "@tanstack/react-router";
import { MapPin, Briefcase, Bookmark, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { Job } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedJobs } from "@/hooks/use-saved-jobs";

export function JobCard({ job }: { job: Job }) {
  const { toggleSavedJob, isJobSaved } = useSavedJobs();
  const saved = isJobSaved(job.id);

  return (
    <div
      className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-br ${job.banner} blur-xl opacity-30 hidden sm:block`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">{job.logo}</div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{job.title}</h3>
              <p className="truncate text-sm text-muted-foreground">{job.company} · {job.experience}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-muted-foreground">AI Match</div>
            <div className="text-lg font-bold text-gradient">{job.match}%</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
          <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.salary}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.posted}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.map((s) => <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>)}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Link to="/dashboard/jobs/$id" params={{ id: job.id }} className="flex-1">
            <Button className="w-full gradient-brand text-white shadow-glow">View Details</Button>
          </Link>
          <Button 
            size="icon" 
            variant={saved ? "default" : "outline"} 
            className={saved ? "gradient-brand text-white" : ""}
            onClick={(e) => {
              e.preventDefault();
              toggleSavedJob(job.id);
            }}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
