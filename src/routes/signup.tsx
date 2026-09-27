import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout, Divider, SocialButtons } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — CareerPilot AI" },
      { name: "description", content: "Create your CareerPilot AI account. Free forever for students." },
      { property: "og:title", content: "Create account — CareerPilot AI" },
      { property: "og:description", content: "Free forever for students." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/onboarding";
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Free forever for students.">
      <form onSubmit={handleSignup} className="space-y-4">
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div>
          <Label htmlFor="name">Full name</Label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" placeholder="Aarav Sharma" className="pl-9" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@college.edu" className="pl-9" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" className="pl-9" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="confirm">Confirm</Label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirm" type="password" className="pl-9" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full gradient-brand text-white shadow-glow" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <Divider />
      <SocialButtons />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-medium text-brand-purple hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
