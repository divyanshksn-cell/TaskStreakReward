import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { TaskCard } from "@/components/task-card";
import { StatsHeader } from "@/components/stats-header";
import { Plus } from "lucide-react";
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

export default function Dashboard() {
  const { tasks, addTask } = useGame();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("personal");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskTime, setNewTaskTime] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      category: newTaskCategory as any,
      priority: newTaskPriority as any,
      dueTime: newTaskTime || undefined,
    });
    
    // Reset
    setNewTaskTitle("");
    setNewTaskTime("");
    setIsAddOpen(false);
  };

  // Sort tasks: Incomplete first, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-4xl mb-2">Hello, Player 1 👋</h1>
        <p className="text-muted-foreground">Ready to conquer your day?</p>
      </header>

      <StatsHeader />

      {/* Daily Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Daily Progress</span>
          <span className="text-muted-foreground">{completedCount}/{totalCount} Quests</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Today's Quests</h2>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="hidden md:flex gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/5">
              <Plus size={16} /> Add Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Quest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Quest Title</Label>
                <Input 
                  id="title" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Slay the dragon (Do laundry)" 
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                    <SelectTrigger>
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
                  <Label>Priority</Label>
                  <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                    <SelectTrigger>
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
              <div className="grid gap-2">
                <Label htmlFor="time">Due Time (Optional)</Label>
                <Input 
                  id="time" 
                  type="time"
                  value={newTaskTime} 
                  onChange={(e) => setNewTaskTime(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full mt-4">Create Quest</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task List */}
      <div className="space-y-3 pb-20">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {sortedTasks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted">
            <p className="text-muted-foreground">No quests active. Enjoy the peace!</p>
          </div>
        )}
      </div>
    </div>
  );
}
