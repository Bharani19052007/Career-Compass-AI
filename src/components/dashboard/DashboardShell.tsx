import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard, Sparkles, FileText, Gauge, Target, GraduationCap, FolderKanban,
  Bookmark, Send, KanbanSquare, Bell, Settings, User, Menu, LogOut, Search, Moon, Sun, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { ArbeitnowJob } from "@/hooks/useArbeitnowJobs";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "AI Job Finder", to: "/dashboard/jobs", icon: Sparkles },
  { label: "Resume", to: "/dashboard/resume", icon: FileText },
  { label: "ATS Score", to: "/dashboard/ats", icon: Gauge },
  { label: "Skill Gap", to: "/dashboard/skill-gap", icon: Target },
  { label: "Courses", to: "/dashboard/courses", icon: GraduationCap },
  { label: "Projects", to: "/dashboard/projects", icon: FolderKanban },
  { label: "Saved Jobs", to: "/dashboard/saved", icon: Bookmark },
  { label: "Applied", to: "/dashboard/applied", icon: Send },
  { label: "Tracker", to: "/dashboard/tracker", icon: KanbanSquare },
  { label: "Notifications", to: "/dashboard/notifications", icon: Bell },
  { label: "Profile", to: "/dashboard/profile", icon: User },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

export function DashboardShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { addAppliedJob } = useAppliedJobs();
  const { user } = useAuth();
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.full_name || "");
      supabase
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) setProfileName(data.full_name);
        });
    }
  }, [user]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-hero">
      {/* Mobile Sidebar Backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border/60 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0 overflow-y-auto" : "-translate-x-full overflow-hidden"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <Link to="/" className="font-bold tracking-tight">CareerPilot <span className="text-gradient">AI</span></Link>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hidden lg:flex hover:bg-sidebar-accent" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Collapse sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-2">
          {nav.map((n) => {
            const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "gradient-brand text-white shadow-glow"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {profileName ? profileName.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{profileName || "User"}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</div>
              </div>
              <Link to="/"><Button size="icon" variant="ghost" aria-label="logout"><LogOut className="h-4 w-4" /></Button></Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur">
          {/* Left: Menu & CareerPilot Branding */}
          <div className="flex flex-1 items-center gap-2.5 justify-start">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hover:bg-accent transition-colors ${sidebarOpen ? "lg:hidden" : ""}`} 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {!sidebarOpen && (
              <Link to="/" className="flex items-center gap-2 group transition-opacity duration-300">
                <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand shadow-glow">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-bold tracking-tight text-base hidden sm:inline-block">
                  CareerPilot<span className="text-gradient"> AI</span>
                </span>
              </Link>
            )}
          </div>

          {/* Center: Removed Search input */}
          <div className="flex-1 flex justify-center max-w-lg md:max-w-xl mx-4">
          </div>

          {/* Right: Actions */}
          <div className="flex flex-1 items-center gap-3 justify-end">
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent" onClick={() => setDark((d) => !d)} aria-label="theme">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent" aria-label="notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 text-base shadow-sm border border-border/60 cursor-pointer ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2">
                  <AvatarFallback className="font-semibold text-sm">
                    {profileName ? profileName.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{profileName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/notifications" className="flex items-center gap-2 cursor-pointer">
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
