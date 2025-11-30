import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Tag, MoreVertical } from "lucide-react";
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
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const categoryColors = {
  work: "bg-slate-500",
  personal: "bg-pink-500",
  health: "bg-green-500",
  learning: "bg-indigo-500",
};

export function TaskCard({ task }: TaskCardProps) {
  const { toggleTask, deleteTask } = useGame();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative p-4 rounded-2xl border transition-all duration-300",
        task.completed 
          ? "bg-muted/30 border-transparent opacity-60" 
          : "bg-white dark:bg-white/5 border-border shadow-sm hover:shadow-md hover:border-primary/30"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox / Complete Button */}
        <button
          onClick={() => toggleTask(task.id)}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            task.completed
              ? "bg-primary border-primary scale-110"
              : "border-muted-foreground/40 hover:border-primary hover:scale-110"
          )}
        >
          {task.completed && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "w-2 h-2 rounded-full",
              categoryColors[task.category] || "bg-gray-500"
            )} />
            <h3 className={cn(
              "font-medium text-base truncate transition-all",
              task.completed ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
             {task.dueTime && (
               <div className="flex items-center gap-1">
                 <Clock size={12} />
                 <span>{task.dueTime}</span>
               </div>
             )}
             <div className={cn("px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider", priorityColors[task.priority])}>
               {task.priority}
             </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg">
              <MoreVertical size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>
              Delete Quest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Streak Pulse Effect on Complete */}
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
