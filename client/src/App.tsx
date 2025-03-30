import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";

// Use ProtectedRoute for authenticated routes
function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/auth">
          <AuthPage />
        </Route>
        <ProtectedRoute 
          path="/" 
          component={Dashboard} 
        />
        <ProtectedRoute 
          path="/transactions" 
          component={Transactions} 
        />
        <ProtectedRoute 
          path="/reports" 
          component={Reports} 
        />
        <ProtectedRoute 
          path="/settings" 
          component={Settings} 
        />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
