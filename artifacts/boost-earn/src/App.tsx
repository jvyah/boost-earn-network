import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";

// Setup global fetch interceptor early
import "@/lib/fetch-interceptor";

// Pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Home from "@/pages/home";
import Tasks from "@/pages/tasks";
import Submit from "@/pages/submit";
import Team from "@/pages/team";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";
import AdminLayout from "@/pages/admin/admin-layout";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route path="/:rest*">
        <AppLayout>
          <Switch>
            <Route path="/home" component={Home} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/submit" component={Submit} />
            <Route path="/team" component={Team} />
            <Route path="/profile" component={Profile} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/admin" component={AdminLayout} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ProtectedRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
