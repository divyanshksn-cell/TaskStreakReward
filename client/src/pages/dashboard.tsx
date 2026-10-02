import React, { useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { TaskCard } from "@/components/task-card";
import { StatsHeader } from "@/components/stats-header";
import { BellRing, CalendarClock, Check, Compass, Plus, ScrollText, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const disciplineQuotes = [
  "Discipline is a promise you keep to your future self.",
  "Small steps, repeated, make a path through anything.",
  "Consistency turns an ordinary day into quiet progress.",
  "Show up before you feel ready; momentum follows.",
  "A steady pace will take you farther than a perfect start.",
  "Keep one small promise today, then keep another tomorrow.",
  "Progress grows where your attention returns each day.",
  "You do not need a new beginning; you need the next step.",
  "Make the useful choice often enough and it becomes your way.",
  "The work gets lighter when showing up becomes a habit.",
  "A little done with care is stronger than a lot left for later.",
  "Build trust in yourself one completed step at a time.",
];

const quoteSessionKey = "taskquest:discipline-quote:session";
const quotePreviousKey = "taskquest:discipline-quote:last";

function getSessionQuoteIndex() {
  if (typeof window === "undefined") return 0;

  try {
    const savedForSession = window.sessionStorage.getItem(quoteSessionKey);
    const sessionIndex = savedForSession === null ? -1 : Number(savedForSession);
    if (Number.isInteger(sessionIndex) && sessionIndex >= 0 && sessionIndex < disciplineQuotes.length) {
      return sessionIndex;
    }
  } catch {
    // Storage may be unavailable in private browsing; use an in-memory choice.
  }

  let previousIndex = -1;
  try {
    const savedPrevious = window.localStorage.getItem(quotePreviousKey);
    const parsedPrevious = savedPrevious === null ? -1 : Number(savedPrevious);
    if (Number.isInteger(parsedPrevious) && parsedPrevious >= 0 && parsedPrevious < disciplineQuotes.length) {
      previousIndex = parsedPrevious;
    }
  } catch {
    // A missing previous quote is fine; the session can still choose one.
  }

  const candidates = disciplineQuotes
    .map((_, index) => index)
    .filter((index) => index !== previousIndex);
  const nextIndex = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;

  try {
    window.sessionStorage.setItem(quoteSessionKey, String(nextIndex));
  } catch {
    // Keep the selected quote for this render if session storage is unavailable.
  }
  try {
    window.localStorage.setItem(quotePreviousKey, String(nextIndex));
  } catch {
    // The quote still works when persistent storage is unavailable.
  }

  return nextIndex;
}

export default function Dashboard() {
  const { tasks, addTask, requestAlarmPermission } = useGame();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);
  const [quoteIndex] = useState(getSessionQuoteIndex);
  const [isSaving, setIsSaving] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<"work" | "personal" | "health" | "learning">("personal");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskDueAt, setNewTaskDueAt] = useState("");
  const [newTaskAlarmAt, setNewTaskAlarmAt] = useState("");
  const wasAllTasksComplete = useRef(tasks.length > 0 && tasks.every((task) => task.completed));

  useEffect(() => {
    const openAddQuest = () => setIsAddOpen(true);
    window.addEventListener("taskquest:open-add", openAddQuest);
    return () => window.removeEventListener("taskquest:open-add", openAddQuest);
  }, []);

  useEffect(() => {
    const allTasksComplete = tasks.length > 0 && tasks.every((task) => task.completed);
    if (allTasksComplete && !wasAllTasksComplete.current) {
      setIsGratitudeOpen(true);
    }
    wasAllTasksComplete.current = allTasksComplete;
  }, [tasks]);

  const resetForm = () => {
    setNewTaskTitle("");
    setNewTaskCategory("personal");
    setNewTaskPriority("medium");
    setNewTaskDueAt("");
    setNewTaskAlarmAt("");
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSaving) return;

    setIsSaving(true);
    try {
      if (newTaskAlarmAt) {
        try {
          await requestAlarmPermission();
        } catch {
          // Permission can be unavailable or declined; keep the task and alarm time.
        }
      }
      addTask({
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        priority: newTaskPriority,
        dueAt: newTaskDueAt || undefined,
        alarmAt: newTaskAlarmAt || undefined,
      });
      resetForm();
      setIsAddOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
    return aDue - bDue;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="relative mb-7 overflow-hidden rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground shadow-[0_18px_45px_-25px_hsl(var(--primary)/0.55)] sm:px-9 sm:py-9">
        <div className="absolute -right-7 -top-10 h-52 w-52 rounded-full border border-primary-foreground/10" />
        <div className="absolute -right-1 top-7 h-32 w-32 rounded-full border border-primary-foreground/10" />
        <div className="absolute bottom-0 right-12 h-20 w-20 rounded-t-full bg-accent/90 opacity-90" />
        <div className="relative z-10 max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
            <Compass size={13} /> Your daily quest log
          </div>
          <h1 className="mb-2 text-3xl leading-tight sm:text-4xl">Make today count.</h1>
          <p className="max-w-md text-sm text-primary-foreground/75 sm:text-base">A clear path, one good quest at a time. Pick your first move and get going.</p>
        </div>
        <Compass className="absolute bottom-5 right-6 hidden text-primary-foreground/20 sm:block" size={76} strokeWidth={1} />
      </header>

      <aside className="mb-7 flex items-start gap-3 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-4 sm:px-5" aria-label="Daily discipline quote">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
          <Sparkles size={17} aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent-foreground">A thought for today</p>
          <blockquote className="mt-1 text-sm font-medium leading-relaxed text-foreground sm:text-base">
            “{disciplineQuotes[quoteIndex]}”
          </blockquote>
        </div>
      </aside>

      <StatsHeader />

      <section aria-label="Daily progress" className="mb-8 mt-7 rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Today's route</p>
            <p className="mt-1 text-lg font-bold">{completedCount === totalCount && totalCount > 0 ? "Trail cleared" : "Steady progress"}</p>
          </div>
          <span className="font-mono text-sm font-medium text-primary">{completedCount}<span className="text-muted-foreground"> / {totalCount} quests</span></span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalCount || 1}
          aria-valuenow={completedCount}
          aria-label="Quests completed"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{totalCount === 0 ? "Add a quest to map your day." : `${Math.round(progress)}% of your quests complete`}</p>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText size={18} className="text-primary" />
            <h2 className="text-xl font-bold">Today's quests</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Your next steps, in order.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl px-4 shadow-sm">
              <Plus size={16} /> Add quest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-border/80 bg-background sm:max-w-[480px]">
            <DialogHeader className="pr-7">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles size={19} /></div>
              <DialogTitle className="text-2xl">Add to your quest log</DialogTitle>
              <p className="text-sm text-muted-foreground">Give your next step a name, then choose when it matters.</p>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="quest-title">Quest title</Label>
                <Input 
                  id="quest-title"
                  required
                  maxLength={100}
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Send the project proposal"
                  autoFocus
                  className="h-11 rounded-xl bg-card"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quest-category">Category</Label>
                  <Select value={newTaskCategory} onValueChange={(value) => setNewTaskCategory(value as typeof newTaskCategory)}>
                    <SelectTrigger id="quest-category" className="h-11 rounded-xl bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quest-priority">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as typeof newTaskPriority)}>
                    <SelectTrigger id="quest-priority" className="h-11 rounded-xl bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="grid gap-2">
                  <Label htmlFor="quest-deadline" className="flex items-center gap-2"><CalendarClock size={15} className="text-primary" /> Deadline <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="quest-deadline"
                    type="datetime-local"
                    value={newTaskDueAt}
                    onChange={(e) => setNewTaskDueAt(e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quest-alarm" className="flex items-center gap-2"><BellRing size={15} className="text-accent-foreground" /> Alarm <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="quest-alarm"
                    type="datetime-local"
                    value={newTaskAlarmAt}
                    onChange={(e) => setNewTaskAlarmAt(e.target.value)}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">Saving an alarm asks your browser for notification permission. Alarms only fire while TaskQuest is open.</p>
              </div>
              <Button type="submit" disabled={isSaving || !newTaskTitle.trim()} className="mt-1 h-11 w-full rounded-xl">
                {isSaving ? "Saving quest…" : <><Check size={16} /> Create quest</>}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 pb-24">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {sortedTasks.length === 0 && (
          <div className="quest-grid rounded-2xl border border-dashed border-primary/25 bg-card/60 px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Compass size={24} /></div>
            <p className="font-bold">Your map is clear.</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a quest to give the day its first direction.</p>
          </div>
        )}
      </div>

      <Dialog open={isGratitudeOpen} onOpenChange={setIsGratitudeOpen}>
        <DialogContent className="max-w-md rounded-2xl border-primary/20 bg-background p-7 sm:p-8">
          <DialogHeader className="pr-5">
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
              <Check size={21} aria-hidden="true" />
            </div>
            <DialogTitle className="text-2xl">You showed up.</DialogTitle>
            <p className="pt-2 text-base leading-relaxed text-muted-foreground">
              Yes you are disciplined. Just show up every single day and yes you will do it.
            </p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
