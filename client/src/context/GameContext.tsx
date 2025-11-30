import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

export type Task = {
  id: string;
  title: string;
  category: "work" | "personal" | "health" | "learning";
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueTime?: string;
};

export type Reward = {
  id: string;
  title: string;
  cost: number;
  unlocked: boolean;
  icon: string;
};

type GameState = {
  tasks: Task[];
  streak: number;
  points: number;
  rewards: Reward[];
  addTask: (task: Omit<Task, "id" | "completed">) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  unlockReward: (id: string) => void;
};

const GameContext = createContext<GameState | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};

// Mock Initial Data
const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Morning Jog (30 mins)", category: "health", priority: "high", completed: false, dueTime: "07:00" },
  { id: "2", title: "Complete Project Proposal", category: "work", priority: "high", completed: false, dueTime: "14:00" },
  { id: "3", title: "Read 20 pages", category: "learning", priority: "medium", completed: false, dueTime: "20:00" },
  { id: "4", title: "Drink 2L Water", category: "health", priority: "medium", completed: true, dueTime: "22:00" },
];

const INITIAL_REWARDS: Reward[] = [
  { id: "1", title: "Coffee Break", cost: 50, unlocked: true, icon: "☕" },
  { id: "2", title: "Cheat Day", cost: 500, unlocked: false, icon: "🍔" },
  { id: "3", title: "New Game", cost: 2000, unlocked: false, icon: "🎮" },
  { id: "4", title: "Weekend Trip", cost: 5000, unlocked: false, icon: "✈️" },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [streak, setStreak] = useState(12);
  const [points, setPoints] = useState(340);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const { toast } = useToast();

  const addTask = (task: Omit<Task, "id" | "completed">) => {
    const newTask: Task = { ...task, id: Math.random().toString(36).substr(2, 9), completed: false };
    setTasks([...tasks, newTask]);
    toast({ title: "Quest Added", description: "New challenge accepted!" });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = !t.completed;
          if (isCompleting) {
            // Reward Logic
            setPoints((p) => p + 50);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#FFD700", "#FFA500", "#FF4500"],
            });
            toast({ title: "Quest Complete!", description: "+50 XP gained!" });
          } else {
             setPoints((p) => Math.max(0, p - 50));
          }
          return { ...t, completed: isCompleting };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const unlockReward = (id: string) => {
    const reward = rewards.find((r) => r.id === id);
    if (!reward) return;

    if (points >= reward.cost) {
      setPoints((p) => p - reward.cost);
      setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, unlocked: true } : r)));
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });
      toast({ title: "Reward Unlocked!", description: `You earned: ${reward.title}` });
    } else {
      toast({ variant: "destructive", title: "Insufficient XP", description: "Keep grinding tasks to earn more points!" });
    }
  };

  return (
    <GameContext.Provider value={{ tasks, streak, points, rewards, addTask, toggleTask, deleteTask, unlockReward }}>
      {children}
    </GameContext.Provider>
  );
};
