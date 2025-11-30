import { Switch, Route } from "wouter";
import { GameProvider } from "@/context/GameContext";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Rewards from "@/pages/rewards";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/stats" component={() => <div className="p-8 text-center"><h1 className="text-2xl mb-4">Stats Coming Soon</h1><p className="text-muted-foreground">Track your productivity velocity here.</p></div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <GameProvider>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </GameProvider>
  );
}

export default App;
