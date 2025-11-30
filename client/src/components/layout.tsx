import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Gift, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Tasks" },
    { href: "/rewards", icon: Gift, label: "Rewards" },
    { href: "/stats", icon: Trophy, label: "Stats" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:pl-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-24 flex-col items-center py-8 border-r border-border bg-card/50 backdrop-blur-xl z-50">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            Q
          </div>
        </div>
        
        <div className="flex flex-col gap-6 w-full px-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-card/80 backdrop-blur-xl border-t border-border z-50 flex items-center justify-around px-4 pb-2">
         {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-full transition-all ${isActive ? "bg-primary/10" : ""}`}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
          
          {/* Floating Action Button for Mobile */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-purple-400 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all border-4 border-background"
            >
              <Plus className="text-white" size={28} />
            </Button>
          </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
