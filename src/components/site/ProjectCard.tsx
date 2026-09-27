import { Github, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({ p }: { p: { title: string; difficulty: string; tech: string[]; time: string } }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{p.title}</h3>
        <Badge variant="outline">{p.difficulty}</Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Est. {p.time}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.tech.map((t) => <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>)}
      </div>
      <div className="mt-4 flex gap-2">
        <Button className="flex-1 gradient-brand text-white"><Rocket className="mr-1 h-4 w-4" />Start</Button>
        <Button variant="outline" size="icon"><Github className="h-4 w-4" /></Button>
      </div>
    </motion.div>
  );
}
