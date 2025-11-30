import React from "react";
import { useGame } from "@/context/GameContext";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import chestIcon from "@assets/generated_images/3d_treasure_chest_icon.png";

export default function Rewards() {
  const { points, rewards, unlockReward } = useGame();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <img src={chestIcon} alt="Rewards" className="w-full h-full object-contain drop-shadow-xl" />
        </div>
        <h1 className="text-4xl mb-2">Rewards Shop</h1>
        <p className="text-muted-foreground">Spend your hard-earned XP on real-life treats.</p>
      </header>

      <div className="glass-card p-6 rounded-2xl mb-8 flex items-center justify-between sticky top-4 z-30 shadow-lg border-primary/20">
        <div>
          <p className="text-xs uppercase font-bold text-muted-foreground">Available Balance</p>
          <h2 className="text-3xl font-bold font-display text-primary">{points} <span className="text-sm font-sans text-foreground">XP</span></h2>
        </div>
        <Button variant="outline" disabled className="opacity-50">History</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {rewards.map((reward) => (
          <div 
            key={reward.id}
            className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
              reward.unlocked 
                ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30" 
                : "bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-background border shadow-sm flex items-center justify-center text-2xl">
                {reward.icon}
              </div>
              {reward.unlocked ? (
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                  <Unlock size={12} /> OWNED
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center gap-1">
                  <Lock size={12} /> LOCKED
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-bold mb-1">{reward.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {reward.unlocked ? "Reward redeemed! Enjoy." : "Unlock this reward to treat yourself."}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
               <span className={`font-bold font-display ${reward.unlocked ? "text-muted-foreground line-through" : "text-accent-foreground"}`}>
                 {reward.cost} XP
               </span>
               
               <Button 
                 disabled={reward.unlocked || points < reward.cost}
                 onClick={() => unlockReward(reward.id)}
                 className={reward.unlocked ? "invisible" : ""}
                 variant={points >= reward.cost ? "default" : "secondary"}
               >
                 Redeem
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
