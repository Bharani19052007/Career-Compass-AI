import { createFileRoute } from "@tanstack/react-router";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import { Building2, MapPin, ExternalLink, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/applied")({
  component: Applied,
});

function Applied() {
  const { appliedJobsList, toggleAppliedJob } = useAppliedJobs();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applied Jobs</h1>
        <p className="text-muted-foreground">Everything you've applied to, tracked locally.</p>
      </div>
      {appliedJobsList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {appliedJobsList.map((job: any) => (
             <div key={job.id} className="glass group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 hover:-translate-y-1 transition-transform">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-purple/20 to-blue-500/20 border border-border/40 font-bold">
                    {job.company?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight line-clamp-2">{job.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {job.company}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                  {job.remote && <Badge className="bg-emerald-500/15 text-emerald-400 border-0 h-5 px-1.5 text-[10px]"><Wifi className="h-2.5 w-2.5 mr-1" />Remote</Badge>}
                </div>
                
                <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      View Original <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                  <Button 
                    variant="ghost" 
                    className="text-destructive hover:bg-destructive/10 px-3"
                    onClick={() => toggleAppliedJob(job)}
                  >
                    Remove
                  </Button>
                </div>
             </div>
          ))}
        </div>
      ) : (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
        </div>
      )}
    </div>
  );
}
