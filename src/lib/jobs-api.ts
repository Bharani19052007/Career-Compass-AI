import { createServerFn } from "@tanstack/react-start";
import { searchAllJobs } from "./job-sources/aggregator";
import { JobSearchParams, NormalizedJob } from "./job-sources/types";
import { analyzeJobMatch } from "./ai-matcher";
import { getJobById } from "./db";

export const getJobsFn = createServerFn({ method: "GET" })
  .handler(async ({ data }) => {
    return await searchAllJobs(data as JobSearchParams);
  });

export const getJobByIdFn = createServerFn({ method: "GET" })
  .handler(async ({ data }) => {
    const id = data as string;
    return await getJobById(id);
  });

export const analyzeJobMatchFn = createServerFn({ method: "POST" })
  .handler(async ({ data }) => {
    const { job, skills, experience } = data as { job: NormalizedJob, skills: string[], experience: string };
    return await analyzeJobMatch(job, skills, experience);
  });

export const analyzeSkillGapFn = createServerFn({ method: "POST" })
  .handler(async ({ data }) => {
    const { jobs, skills, preferredRole } = data as { jobs: NormalizedJob[], skills: string[], preferredRole?: string };
    // dynamic import to avoid circular dependency in some bundlers just in case
    const { analyzeSkillGap } = await import('./ai-matcher');
    return await analyzeSkillGap(jobs, skills, preferredRole);
  });
