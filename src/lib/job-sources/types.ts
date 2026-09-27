export interface NormalizedJob {
  id: string; // Our internal UUID or hash
  source: string; // e.g. "adzuna", "greenhouse"
  sourceJobId: string; // The ID from the source

  title: string;
  company: string;

  location?: string;
  country?: string;

  remote: boolean;
  employmentType?: string; // "full-time", "contract", etc.

  description: string;
  responsibilities?: string[];
  requirements?: string[]; // Raw requirements from source
  
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryDisplay?: string; // e.g. "₹6–10 LPA"

  postedAt: string; // ISO String
  closingDate?: string;

  applyUrl: string;
  sourceUrl?: string;
  companyLogo?: string; // URL to logo if available

  skills: string[]; // Normalized skills extracted
  preferredSkills?: string[];
  benefits?: string[];
  
  experienceLevel?: string;

  // AI-enriched fields (populated later in the pipeline)
  matchScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];

  metadata?: Record<string, unknown>;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  country?: string;
  remote?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export interface JobSearchResponse {
  jobs: NormalizedJob[];
  total: number;
  page: number;
  sources: Record<string, { status: "success" | "error"; jobsFound: number; durationMs: number; error?: string }>;
}

export interface JobSource {
  name: string;
  searchJobs(params: JobSearchParams): Promise<NormalizedJob[]>;
  getJob?(id: string): Promise<NormalizedJob | null>;
}
