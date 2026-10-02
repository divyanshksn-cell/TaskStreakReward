import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, CalendarClock, Check, MoreVertical } from "lucide-react";
import { Task, useGame } from "@/context/GameContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  high: "bg-rose-700/10 text-rose-800 border-rose-700/20 dark:text-rose-300",
  medium: "bg-amber-600/10 text-amber-800 border-amber-600/20 dark:text-amber-300",
  low: "bg-primary/10 text-primary border-primary/20",
};

const categoryColors = {
  work: "bg-sky-700",
  personal: "bg-amber-500",
  health: "bg-emerald-600",
  learning: "bg-violet-600",
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ");
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
};

export function TaskCard({ task }: TaskCardProps) {
  const { toggleTask, deleteTask } = useGame();
  const deadline = task.dueAt ? formatDateTime(task.dueAt) : task.dueTime;
  const overdue = Boolean(task.dueAt && !task.completed && new Date(task.dueAt).getTime() < Date.now());

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative rounded-2xl border p-4 transition-all duration-200",
        task.completed 
          ? "border-transparent bg-muted/35 opacity-65"
          : "border-border/75 bg-card/90 shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => toggleTask(task.id)}
          aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
          aria-pressed={task.completed}
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            task.completed
              ? "scale-105 border-primary bg-primary text-primary-foreground"
              : "border-primary/35 text-transparent hover:border-primary hover:bg-primary/5"
          )}
        >
          <Check size={15} strokeWidth={3} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="mb-1 flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className={cn("h-2 w-2 flex-shrink-0 rounded-full", categoryColors[task.category])} />
            <h3 className={cn(
              "truncate text-sm font-bold transition-all sm:text-base",
              task.completed ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
            <span className="capitalize">{task.category}</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span className={cn("rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]", priorityColors[task.priority])}>
               {task.priority}
            </span>
            {deadline && (
              <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium", overdue ? "bg-destructive/10 text-destructive" : "bg-secondary/70 text-secondary-foreground")}>
                <CalendarClock size={12} aria-hidden="true" />
                <span>{task.dueAt ? `Due ${deadline}` : deadline}</span>
              </span>
            )}
            {task.alarmAt && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/25 px-2 py-0.5 font-semibold text-amber-900 dark:text-amber-200">
                <BellRing size={12} aria-hidden="true" />
                <span>Alarm {formatDateTime(task.alarmAt)}</span>
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`Actions for ${task.title}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <MoreVertical size={17} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (window.confirm(`Delete “${task.title}”? This cannot be undone.`)) deleteTask(task.id);
              }}
            >
              Delete quest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AnimatePresence>
        {task.completed && (
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1.5, opacity: 0 }}
             transition={{ duration: 0.5 }}
             className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none"
           />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
