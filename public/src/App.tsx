import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/partner-portal';
import AdminPage from './pages/admin';
import ThemeToggle from './components/theme-toggle';
import { Toaster } from './components/ui/toaster';

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/admin" component={AdminPage} />
        </Switch>
      </div>
      <Toaster />
      <ThemeToggle />
    </QueryClientProvider>
  );
}
