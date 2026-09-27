import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { TrendingUp, Send, Calendar, CheckCircle2, ArrowRight, Sparkles, Plus } from "lucide-react";
import { atsBreakdown } from "@/lib/data";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import { useTracker } from "@/hooks/use-tracker";
import { useNotifications } from "@/hooks/use-notifications";
import { Building2, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { preferences } = useOnboarding();
  const { user } = useAuth();
  const { appliedJobsList } = useAppliedJobs();
  const { board } = useTracker();
  const { notifications } = useNotifications();
  
  const [fullName, setFullName] = useState("");
  const [profileComplete, setProfileComplete] = useState(25);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.full_name) setFullName(data.full_name);
            let score = 25;
            if (data.location) score += 25;
            if (data.preferred_role) score += 25;
            if (data.skills?.length > 0) score += 25;
            setProfileComplete(score);
          }
        });

      // Fetch application activity trend
      const fetchTrend = async () => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const { data } = await supabase
          .from("application_activity")
          .select("status, created_at")
          .eq("user_id", user.id)
          .gte("created_at", sixMonthsAgo.toISOString());

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonthIdx = new Date().getMonth();
        const grouped = new Map();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          let mIdx = currentMonthIdx - i;
          if (mIdx < 0) mIdx += 12;
          grouped.set(months[mIdx], { m: months[mIdx], applied: 0, interviews: 0 });
        }

        if (data) {
          for (const row of data) {
            const date = new Date(row.created_at);
            const m = months[date.getMonth()];
            if (grouped.has(m)) {
              const entry = grouped.get(m);
              if (row.status === 'Applied') entry.applied++;
              if (row.status === 'Interview') entry.interviews++;
            }
          }
        }
        
        setTrendData(Array.from(grouped.values()));
      };
      
      fetchTrend();
    }
  }, [user]);

  const overallAts = atsBreakdown.length > 0 ? Math.round(atsBreakdown.reduce((sum, b) => sum + b.score, 0) / atsBreakdown.length) : 0;
  
  const completionPercentage = profileComplete;

  const kpis = [
    { label: "Total Applications", value: appliedJobsList.length, delta: "+0", icon: Send, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Interviews Lined Up", value: board["Interview"]?.length || 0, delta: "+0", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
    { 
      label: "Offers Received", 
      value: board["Offer"]?.length || 0, 
      delta: "+0", 
      icon: TrendingUp, 
      color: "text-emerald-500", bg: "bg-emerald-500/10"
    },
    { label: "Overall ATS Score", value: preferences.resumeUploaded ? (overallAts || 82) : overallAts, delta: "+0", icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header section with gradient and slight background */}
      <div className="relative overflow-hidden rounded-[2rem] glass-strong p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/10 rounded-full mix-blend-multiply blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back{fullName ? `, ${fullName.split(" ")[0]}` : ""} 👋
            </h1>
            {preferences.preferredJob ? (
              <p className="text-muted-foreground mt-2 text-lg">Ready for your next role as a <span className="font-medium text-foreground">{preferences.preferredJob}</span>?</p>
            ) : (
              <p className="text-muted-foreground mt-2 text-lg">Here's your career pulse for today.</p>
            )}
          </div>
          <Link to="/dashboard/jobs">
            <Button size="lg" className="gradient-brand text-white shadow-glow rounded-xl">
              <Sparkles className="mr-2 h-5 w-5" /> Discover Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI sleek strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${k.bg} ${k.color}`}>
              <k.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-none mb-1">{k.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{k.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Recommended Jobs & Trends */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Matches highlighted */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Top AI Matches</h2>
                <p className="text-muted-foreground text-sm">Jobs selected based on your preferences</p>
              </div>
              <Link to="/dashboard/jobs" className="text-sm font-medium text-brand-purple hover:underline flex items-center">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="glass flex flex-col items-center justify-center rounded-[2rem] p-12 text-center shadow-soft">
              <Sparkles className="h-10 w-10 text-brand-purple mb-4" />
              <h3 className="text-xl font-bold mb-2">Find your next role</h3>
              <p className="text-muted-foreground mb-6">Discover jobs perfectly matched to your skills using our AI Aggregator.</p>
              <Link to="/dashboard/jobs">
                <Button className="gradient-brand text-white">Go to AI Job Finder</Button>
              </Link>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="glass rounded-[2rem] p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Activity Overview</h2>
              <Badge variant="secondary" className="rounded-full">Last 6 months</Badge>
            </div>
            <div className="h-72 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: '1rem', boxShadow: 'var(--shadow-soft)' }} />
                    <Area type="monotone" dataKey="applied" stroke="var(--color-brand)" fill="url(#g1)" strokeWidth={3} activeDot={{ r: 6, fill: "var(--color-brand)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No application data available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          {/* ATS Score Radial */}
          <div className="glass rounded-[2rem] p-6 shadow-soft">
            <h3 className="text-lg font-bold mb-4">ATS Analysis</h3>
            <div className="h-48 relative flex items-center justify-center">
              {overallAts > 0 ? (
                <>
                  <ResponsiveContainer>
                    <RadialBarChart innerRadius="75%" outerRadius="100%" data={[{ n: "score", v: overallAts, fill: "var(--color-brand-purple)" }]} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="v" cornerRadius={20} background={{ fill: "var(--color-secondary)" }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-4xl font-bold text-gradient">{overallAts}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                      {overallAts >= 80 ? "Excellent" : overallAts >= 50 ? "Average" : "Needs work"}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center px-4">
                  <p className="text-sm text-muted-foreground mb-4">Upload your resume to check your ATS score.</p>
                  <Link to="/dashboard/ats">
                    <Button variant="outline" size="sm" className="rounded-full">Run Analysis</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Profile Completion */}
          <div className="glass rounded-[2rem] p-6 shadow-soft">
            <h3 className="text-lg font-bold mb-4">Profile Strength</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold">{completionPercentage}%</span>
              <span className="text-sm text-muted-foreground mb-1">
                {completionPercentage === 100 ? "All set!" : "Keep going"}
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Notifications */}
          <div className="glass rounded-[2rem] p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Recent Updates</h3>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="flex gap-4 items-start">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/50 text-sm border border-border/50">
                      {n.type === 'match' ? '🔥' : n.type === 'interview' ? '📅' : '🔔'}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor((Date.now() - n.timestamp) / 1000) < 60 ? "Just now" : 
                         Math.floor((Date.now() - n.timestamp) / 1000) < 3600 ? `${Math.floor((Date.now() - n.timestamp) / 60000)}m ago` : 
                         `${Math.floor((Date.now() - n.timestamp) / 3600000)}h ago`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">You're all caught up!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
