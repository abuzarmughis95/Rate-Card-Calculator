/**
 * Main Application Component
 * 
 * Root component that sets up the application with:
 * - React Query for data fetching and caching
 * - Theme provider for dark/light mode
 * - Currency provider for exchange rates
 * - Toast notifications
 * - Tooltip provider
 * - Routing configuration
 * 
 * Features:
 * - Global state management
 * - Error boundaries and fallbacks
 * - Responsive design
 * - Performance optimizations
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/hooks/use-currency";
import { ThemeProvider } from "@/contexts/theme-context";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
