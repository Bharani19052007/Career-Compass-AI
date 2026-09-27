import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, SlidersHorizontal, MapPin, ExternalLink,
  Wifi, Building2, ChevronLeft, ChevronRight, Loader2, AlertCircle, Clock, Bookmark, Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useJobs } from "@/hooks/useJobs";
import type { NormalizedJob } from "@/lib/job-sources/types";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STATES_AND_DISTRICTS } from "@/lib/locations";
import { motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { analyzeJobMatchFn } from "@/lib/jobs-api";

export const Route = createFileRoute("/dashboard/jobs/")({
  component: Jobs,
});

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() / 1000 - ts) / 86400);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

function unescapeHtml(safe: string) {
  if (!safe) return "";
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

const TAG_COLORS = [
  "bg-violet-500/15 text-violet-400",
  "bg-blue-500/15 text-blue-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-amber-500/15 text-amber-400",
  "bg-rose-500/15 text-rose-400",
  "bg-cyan-500/15 text-cyan-400",
];

function AIMatchSection({ job }: { job: NormalizedJob }) {
  const { preferences } = useOnboarding();
  
  const mutation = useMutation({
    mutationFn: async () => {
      // Create a dummy skills list based on user's preferred job if they haven't added real skills yet
      const skills = [preferences.preferredJob, preferences.areaOfInterest].filter(Boolean);
      return await analyzeJobMatchFn({ 
        data: { job, skills, experience: "Entry-level/Student" } 
      });
    }
  });

  if (mutation.isSuccess && mutation.data) {
    const { matchScore, matchingSkills, missingSkills, suggestions, explanation } = mutation.data;
    const scoreColor = matchScore >= 75 ? "text-green-500" : matchScore >= 50 ? "text-amber-500" : "text-rose-500";
    
    return (
      <div className="rounded-xl border border-border/50 bg-accent/30 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-purple" /> AI Match Analysis</h4>
            <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
          </div>
          <div className={`text-2xl font-bold ${scoreColor}`}>{matchScore}%</div>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Matching Skills</h5>
            <div className="flex flex-wrap gap-1.5">
              {matchingSkills.length > 0 ? matchingSkills.map(s => (
                <Badge key={s} variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">{s}</Badge>
              )) : <span className="text-sm text-muted-foreground">None found</span>}
            </div>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Missing Skills</h5>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.length > 0 ? missingSkills.map(s => (
                <Badge key={s} variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">{s}</Badge>
              )) : <span className="text-sm text-muted-foreground">None</span>}
            </div>
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommendations</h5>
            <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
              {suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-brand-purple/5 p-4 flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-brand-purple flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> CareerPilot Match Analysis</h4>
        <p className="text-sm text-muted-foreground mt-1">Want to see how your profile matches this role? Click to analyze.</p>
      </div>
      <Button 
        variant="outline" 
        className="border-brand-purple/30 text-brand-purple hover:bg-brand-purple/10 gap-2 shrink-0"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Match"}
      </Button>
    </div>
  );
}

function JobListingCard({ job, index }: { job: NormalizedJob; index: number }) {
  const { toggleSavedJob, isJobSaved } = useSavedJobs();
  const { addAppliedJob, isJobApplied } = useAppliedJobs();
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const initials = job.company.slice(0, 2).toUpperCase();
  const colorIdx = job.company.charCodeAt(0) % 6;
  const gradients = [
    "from-violet-500/20 to-purple-600/20",
    "from-blue-500/20 to-cyan-600/20",
    "from-emerald-500/20 to-teal-600/20",
    "from-amber-500/20 to-orange-600/20",
    "from-rose-500/20 to-pink-600/20",
    "from-fuchsia-500/20 to-violet-600/20",
  ];

  return (
    <div
      className="glass group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Subtle background glow - hidden on mobile to improve scrolling performance, lower opacity */}
      <div className={`pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-br ${gradients[colorIdx]} blur-xl opacity-30 hidden sm:block`} />
      <div className="relative flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradients[colorIdx]} border border-border/40 text-sm font-bold`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight line-clamp-2">{job.title}</h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {job.company}
            </p>
          </div>
          {job.remote && (
            <Badge className="shrink-0 bg-emerald-500/15 text-emerald-400 border-0 text-[10px]">
              <Wifi className="h-3 w-3 mr-1" />Remote
            </Badge>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />{job.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />{timeAgo(new Date(job.postedAt).getTime() / 1000)}
          </span>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((tag, i) => (
              <Badge key={tag} className={`rounded-full border-0 text-[11px] ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Job types & Salary */}
        <div className="flex flex-wrap gap-1.5">
          {job.employmentType && (
            <Badge variant="outline" className="rounded-full text-[11px]">{job.employmentType}</Badge>
          )}
          {job.salaryDisplay && (
            <Badge variant="outline" className="rounded-full text-[11px] bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">{job.salaryDisplay}</Badge>
          )}
        </div>
        
        {/* Source Provider */}
        <div className="text-[11px] text-muted-foreground mt-1">
          Source: <span className="font-medium capitalize">{[job.source, ...((job.metadata?.additionalSources as string[]) || [])].join(" + ")}</span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">{job.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 mt-1 text-base">
                  <Building2 className="h-4 w-4" /> {job.company}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {job.location && (
                    <Badge variant="secondary"><MapPin className="h-3.5 w-3.5 mr-1" />{job.location}</Badge>
                  )}
                  {job.remote && (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-0"><Wifi className="h-3.5 w-3.5 mr-1" />Remote</Badge>
                  )}
                  <Badge variant="outline"><Clock className="h-3.5 w-3.5 mr-1" />{timeAgo(new Date(job.postedAt).getTime() / 1000)}</Badge>
                </div>
                
                <AIMatchSection job={job} />

                <div>
                  <h3 className="font-semibold mb-3 text-lg">Job Description</h3>
                  <div className="text-sm text-muted-foreground space-y-4 leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>p]:mb-2">
                    <div dangerouslySetInnerHTML={{ __html: unescapeHtml(job.description) }} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-border/50 gap-2">
                <Button 
                  variant={isJobSaved(job.id) ? "default" : "outline"} 
                  className={isJobSaved(job.id) ? "gradient-brand text-white" : ""}
                  onClick={() => toggleSavedJob(job as any)}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isJobSaved(job.id) ? "fill-current" : ""}`} />
                  {isJobSaved(job.id) ? "Saved" : "Save Job"}
                </Button>
                <Button 
                  className={`${isJobApplied(job.id) ? "bg-success hover:bg-success/90" : "gradient-brand"} text-white shadow-glow gap-2`}
                  onClick={() => {
                    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
                    if (!isJobApplied(job.id)) setShowApplyConfirm(true);
                  }}
                >
                  {isJobApplied(job.id) ? "Applied" : "Apply Now"} <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            className={`flex-1 ${isJobApplied(job.id) ? "bg-success hover:bg-success/90" : "gradient-brand"} text-white shadow-glow gap-2`}
            onClick={() => {
              window.open(job.applyUrl, "_blank", "noopener,noreferrer");
              if (!isJobApplied(job.id)) setShowApplyConfirm(true);
            }}
          >
            {isJobApplied(job.id) ? "Applied" : "Apply Now"} <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="icon" 
            variant={isJobSaved(job.id) ? "default" : "outline"} 
            className={isJobSaved(job.id) ? "gradient-brand text-white shrink-0" : "shrink-0"}
            onClick={(e) => {
              e.preventDefault();
              toggleSavedJob(job as any);
            }}
          >
            <Bookmark className={`h-4 w-4 ${isJobSaved(job.id) ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Apply Confirmation Modal */}
        <Dialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Did you successfully apply?</DialogTitle>
              <DialogDescription>
                We redirected you to the company's application page. Were you able to complete the application?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowApplyConfirm(false)}>
                No, I didn't finish
              </Button>
              <Button 
                className="gradient-brand text-white shadow-glow" 
                onClick={() => {
                  addAppliedJob(job as any);
                  setShowApplyConfirm(false);
                }}
              >
                Yes, mark as Applied
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function Jobs() {
  const { preferences } = useOnboarding();
  
  const [q, setQ] = useState(preferences.preferredJob || "");
  const [debouncedQ, setDebouncedQ] = useState(preferences.preferredJob || "");
  
  const initialRemote = preferences.preferredLocation?.toLowerCase().includes("remote") ? "remote" : "all";
  const [remoteFilter, setRemoteFilter] = useState(initialRemote);
  const [countryFilter, setCountryFilter] = useState("in");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Debounce the search query before sending to API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [q]);

  const activeLocation = districtFilter !== "all" ? districtFilter : (stateFilter !== "all" ? stateFilter : "all");
  const isRemote = remoteFilter === "remote" ? true : undefined;
  const { jobs, loading, error, total } = useJobs({
    page,
    keyword: debouncedQ,
    location: activeLocation === "all" ? undefined : activeLocation,
    country: countryFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    remote: isRemote
  });

  const filtered = jobs.filter((j) => {
    const matchRemote =
      remoteFilter === "all" ||
      (remoteFilter === "remote" && j.remote) ||
      (remoteFilter === "onsite" && !j.remote);
    return matchRemote;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Job Finder</h1>
        <p className="text-muted-foreground">
          Live {countryFilter.toUpperCase()} job listings automatically aggregated
          {total != null && ` · ${total.toLocaleString()} listings`}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-[2rem] p-4 flex flex-col sm:flex-row gap-3 shadow-soft">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search for any role..."
            className="pl-12 h-12 rounded-xl text-base border-none bg-accent/30 focus-visible:ring-1 focus-visible:ring-brand-purple"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 rounded-xl px-6 gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6 rounded-2xl shadow-xl" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-2">Advanced Filters</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={countryFilter} onValueChange={(v) => { 
                  setCountryFilter(v); 
                  if (v !== "in") {
                    setStateFilter("all");
                    setDistrictFilter("all");
                  }
                  setPage(1); 
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="gb">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="sg">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {countryFilter === "in" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Select value={stateFilter} onValueChange={(v) => { 
                      setStateFilter(v); 
                      setDistrictFilter("all"); 
                      setPage(1); 
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {Object.keys(STATES_AND_DISTRICTS).map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">District</label>
                    <Select value={districtFilter} onValueChange={(v) => { setDistrictFilter(v); setPage(1); }} disabled={stateFilter === "all"}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="District" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {stateFilter !== "all" && STATES_AND_DISTRICTS[stateFilter]?.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Workplace</label>
                <Select value={remoteFilter} onValueChange={(v) => { setRemoteFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Workplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workplaces</SelectItem>
                    <SelectItem value="remote">Remote only</SelectItem>
                    <SelectItem value="onsite">On-site only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground items-center px-2">
        <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
        <span className="font-medium text-foreground mr-1">Suggestions:</span>
        {["Remote Jobs", "Internships", "India", "Tamil Nadu", "Chennai"].map((t) => (
          <button
            key={t}
            onClick={() => {
                if (t === "Remote Jobs") {
                  setRemoteFilter("remote");
                  setTypeFilter("all");
                  setQ("");
                  setStateFilter("all");
                  setDistrictFilter("all");
                } else if (t === "Internships") {
                  setRemoteFilter("all");
                  setTypeFilter("internship");
                  setQ("");
                  setStateFilter("all");
                  setDistrictFilter("all");
                } else if (t === "India") {
                  setRemoteFilter("all");
                  setTypeFilter("all");
                  setStateFilter("all");
                  setDistrictFilter("all");
                  setQ("");
                } else if (["Tamil Nadu", "Chennai"].includes(t)) {
                  setRemoteFilter("all");
                  setTypeFilter("all");
                  setStateFilter("Tamil Nadu");
                  setDistrictFilter(t === "Chennai" ? "Chennai" : "all");
                  setQ("");
                } else {
                  setQ(t);
                }
                setPage(1);
            }}
            className="rounded-full border border-border/50 px-3 py-1 hover:bg-brand-purple/10 hover:text-brand-purple transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-16 text-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Fetching live jobs…</p>
        </div>
      ) : error ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-16 text-center gap-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="font-semibold">Failed to load jobs</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => setPage(p => p)}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-16 text-center gap-3">
          <Search className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="font-semibold">No jobs found</p>
          <p className="text-sm text-muted-foreground">Try a different search term or clear your filters.</p>
          <Button variant="outline" onClick={() => { setQ(""); setRemoteFilter("all"); }}>Clear filters</Button>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> jobs
            {q && <> for "<span className="font-medium text-foreground">{q}</span>"</>}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job, i) => (
              <JobListingCard key={`${job.id}-${i}`} job={job} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !error && Math.ceil(total / 50) > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{Math.ceil(total / 50)}</span>
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === Math.ceil(total / 50)}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
