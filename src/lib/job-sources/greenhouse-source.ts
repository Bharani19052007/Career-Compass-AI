import { JobSource, JobSearchParams, NormalizedJob } from "./types";

export class GreenhouseSource implements JobSource {
  name = "greenhouse";

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    // Greenhouse doesn't have a global search API. You query by specific company board.
    // We expect a comma-separated list of boards in the environment variable.
    const boardsStr = process.env.GREENHOUSE_BOARDS || "stripe,airbnb"; 
    const boards = boardsStr.split(",").map((b) => b.trim()).filter(Boolean);

    if (boards.length === 0) {
      return [];
    }

    const allJobs: NormalizedJob[] = [];

    // Fetch from all configured boards concurrently
    const boardPromises = boards.map(async (boardToken) => {
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
        const res = await fetch(url);
        
        if (!res.ok) {
          console.warn(`Greenhouse board ${boardToken} failed: ${res.status}`);
          return [];
        }
        
        const data = await res.json();
        const jobs = data.jobs || [];
        
        return jobs.map((j: any) => this.normalize(j, boardToken, params));
      } catch (error) {
        console.error(`Failed to fetch Greenhouse board ${boardToken}:`, error);
        return [];
      }
    });

    const results = await Promise.all(boardPromises);
    
    for (const boardJobs of results) {
      allJobs.push(...boardJobs);
    }

    // Now filter the jobs in-memory based on the search params
    return this.filterJobs(allJobs, params);
  }

  private filterJobs(jobs: NormalizedJob[], params: JobSearchParams): NormalizedJob[] {
    return jobs.filter((job) => {
      // Keyword matching
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(kw);
        const matchesDesc = job.description.toLowerCase().includes(kw);
        if (!matchesTitle && !matchesDesc) return false;
      }
      
      // Remote matching
      if (params.remote && !job.remote) return false;
      
      // Location matching
      if (params.location && params.location !== "all") {
        if (!job.location?.toLowerCase().includes(params.location.toLowerCase())) {
          return false;
        }
      }

      // Country matching (heuristic)
      if (params.country && params.country !== "all") {
        const countryMap: Record<string, string[]> = {
          "in": ["india", "bangalore", "mumbai", "delhi", "hyderabad", "chennai", "pune", "gurgaon"],
          "us": ["usa", "united states", "new york", "san francisco", "remote us", "chicago", "atlanta"],
          "gb": ["uk", "united kingdom", "london", "england"],
          "ca": ["canada", "toronto", "vancouver"],
          "au": ["australia", "sydney", "melbourne"],
          "sg": ["singapore"]
        };
        
        const locLower = job.location?.toLowerCase() || "";
        const expectedTerms = countryMap[params.country] || [];
        
        const matchesCountry = expectedTerms.some(term => locLower.includes(term));
        if (!matchesCountry && locLower !== "remote") {
          return false;
        }
      }

      return true;
    });
  }

  private normalize(j: any, boardToken: string, params: JobSearchParams): NormalizedJob {
    const loc = j.location?.name || "Unknown";
    const title = j.title || "";
    const isRemote = loc.toLowerCase().includes("remote") || title.toLowerCase().includes("remote");

    // Greenhouse sometimes puts employment type in metadata or title, hard to extract generically without custom parsing
    return {
      id: `gh-${j.id}`,
      source: this.name,
      sourceJobId: String(j.id),
      title: title,
      company: boardToken.charAt(0).toUpperCase() + boardToken.slice(1), // Basic capitalization since company name isn't always at root
      location: loc,
      remote: isRemote,
      description: j.content || "", // Contains HTML
      postedAt: j.updated_at ? new Date(j.updated_at).toISOString() : new Date().toISOString(),
      applyUrl: j.absolute_url,
      skills: [],
      metadata: {
        department: j.departments?.[0]?.name,
        offices: j.offices?.map((o: any) => o.name),
      }
    };
  }
}
