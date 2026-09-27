import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand"><Sparkles className="h-4 w-4 text-white" /></div>
              <span className="font-bold">CareerPilot <span className="text-gradient">AI</span></span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">The AI copilot for your first job. Built for students, by students.</p>
          </div>
          {[
            { h: "Product", l: ["Features", "AI Matching", "ATS Score", "Roadmaps"] },
            { h: "Company", l: ["About", "Careers", "Press", "Contact"] },
            { h: "Resources", l: ["Blog", "Guides", "Community", "Support"] },
          ].map((c) => (
            <div key={c.h}>
              <h4 className="mb-3 text-sm font-semibold">{c.h}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {c.l.map((i) => <li key={i}><a href="#" className="hover:text-foreground">{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 CareerPilot AI. All rights reserved.</p>
          <div className="flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter"><Twitter className="h-4 w-4 hover:text-foreground" /></a>
            <a href="#" aria-label="GitHub"><Github className="h-4 w-4 hover:text-foreground" /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4 hover:text-foreground" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
