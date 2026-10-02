import React from "react";
import { Link, useLocation } from "wouter";
import { Compass, Gift, LayoutDashboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Quests" },
    { href: "/rewards", icon: Gift, label: "Rewards" },
  ];

  const openAddQuest = () => {
    if (location === "/") {
      window.dispatchEvent(new CustomEvent("taskquest:open-add"));
      return;
    }
    setLocation("/");
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("taskquest:open-add")), 350);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden pb-24 text-foreground md:pb-0 md:pl-[5.5rem]">
      <nav aria-label="Primary navigation" className="fixed left-0 top-0 z-50 hidden h-full w-[5.5rem] flex-col items-center border-r border-border/70 bg-background/90 py-6 backdrop-blur-xl md:flex">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Compass size={24} strokeWidth={2.1} />
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary">TaskQuest</span>
        </div>
        <div className="flex w-full flex-col gap-3 px-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group flex flex-col items-center gap-1 rounded-2xl p-3 transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={openAddQuest} aria-label="Add a quest" className="mt-2 flex flex-col items-center gap-1 rounded-2xl border border-dashed border-primary/35 p-3 text-primary transition-colors hover:bg-primary/5">
            <Plus size={22} />
            <span className="text-[10px] font-bold">Add</span>
          </button>
        </div>
      </nav>

      <nav aria-label="Primary navigation" className="fixed bottom-0 left-0 z-50 flex h-[4.5rem] w-full items-center justify-around border-t border-border/80 bg-background/95 px-5 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-xl p-1.5 transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <Button
            type="button"
            onClick={openAddQuest}
            aria-label="Add a quest"
            size="icon"
            className="h-12 w-12 rounded-2xl border-[3px] border-background bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            <Plus size={23} />
          </Button>
        </div>
      </nav>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}