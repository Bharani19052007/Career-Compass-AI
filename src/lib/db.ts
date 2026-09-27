import { supabase } from "./supabase";
import { NormalizedJob } from "./job-sources/types";

// Insert or update a job in Supabase
export async function upsertJob(job: NormalizedJob) {
  const { data, error } = await supabase
    .from("jobs")
    .upsert({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      remote: job.remote,
      employment_type: job.employmentType,
      description: job.description,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      salary_currency: job.salaryCurrency,
      salary_display: job.salaryDisplay,
      posted_at: job.postedAt,
      apply_url: job.applyUrl,
      source: job.source,
      source_job_id: job.sourceJobId,
      metadata: job.metadata,
      skills: job.skills
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error("Error upserting job:", error);
    throw error;
  }
  return data;
}

export async function getJobById(id: string): Promise<NormalizedJob | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    company: data.company,
    location: data.location,
    remote: data.remote,
    employmentType: data.employment_type,
    description: data.description,
    salaryMin: data.salary_min,
    salaryMax: data.salary_max,
    salaryCurrency: data.salary_currency,
    salaryDisplay: data.salary_display,
    postedAt: data.posted_at,
    applyUrl: data.apply_url,
    source: data.source,
    sourceJobId: data.source_job_id,
    metadata: data.metadata,
    skills: data.skills || []
  };
}
