import { useState, useEffect } from 'react';

export interface MSLearnCourse {
  id: string;
  title: string;
  platform: string;
  rating: number;
  duration: string;
  level: string;
  thumb: string;
  url: string;
  icon_url?: string;
  summary?: string;
}

// In-memory cache so we only download the JSON once per session
let cachedModules: MSLearnCourse[] | null = null;
let fetchPromise: Promise<MSLearnCourse[]> | null = null;

export function useMSLearnCourses(query: string = "") {
  const [courses, setCourses] = useState<MSLearnCourse[]>(cachedModules || []);
  const [loading, setLoading] = useState(!cachedModules);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (cachedModules) {
        setLoading(false);
        return;
      }

      if (!fetchPromise) {
        fetchPromise = fetch("https://learn.microsoft.com/api/catalog/")
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch MS Learn Catalog");
            return res.json();
          })
          .then(data => {
            const modules = (data.modules || []).map((m: any) => ({
              id: m.uid,
              title: m.title,
              platform: "Microsoft Learn",
              rating: m.rating?.average || 4.5,
              duration: m.duration_in_minutes ? `${Math.round(m.duration_in_minutes / 60) || 1}h` : "1h",
              level: m.levels?.[0] || "Beginner",
              thumb: "📚",
              icon_url: m.icon_url,
              url: m.url,
              summary: m.summary
            }));
            cachedModules = modules;
            return modules;
          });
      }

      try {
        const modules = await fetchPromise;
        if (mounted) {
          setCourses(modules);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter and paginate locally
  const filtered = courses.filter(c => 
    !query || 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.summary?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 50); // Just return top 50

  return { courses: filtered, loading, error };
}
