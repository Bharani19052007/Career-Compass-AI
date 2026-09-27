import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerPilot AI" },
      { name: "description", content: "Your AI-powered job dashboard." },
      { property: "og:title", content: "Dashboard — CareerPilot AI" },
      { property: "og:description", content: "Your AI-powered job dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { loading } = useAuth(true); // requireAuth = true

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
      </div>
    );
  }

  return <DashboardShell />;
}
