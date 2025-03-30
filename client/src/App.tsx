import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";

// Use ProtectedRoute for authenticated routes
function App() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute 
        path="/" 
        component={Dashboard} 
      />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default App;
