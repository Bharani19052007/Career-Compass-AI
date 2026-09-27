import { useQuery } from "@tanstack/react-query";
import { getJobsFn } from "../lib/jobs-api";
import { JobSearchParams } from "../lib/job-sources/types";

export function useJobs(params: JobSearchParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
      return await getJobsFn({ data: params });
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    page: data?.page || 1,
    sources: data?.sources || {},
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
