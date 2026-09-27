import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CareerPilot AI" },
      { name: "description", content: "Sign in to your CareerPilot AI account." },
      { property: "og:title", content: "Sign in — CareerPilot AI" },
      { property: "og:description", content: "Sign in to your CareerPilot AI account." },
    ],
  }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your job hunt.">
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@college.edu" className="pl-9" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-brand-purple hover:underline">Forgot?</a>
          </div>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="w-full gradient-brand text-white shadow-glow" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <Divider />
      <SocialButtons />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? <Link to="/signup" className="font-medium text-brand-purple hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-hero lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand shadow-glow"><Sparkles className="h-5 w-5 text-white" /></div>
          <span className="font-bold">CareerPilot <span className="text-gradient">AI</span></span>
        </Link>
        <div>
          <blockquote className="glass rounded-2xl p-6 text-lg font-medium">
            "CareerPilot got me 4 interviews in 2 weeks — including my dream role at Nebula."
          </blockquote>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-lg">🧑‍💻</div>
            <div>
              <div className="text-sm font-semibold">Aarav Sharma</div>
              <div className="text-xs text-muted-foreground">CS Undergrad · Bengaluru</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">© 2026 CareerPilot AI</div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-glow">
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand"><Sparkles className="h-5 w-5 text-white" /></div>
            <span className="font-bold">CareerPilot <span className="text-gradient">AI</span></span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function SocialButtons() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
    }
  };

  return (
    <div className="grid gap-2">
      <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="#EA4335" d="M12 10.2v3.6h5.06c-.22 1.17-.9 2.16-1.9 2.82v2.34h3.06c1.8-1.66 2.84-4.1 2.84-7.02 0-.68-.06-1.34-.18-1.98H12z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.06-2.34c-.86.58-1.96.92-3.56.92-2.74 0-5.06-1.84-5.88-4.32H2.98v2.42C4.62 19.62 8.02 22 12 22z"/><path fill="#FBBC05" d="M6.12 13.84A6 6 0 0 1 5.8 12c0-.64.12-1.26.32-1.84V7.74H2.98A10 10 0 0 0 2 12c0 1.62.38 3.14 1.02 4.26l3.1-2.42z"/><path fill="#4285F4" d="M12 6.4c1.46 0 2.78.5 3.82 1.48l2.86-2.86C16.96 3.4 14.7 2.5 12 2.5 8.02 2.5 4.62 4.88 2.98 8.26l3.14 2.42C6.94 8.24 9.26 6.4 12 6.4z"/></svg>
        Continue with Google
      </Button>
      <Button variant="outline" className="w-full">
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.74 1.27 3.41.97.1-.76.4-1.28.74-1.57-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.28 1.2-3.09-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.5 3.2-1.18 3.2-1.18.63 1.59.23 2.77.11 3.06.75.81 1.2 1.83 1.2 3.09 0 4.43-2.7 5.4-5.27 5.69.41.36.77 1.06.77 2.14v3.17c0 .3.2.65.79.54A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg>
        Continue with GitHub
      </Button>
    </div>
  );
}
