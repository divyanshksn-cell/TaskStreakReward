import React from "react";
import { useGame } from "@/context/GameContext";
import streakIcon from "@assets/generated_images/3d_flame_streak_icon.png";
import trophyIcon from "@assets/generated_images/3d_gold_trophy_icon.png";

export function StatsHeader() {
  const { streak, points } = useGame();

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* Streak Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-4 flex items-center gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
          <img 
            src={streakIcon} 
            alt="Streak" 
            className="w-full h-full object-contain relative z-10 drop-shadow-lg"
          />
        </div>
        <div>
          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Current Streak</p>
          <h2 className="text-3xl font-display font-bold text-foreground">{streak} <span className="text-sm font-sans font-normal text-muted-foreground">days</span></h2>
        </div>
      </div>

      {/* Points Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 p-4 flex items-center gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
          <img 
            src={trophyIcon} 
            alt="Points" 
            className="w-full h-full object-contain relative z-10 drop-shadow-lg"
          />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total XP</p>
          <h2 className="text-3xl font-display font-bold text-foreground">{points} <span className="text-sm font-sans font-normal text-muted-foreground">XP</span></h2>
        </div>
      </div>
    </div>
  );
}
