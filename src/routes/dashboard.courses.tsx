import { createFileRoute } from "@tanstack/react-router";
import { CourseCard } from "@/components/site/CourseCard";
import { useMSLearnCourses } from "@/hooks/useMSLearnCourses";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";

export const Route = createFileRoute("/dashboard/courses")({
  component: Courses,
});

function Courses() {
  const { preferences } = useOnboarding();
  const [search, setSearch] = useState(preferences.preferredJob || "");
  const { courses, loading, error } = useMSLearnCourses(search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Learn new skills through Microsoft Learn.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-16 text-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Fetching Microsoft Learn Catalog...</p>
        </div>
      ) : error ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-16 text-center gap-4">
          <p className="text-destructive font-semibold">Failed to load courses</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c) => <CourseCard key={c.id} c={c as any} />)}
        </div>
      ) : (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
