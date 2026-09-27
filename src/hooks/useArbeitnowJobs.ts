import { useQuery } from "@tanstack/react-query";

export type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
};

export function useArbeitnowJobs(page = 1, query = "", location = "", type = "", remote = "all") {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adzuna_jobs", page, query, location, type, remote],
    queryFn: async () => {
      const appId = "dd7e672c";
      const appKey = "ba5cd81793c7065069a8c5026881261b";
      const resultsPerPage = 54; // Divisible by both 3 (xl grid) and 2 (md grid)
      
      let url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=${resultsPerPage}`;
      let finalQuery = query;
      if (type === "internship") {
        finalQuery = query ? `${query} internship` : "internship";
      }
      if (remote === "remote") {
        finalQuery = finalQuery ? `${finalQuery} remote` : "remote";
      }
      
      if (finalQuery) {
        url += `&what=${encodeURIComponent(finalQuery)}`;
      }
      if (location && location !== "all") {
        url += `&where=${encodeURIComponent(location)}`;
      }
      if (type === "full-time") url += "&full_time=1";
      if (type === "part-time") url += "&part_time=1";
      if (type === "contract") url += "&contract=1";
      if (type === "permanent") url += "&permanent=1";

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      
      const mapped: ArbeitnowJob[] = json.results.map((j: any) => {
        const loc = j.location?.display_name || "India";
        const isRemote = remote === "remote" || loc.toLowerCase().includes("remote") || (j.title || "").toLowerCase().includes("remote");
        return {
          slug: String(j.id),
          company_name: j.company?.display_name || "Unknown Company",
          title: j.title,
          description: j.description || "",
          remote: isRemote,
          url: j.redirect_url,
          tags: j.category?.label ? [j.category.label] : [],
          job_types: [],
          location: loc,
          created_at: Math.floor(new Date(j.created).getTime() / 1000),
        };
      });

      const total = json.count || 0;
      const last_page = Math.ceil(total / resultsPerPage);

      return {
        jobs: mapped,
        meta: {
          current_page: page,
          last_page: last_page > 0 ? last_page : 1,
          per_page: resultsPerPage,
          total: total,
        }
      };
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    refetchOnWindowFocus: false, // don't refetch just because user switched tabs
  });

  return { 
    jobs: data?.jobs || [], 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null, 
    meta: data?.meta || null 
  };
}
