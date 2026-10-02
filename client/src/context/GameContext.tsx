import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

export type Task = {
  id: string;
  title: string;
  category: "work" | "personal" | "health" | "learning";
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueTime?: string;
  dueAt?: string;
  alarmAt?: string;
};

export type Reward = {
  id: string;
  title: string;
  cost: number;
  unlocked: boolean;
  icon: string;
  taskIds?: string[];
  taskTitles?: string[];
};

type GameState = {
  tasks: Task[];
  streak: number;
  points: number;
  rewards: Reward[];
  addCustomReward: (title: string, taskIds: string[]) => void;
  addTask: (task: Omit<Task, "id" | "completed">) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "completed">>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  requestAlarmPermission: () => Promise<boolean>;
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

const TASKS_STORAGE_KEY = "taskquest:tasks";
const FIRED_ALARMS_STORAGE_KEY = "taskquest:fired-alarms";
const REWARDS_STORAGE_KEY = "taskquest:rewards";

function loadStoredTasks(): Task[] {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!stored) return INITIAL_TASKS;
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed as Task[];
    console.warn("Saved TaskQuest tasks were invalid; starting with the sample quests.");
  } catch (error) {
    console.warn("Could not load saved TaskQuest tasks.", error);
  }
  return INITIAL_TASKS;
}

