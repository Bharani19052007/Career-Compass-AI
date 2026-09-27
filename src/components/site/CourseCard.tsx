import { Star, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CourseCard({ c }: { c: { title: string; platform: string; rating: number; duration: string; level: string; thumb: string; url?: string; icon_url?: string } }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-5 flex flex-col">
      {c.icon_url ? (
        <div className="grid h-24 w-full place-items-center rounded-xl bg-gradient-to-br from-brand/20 to-brand-purple/20 p-2">
           <img src={c.icon_url} alt={c.title} className="h-16 w-16 object-contain" />
        </div>
      ) : (
        <div className="grid h-24 w-full place-items-center rounded-xl bg-gradient-to-br from-brand/20 to-brand-purple/20 text-5xl">{c.thumb}</div>
      )}
      <h3 className="mt-4 font-semibold line-clamp-2" title={c.title}>{c.title}</h3>
      <p className="text-sm text-muted-foreground">{c.platform}</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{c.rating}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.duration}</span>
        <Badge variant="outline" className="capitalize">{c.level}</Badge>
      </div>
      <div className="mt-auto pt-4">
        {c.url ? (
          <a href={c.url} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gradient-brand text-white">View Course</Button>
          </a>
        ) : (
          <Button className="w-full gradient-brand text-white">Enroll</Button>
        )}
      </div>
    </motion.div>
  );
}
