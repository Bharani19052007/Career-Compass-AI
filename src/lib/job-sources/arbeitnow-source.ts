import { JobSource, JobSearchParams, NormalizedJob } from "./types";

export class ArbeitnowSource implements JobSource {
  name = "arbeitnow";

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    const page = params.page || 1;
    let url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Arbeitnow API error: ${res.status}`);
      const json = await res.json();
      
      const jobs = json.data.map((j: any) => this.normalize(j, params));
      return this.filterJobs(jobs, params);
    } catch (error) {
      console.error("Arbeitnow search failed:", error);
      return []; // Return empty array so it doesn't break aggregator
    }
  }

  private filterJobs(jobs: NormalizedJob[], params: JobSearchParams): NormalizedJob[] {
    return jobs.filter((job) => {
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(kw);
        const matchesDesc = job.description.toLowerCase().includes(kw);
        if (!matchesTitle && !matchesDesc) return false;
      }
      
      if (params.remote && !job.remote) return false;
      
      // Arbeitnow doesn't have country codes, so we have to use heuristic string matching on the location
      if (params.country && params.country !== "all") {
        const countryMap: Record<string, string[]> = {
          "in": ["india", "bangalore", "mumbai", "delhi", "hyderabad", "chennai", "pune"],
          "us": ["usa", "united states", "new york", "san francisco", "remote us"],
          "gb": ["uk", "united kingdom", "london", "england"],
          "ca": ["canada", "toronto", "vancouver"],
          "au": ["australia", "sydney", "melbourne"],
          "sg": ["singapore"]
        };
        
        const locLower = job.location?.toLowerCase() || "";
        const expectedTerms = countryMap[params.country] || [];
        
        // If the job is remote, Arbeitnow often just says "Remote", which is tricky. 
        // But if a specific country is requested, we should probably filter strictly.
        const matchesCountry = expectedTerms.some(term => locLower.includes(term));
        
        if (!matchesCountry && locLower !== "remote") {
          return false;
        }
      }

      return true;
    });
  }

  private normalize(j: any, params: JobSearchParams): NormalizedJob {
    const isRemote = j.remote || j.location.toLowerCase().includes("remote") || j.title.toLowerCase().includes("remote") || params.remote;
    
    return {
      id: `arbeitnow-${j.slug}`,
      source: this.name,
      sourceJobId: j.slug,
      title: j.title,
      company: j.company_name,
      location: j.location,
      remote: !!isRemote,
      description: j.description || "",
      postedAt: new Date(j.created_at * 1000).toISOString(),
      applyUrl: j.url,
      skills: j.tags || [],
      metadata: {
        job_types: j.job_types
      }
    };
  }
}
