import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Calendar, FileText, GraduationCap, CheckCircle2, Bell, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/notifications")({
  component: Notifs,
});

const iconMap: Record<string, any> = {
  job: Briefcase, interview: Calendar, resume: FileText, course: GraduationCap, application: CheckCircle2, system: Bell
};

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Notifs() {
  const { notifications, clearAll } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Everything worth knowing, in one timeline.</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </Button>
        )}
      </div>
      
      <div className="glass rounded-2xl p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <ol className="relative border-l border-border pl-6">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] ?? Bell;
              return (
                <li key={n.id} className="mb-6 last:mb-0">
                  <div className="absolute -left-3 grid h-6 w-6 place-items-center rounded-full gradient-brand text-white shadow-glow">
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="rounded-xl bg-card p-4 border border-border/60">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{timeAgo(n.timestamp)}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
