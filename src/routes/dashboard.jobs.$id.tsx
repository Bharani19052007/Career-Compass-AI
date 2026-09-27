import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { Job } from "@/lib/data";
import { MapPin, Briefcase, Clock, Bookmark, ArrowLeft, Sparkles, Check } from "lucide-react";
import { jobs } from "@/lib/data";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/site/JobCard";
import { CourseCard } from "@/components/site/CourseCard";
import { useState } from "react";
import { courses } from "@/lib/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/jobs/$id")({
  loader: ({ params }) => {
    const job = jobs.find((j) => j.id === params.id);
    if (!job) throw notFound();
    return { job };
  },
  component: JobDetail,
});

function JobDetail() {
  const { job } = Route.useLoaderData() as { job: Job };
  const similar = jobs.filter((j) => j.id !== job.id).slice(0, 3);
  const { savedJobIds, toggleSavedJob } = useSavedJobs();
  const { appliedJobIds, applyToJob } = useAppliedJobs();

  const isSaved = savedJobIds.includes(job.id);
  const isApplied = appliedJobIds.includes(job.id);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <Link to="/dashboard/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to jobs
      </Link>

      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${job.banner} p-8`}>
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-secondary text-3xl">{job.logo}</div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{job.title}</h1>
                <p className="text-muted-foreground">{job.company}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                  <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.salary}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{job.posted}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">AI Match</div>
              <div className="text-4xl font-bold text-gradient">{job.match}%</div>
              <div className="mt-3 flex gap-2">
                {isApplied ? (
                  <Button variant="outline" className="text-success border-success bg-success/10 hover:bg-success/20 pointer-events-none gap-2">
                    <Check className="h-4 w-4" />
                    Applied
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setShowApplyConfirm(true)} className="gradient-brand text-white shadow-glow">
                      Apply now
                    </Button>
                    <AlertDialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Did you apply for this job?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Clicking "Apply now" usually takes you to the company's external career page. Once you have submitted your application there, confirm below to move this job to your "Applied" list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setShowApplyConfirm(false)}>Not yet</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { applyToJob(job.id); setShowApplyConfirm(false); }} className="gradient-brand">
                            Yes, I applied
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                <Button 
                  variant={isSaved ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => toggleSavedJob(job.id)}
                  className={isSaved ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="glass rounded-2xl p-6">
            <h2 className="font-semibold">Job description</h2>
            <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
          </section>
          <section className="glass rounded-2xl p-6">
            <h2 className="font-semibold">Responsibilities</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </section>
          <section className="glass rounded-2xl p-6">
            <h2 className="font-semibold">Required skills</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">{job.skills.map((s) => <Badge key={s} className="gradient-brand text-white border-0">{s}</Badge>)}</div>
            <h3 className="mt-5 font-semibold">Preferred skills</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">{job.preferred.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
          </section>
          <section className="glass rounded-2xl p-6">
            <h2 className="font-semibold">Benefits</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">{job.benefits.map((b) => <Badge key={b} variant="outline">{b}</Badge>)}</div>
          </section>
        </div>
        <aside className="space-y-6">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-purple" /><h3 className="font-semibold">Missing skills</h3></div>
            <div className="mt-2 flex flex-wrap gap-1.5">{job.preferred.map((s) => <Badge key={s} variant="destructive" className="opacity-80">{s}</Badge>)}</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold">Recommended courses</h3>
            <div className="mt-3 space-y-3">
              {courses.slice(0, 2).map((c) => <CourseCard key={c.id} c={c} />)}
            </div>
          </div>
        </aside>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">Similar jobs</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {similar.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      </div>
    </div>
  );
}
