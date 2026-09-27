import { JobSource, JobSearchParams, NormalizedJob } from "./types";

export class AdzunaSource implements JobSource {
  name = "adzuna";

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    
    if (!appId || !appKey) {
      console.warn("Adzuna API keys missing.");
      return [];
    }

    const page = params.page || 1;
    const limit = params.limit || 50;
    const country = params.country || "in"; // default to India if not specified

    let url = `https://api.adzuna.com/v1/api/jobs/${country.toLowerCase()}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=${limit}`;

    let queryParts = [];
    if (params.keyword) queryParts.push(params.keyword);
    if (params.type === "internship") queryParts.push("internship");
    if (params.remote) queryParts.push("remote");
    
    const finalQuery = queryParts.join(" ");
    if (finalQuery) {
      url += `&what=${encodeURIComponent(finalQuery)}`;
    }
    
    if (params.location && params.location !== "all") {
      url += `&where=${encodeURIComponent(params.location)}`;
    }
    
    if (params.type === "full-time") url += "&full_time=1";
    if (params.type === "part-time") url += "&part_time=1";
    if (params.type === "contract") url += "&contract=1";
    if (params.type === "permanent") url += "&permanent=1";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Adzuna API error: ${res.status}`);
      const json = await res.json();
      
      return json.results.map((j: any) => this.normalize(j, params.remote));
    } catch (error) {
      console.error("Adzuna search failed:", error);
      throw error; // Rethrow to let aggregator handle it
    }
  }

  private normalize(j: any, remoteRequested?: boolean): NormalizedJob {
    const loc = j.location?.display_name || "Unknown";
    const isRemote = remoteRequested || loc.toLowerCase().includes("remote") || (j.title || "").toLowerCase().includes("remote");
    
    const salaryDisplay = j.salary_min && j.salary_max 
      ? `${j.salary_min.toLocaleString()} - ${j.salary_max.toLocaleString()} ${j.salary_currency || 'INR'}`
      : undefined;

    return {
      id: `adzuna-${j.id}`,
      source: this.name,
      sourceJobId: String(j.id),
      title: j.title,
      company: j.company?.display_name || "Unknown Company",
      location: loc,
      remote: !!isRemote,
      description: j.description || "",
      salaryMin: j.salary_min,
      salaryMax: j.salary_max,
      salaryDisplay,
      postedAt: new Date(j.created).toISOString(),
      applyUrl: j.redirect_url,
      skills: j.category?.label ? [j.category.label] : [],
      metadata: {
        category: j.category?.tag
      }
    };
  }
}
