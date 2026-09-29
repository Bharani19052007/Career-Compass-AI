import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Sparkles, ArrowRight, Zap, Target, GraduationCap, BarChart3, ShieldCheck, Users, Building2, Briefcase,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Landing,
});

const stats = [
  { label: "Jobs Found", value: "1.2M+", icon: Briefcase },
  { label: "Students Placed", value: "48k+", icon: Users },
  { label: "Companies", value: "9,500+", icon: Building2 },
  { label: "AI Match Accuracy", value: "94%", icon: Target },
];

const features = [
  { icon: Sparkles, title: "AI Job Matching", desc: "Deep-learning ranker matches you to roles based on skills, projects, and intent — not keywords." },
  { icon: Target, title: "ATS Resume Score", desc: "Get an instant recruiter-grade score with keyword gaps and one-click fixes." },
  { icon: GraduationCap, title: "Skill Gap Roadmap", desc: "See exactly what to learn to unlock the next tier of roles. Personalized courses included." },
  { icon: BarChart3, title: "Application Tracker", desc: "Kanban board that follows every application from Saved to Offer." },
  { icon: ShieldCheck, title: "Verified Employers", desc: "We remove ghost jobs. Every posting is verified within 48 hours." },
  { icon: Zap, title: "Easy Apply", desc: "Apply the jobs easyly by use of the AI" },
];

const steps = [
  { n: "01", t: "Upload your resume", d: "PDF or DOCX. We extract skills, projects, and education in seconds." },
  { n: "02", t: "Get AI matches", d: "Our ranker surfaces the top 20 roles you're most likely to land." },
  { n: "03", t: "Close the gaps", d: "Follow a personalized roadmap of courses and projects." },
  { n: "04", t: "Track & land offers", d: "One Kanban for every application. Interview reminders included." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero overflow-x-hidden flex flex-col w-full">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="outline" className="glass rounded-full px-3 py-1 text-xs">
                <Sparkles className="mr-1.5 h-3 w-3 text-brand-purple" /> Now in public beta
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              Find Your Dream Job with <span className="text-gradient">AI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground"
            >
              CareerPilot AI matches college students and new grads to the right roles — with an ATS score, skill-gap roadmap, and interview tracker built in.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3"
            >
              <Link to="/signup" className="w-full sm:w-auto"><Button size="lg" className="w-full sm:w-auto gradient-brand text-white shadow-glow">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </motion.div>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {["🧑‍💻","👩‍🎓","🧑‍🎓","👩‍💼"].map((e, i) => (
                  <div key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-secondary text-base">{e}</div>
                ))}
              </div>
              <span>Trusted by 48,000+ students across 500+ colleges</span>
            </div>
          </div>

          {/* AI-themed illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
            className="relative min-w-0"
          >
            <div className="glass-strong relative rounded-3xl p-6 shadow-glow w-full overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand"><Sparkles className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">AI is analyzing…</div>
                    <div className="text-sm font-semibold">Top match for you</div>
                  </div>
                </div>
                <Badge className="gradient-brand text-white border-0">94% match</Badge>
              </div>
              <div className="mt-5 rounded-2xl border border-border/60 bg-card p-4 min-w-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-xl">🚀</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">Forward Deployed Engineer Intern</div>
                    <div className="text-xs text-muted-foreground">Nebula Labs · Remote · ₹8–12 LPA</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["React","TypeScript","Tailwind","Motion"].map(s => (
                    <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[{l:"Skill match", v:96},{l:"Culture fit", v:88},{l:"Salary fit", v:92}].map((r) => (
                  <div key={r.l}>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{r.l}</span><span>{r.v}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${r.v}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full gradient-brand" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}
              className="glass absolute -left-6 -top-6 hidden rounded-2xl p-3 md:block"
            >
              <div className="text-xs text-muted-foreground">ATS score</div>
              <div className="text-2xl font-bold text-gradient">82</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity }}
              className="glass absolute -bottom-4 -right-4 hidden rounded-2xl p-3 md:block"
            >
              <div className="text-xs text-muted-foreground">Interviews</div>
              <div className="text-2xl font-bold">6 <span className="text-sm text-success">▲ 2</span></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5">
              <s.icon className="h-5 w-5 text-brand-purple" />
              <div className="mt-3 text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full">Features</Badge>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Everything you need to land your first job</h2>
          <p className="mt-4 text-muted-foreground">Built for students. Powered by AI. Loved by recruiters.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass group rounded-2xl p-6 min-w-0"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-brand shadow-glow transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold truncate">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full">How it works</Badge>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">From resume to offer in 4 steps</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="glass rounded-2xl p-6 min-w-0">
              <div className="text-sm font-mono text-brand-purple shrink-0">{s.n}</div>
              <div className="mt-2 text-lg font-semibold truncate">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 md:p-14 shadow-glow">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full gradient-brand opacity-30 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to meet your AI career copilot?</h2>
              <p className="mt-3 text-muted-foreground">Free forever for students. Get matched to your first job in minutes.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end mt-6 md:mt-0">
              <Link to="/signup" className="w-full sm:w-auto"><Button size="lg" className="w-full sm:w-auto gradient-brand text-white shadow-glow">Create free account</Button></Link>
              <Link to="/login" className="w-full sm:w-auto"><Button size="lg" variant="outline" className="w-full sm:w-auto">Sign in</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
