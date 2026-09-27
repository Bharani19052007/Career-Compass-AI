import { JobSource, JobSearchParams, JobSearchResponse, NormalizedJob } from "./types";
import { AdzunaSource } from "./adzuna-source";
import { GreenhouseSource } from "./greenhouse-source";
import { ArbeitnowSource } from "./arbeitnow-source";

const sources: JobSource[] = [
  new AdzunaSource(),
  new GreenhouseSource(),
  new ArbeitnowSource()
];

export async function searchAllJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  const startTime = Date.now();
  const results: NormalizedJob[] = [];
  const sourceStats: JobSearchResponse["sources"] = {};

  const promises = sources.map(async (source) => {
    const sourceStartTime = Date.now();
    try {
      const jobs = await source.searchJobs(params);
      const duration = Date.now() - sourceStartTime;
      
      sourceStats[source.name] = {
        status: "success",
        jobsFound: jobs.length,
        durationMs: duration
      };
      
      return jobs;
    } catch (error: any) {
      const duration = Date.now() - sourceStartTime;
      sourceStats[source.name] = {
        status: "error",
        jobsFound: 0,
        durationMs: duration,
        error: error.message
      };
      return []; // Return empty array on failure so one failing source doesn't break all
    }
  });

  const sourceResults = await Promise.all(promises);
  
  // Flatten results
  for (const jobs of sourceResults) {
    results.push(...jobs);
  }

  // Deduplicate results
  const uniqueJobs = deduplicateJobs(results);

  // Default sorting (e.g., by posted date desc)
  uniqueJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return {
    jobs: uniqueJobs,
    total: uniqueJobs.length,
    page: params.page || 1,
    sources: sourceStats
  };
}

function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const unique = new Map<string, NormalizedJob>();

  for (const job of jobs) {
    // Basic deterministic matching: lowercase title + company
    // Remove punctuation and multiple spaces for better matching
    const normalizeString = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    
    const key = `${normalizeString(job.title)}|${normalizeString(job.company)}`;
    
    if (unique.has(key)) {
      const existing = unique.get(key)!;
      // Track that this job is also found in another source
      existing.metadata = existing.metadata || {};
      existing.metadata.additionalSources = existing.metadata.additionalSources || [];
      if (!(existing.metadata.additionalSources as string[]).includes(job.source)) {
         (existing.metadata.additionalSources as string[]).push(job.source);
      }
    } else {
      unique.set(key, job);
    }
  }

  return Array.from(unique.values());
}
