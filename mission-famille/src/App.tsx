import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ProfileSelector from "@/pages/ProfileSelector";
import Dashboard from "@/pages/Dashboard";
import Missions from "@/pages/Missions";
import Classement from "@/pages/Classement";
import Rewards from "@/pages/Rewards";
import ParentDashboard from "@/pages/ParentDashboard";
import XpHistory from "@/pages/XpHistory";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProfileSelector} />
      <Route path="/dashboard/:id" component={Dashboard} />
      <Route path="/missions/:id" component={Missions} />
      <Route path="/recompenses/:id" component={Rewards} />
      <Route path="/classement/:id" component={Classement} />
      <Route path="/classement" component={Classement} />
      <Route path="/parent/:id" component={ParentDashboard} />
      <Route path="/historique/:id" component={XpHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
