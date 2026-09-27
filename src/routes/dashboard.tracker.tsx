import { createFileRoute } from "@tanstack/react-router";
import { motion, Reorder } from "motion/react";
import { useState, useEffect } from "react";
import { useTracker, COLUMNS, type TrackerColumn } from "@/hooks/use-tracker";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import type { NormalizedJob } from "@/lib/job-sources/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoveRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/tracker")({
  component: Tracker,
});

const colorMap: Record<TrackerColumn, string> = {
  Saved: "from-slate-400/40 to-slate-400/10",
  Applied: "from-blue-500/40 to-blue-500/10",
  Shortlisted: "from-purple-500/40 to-purple-500/10",
  Interview: "from-amber-500/40 to-amber-500/10",
  Offer: "from-emerald-500/40 to-emerald-500/10",
  Rejected: "from-rose-500/40 to-rose-500/10",
};

import { pushNotification } from "@/hooks/use-notifications";

function Tracker() {
  const { board, setBoard, setColumn } = useTracker();
  const { appliedJobsList } = useAppliedJobs();
  
  // Auto-import newly applied jobs that aren't in the tracker anywhere yet
  useEffect(() => {
    let hasChanges = false;
    const newBoard = { ...board };
    
    // Check all applied jobs
    for (const appliedJob of appliedJobsList) {
      // Is this job already somewhere in the tracker?
      let found = false;
      for (const col of COLUMNS) {
        if (newBoard[col].some(j => (j as any).id === (appliedJob as any).id)) {
          found = true;
          break;
        }
      }
      
      // If not found, add it to Applied
      if (!found) {
        newBoard["Applied"] = [...newBoard["Applied"], appliedJob as any];
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      setBoard(newBoard);
    }
  }, [appliedJobsList, board, setBoard]);

  const handleMove = (jobId: string, fromCol: TrackerColumn, toCol: TrackerColumn) => {
    if (fromCol === toCol) return;
    const newBoard = { ...board };
    const jobIndex = newBoard[fromCol].findIndex((j: any) => j.id === jobId);
    if (jobIndex === -1) return;
    
    // Create new arrays to trigger React state updates
    const sourceCol = [...newBoard[fromCol]];
    const [job] = sourceCol.splice(jobIndex, 1);
    const destCol = [...newBoard[toCol], job];
    
    newBoard[fromCol] = sourceCol;
    newBoard[toCol] = destCol;
    
    setBoard(newBoard);
    
    if (toCol === "Interview") pushNotification(`You got an interview for ${(job as any).title} at ${(job as any).company}!`, 'interview');
    else if (toCol === "Offer") pushNotification(`Congratulations! You received an offer for ${(job as any).title} from ${(job as any).company}!`, 'system');
    else if (toCol === "Shortlisted") pushNotification(`Moved ${(job as any).company} to Shortlisted. Keep it up!`, 'job');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
        <p className="text-muted-foreground">Drag cards inside a column to reorder your pipeline.</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col} className="min-w-[280px] flex-1">
            <div className={`glass rounded-2xl p-3`}>
              <div className={`mb-3 flex items-center justify-between rounded-xl bg-gradient-to-br ${colorMap[col]} px-3 py-2`}>
                <h3 className="font-semibold">{col}</h3>
                <Badge variant="secondary" className="rounded-full">{board[col].length}</Badge>
              </div>
              <Reorder.Group axis="y" values={board[col]} onReorder={(v) => setColumn(col, v)} className="space-y-2 min-h-[50px]">
                {board[col].map((j) => (
                  <Reorder.Item key={j.id} value={j} className="cursor-grab active:cursor-grabbing">
                    <motion.div whileDrag={{ scale: 1.03 }} className="glass rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-purple/20 to-blue-500/20 text-xs font-bold text-foreground border border-border/40">
                          {j.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{j.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{j.company}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] bg-secondary/50 capitalize">{j.source || "Web"}</Badge>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{j.location || "Remote"}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <MoveRight className="h-3 w-3" /> Move to
                        </span>
                        <Select 
                          value={col} 
                          onValueChange={(val) => handleMove(j.id as string, col as TrackerColumn, val as TrackerColumn)}
                        >
                          <SelectTrigger className="h-7 text-xs border-none shadow-none bg-secondary/30 focus:ring-0 px-2 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COLUMNS.map(c => (
                              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
                {board[col].length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No cards</div>
                )}
              </Reorder.Group>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