function loadFiredAlarms(): string[] {
  try {
    const stored = localStorage.getItem(FIRED_ALARMS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.every((entry) => typeof entry === "string")
      ? parsed
      : [];
  } catch (error) {
    console.warn("Could not load TaskQuest alarm history.", error);
    return [];
  }
}

function loadStoredRewards(): Reward[] {
  try {
    const stored = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (!stored) return INITIAL_REWARDS;
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed as Reward[];
    console.warn("Saved TaskQuest rewards were invalid; starting with the default rewards.");
  } catch (error) {
    console.warn("Could not load saved TaskQuest rewards.", error);
  }
  return INITIAL_REWARDS;
}

function alarmKey(task: Task) {
  return `${task.id}:${task.alarmAt}`;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(loadStoredTasks);
  const [streak, setStreak] = useState(12);
  const [points, setPoints] = useState(340);
  const [rewards, setRewards] = useState<Reward[]>(loadStoredRewards);
  const [firedAlarms, setFiredAlarms] = useState<string[]>(loadFiredAlarms);
  const tasksRef = useRef(tasks);
  const firedAlarmsRef = useRef(firedAlarms);
  const handledCustomUnlocks = useRef(new Set(
    rewards.filter((reward) => reward.taskIds && reward.unlocked).map((reward) => reward.id),
  ));
  const { toast } = useToast();

  useEffect(() => {
    tasksRef.current = tasks;
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.warn("Could not save TaskQuest tasks in this browser.", error);
    }
  }, [tasks]);

  useEffect(() => {
    firedAlarmsRef.current = firedAlarms;
    try {
      localStorage.setItem(FIRED_ALARMS_STORAGE_KEY, JSON.stringify(firedAlarms));
    } catch (error) {
      console.warn("Could not save TaskQuest alarm history.", error);
    }
  }, [firedAlarms]);

  useEffect(() => {
    try {
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
    } catch (error) {
      console.warn("Could not save TaskQuest rewards in this browser.", error);
    }
  }, [rewards]);

  useEffect(() => {
    const newlyUnlocked = rewards.filter((reward) => {
      if (!reward.taskIds?.length || reward.unlocked || handledCustomUnlocks.current.has(reward.id)) return false;
      return reward.taskIds.every((taskId) => tasks.some((task) => task.id === taskId && task.completed));
    });
    if (newlyUnlocked.length === 0) return;

    newlyUnlocked.forEach((reward) => handledCustomUnlocks.current.add(reward.id));
    const unlockedIds = new Set(newlyUnlocked.map((reward) => reward.id));
    setRewards((previous) => previous.map((reward) => unlockedIds.has(reward.id) ? { ...reward, unlocked: true } : reward));
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#F5B942", "#3C9F83", "#D97950"],
    });
    newlyUnlocked.forEach((reward) => {
      toast({ title: "Personal reward unlocked!", description: `You earned: ${reward.title}` });
    });
  }, [tasks, rewards, toast]);

  useEffect(() => {
    const checkAlarms = () => {
      const now = Date.now();
      const dueTasks = tasksRef.current.filter((task) => {
        if (!task.alarmAt) return false;
        const alarmTime = new Date(task.alarmAt).getTime();
        return Number.isFinite(alarmTime) && alarmTime <= now && !firedAlarmsRef.current.includes(alarmKey(task));
      });

      if (dueTasks.length === 0) return;

      const newKeys = dueTasks.map(alarmKey);
      firedAlarmsRef.current = [...firedAlarmsRef.current, ...newKeys];
      setFiredAlarms(firedAlarmsRef.current);

      const activeTasks = dueTasks.filter((task) => !task.completed);
      if (activeTasks.length === 0) return;

      activeTasks.forEach((task) => {
        toast({
          title: "Quest alarm",
          description: `It's time for ${task.title}.`,
        });
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("TaskQuest alarm", {
            body: `It's time for ${task.title}.`,
            tag: alarmKey(task),
          });
        }
      });

      try {
        const AudioContextConstructor = window.AudioContext;
        if (AudioContextConstructor) {
          const audio = new AudioContextConstructor();
          const oscillator = audio.createOscillator();
          const volume = audio.createGain();
          oscillator.frequency.value = 880;
          volume.gain.setValueAtTime(0.08, audio.currentTime);
          volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.45);
          oscillator.connect(volume);
          volume.connect(audio.destination);
          oscillator.start();
          oscillator.stop(audio.currentTime + 0.45);
          oscillator.onended = () => void audio.close();
        }
      } catch (error) {
        console.warn("The browser could not play the TaskQuest alarm sound.", error);
      }
    };

    checkAlarms();
    const interval = window.setInterval(checkAlarms, 15_000);
    return () => window.clearInterval(interval);
  }, [toast]);

  const requestAlarmPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast({
        title: "Browser notifications unavailable",
        description: "Task alarms will still alert you while TaskQuest is open.",
      });
      return false;
    }

    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") {
      toast({
        title: "Notifications are blocked",
        description: "Task alarms will still alert you while TaskQuest is open.",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Notifications not enabled",
          description: "Task alarms will still alert you while TaskQuest is open.",
        });
      }
      return permission === "granted";
    } catch (error) {
      console.warn("Could not request browser notification permission.", error);
      return false;
    }
  };

  const addTask = (task: Omit<Task, "id" | "completed">) => {
    const newTask: Task = { ...task, id: Math.random().toString(36).substr(2, 9), completed: false };
    setTasks((prev) => [...prev, newTask]);
    toast({ title: "Quest Added", description: "New challenge accepted!" });
  };

  const addCustomReward = (title: string, taskIds: string[]) => {
    const cleanTitle = title.trim();
    const uniqueTaskIds = Array.from(new Set(taskIds));
    const selectedTasks = uniqueTaskIds
      .map((taskId) => tasks.find((task) => task.id === taskId))
      .filter((task): task is Task => Boolean(task));

    if (!cleanTitle || selectedTasks.length === 0 || selectedTasks.length !== uniqueTaskIds.length) {
      toast({
        variant: "destructive",
        title: "Choose a reward and its quests",
        description: "Add a reward name and select at least one current quest.",
      });
      return;
    }

    const reward: Reward = {
      id: `custom-${Math.random().toString(36).slice(2, 11)}`,
      title: cleanTitle,
      cost: 0,
      unlocked: false,
      icon: "✦",
      taskIds: uniqueTaskIds,
      taskTitles: selectedTasks.map((task) => task.title),
    };
    setRewards((previous) => [...previous, reward]);
    toast({
      title: "Personal reward added",
      description: `Complete ${selectedTasks.length} selected ${selectedTasks.length === 1 ? "quest" : "quests"} to earn it.`,
    });
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, "id" | "completed">>) => {
    setTasks((prev) => prev.map((task) => task.id === id ? { ...task, ...updates } : task));
    toast({ title: "Quest Updated", description: "Your changes have been saved." });
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
    <GameContext.Provider value={{
      tasks,
      streak,
      points,
      rewards,
      addCustomReward,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      requestAlarmPermission,
      unlockReward,
    }}>
      {children}
    </GameContext.Provider>
  );
};
