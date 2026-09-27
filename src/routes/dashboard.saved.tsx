import { createFileRoute } from "@tanstack/react-router";
import { JobCard } from "@/components/site/JobCard";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { motion } from "motion/react";
import { Building2, MapPin, Clock, ExternalLink, Wifi, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/saved")({
  component: Saved,
});

// A mini-version of ArbeitnowCard to render saved API jobs
function SavedArbeitnowCard({ job }: { job: any }) {
  const { toggleSavedJob } = useSavedJobs();
  const initials = job.company_name?.slice(0, 2).toUpperCase() || "JB";

  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-border/40 text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight line-clamp-2">{job.title}</h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {job.company_name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
          )}
        </div>
        <div className="mt-auto flex items-center gap-2">
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full gradient-brand text-white shadow-glow gap-2">Apply <ExternalLink className="h-3.5 w-3.5" /></Button>
          </a>
          <Button 
            size="icon" 
            variant="default"
            className="gradient-brand text-white shrink-0"
            onClick={(e) => { e.preventDefault(); toggleSavedJob(job); }}
          >
            <Bookmark className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Saved() {
  const { savedJobsList } = useSavedJobs();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground">Come back to these when you're ready to apply.</p>
      </div>
      {savedJobsList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedJobsList.map((job: any) => {
            const isApiJob = !!job.slug;
            if (isApiJob) return <SavedArbeitnowCard key={job.slug} job={job} />;
            return <JobCard key={job.id} job={job} />;
          })}
        </div>
      ) : (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No saved jobs.</p>
        </div>
      )}
    </div>
  );
}
