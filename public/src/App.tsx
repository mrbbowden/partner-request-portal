import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/partner-portal';
import AdminPage from './pages/admin';

// Define interfaces
interface Partner {
  id: string;
  partnerName: string;
  referringCaseManager: string;
  caseManagerEmail: string;
  caseManagerPhone: string;
}

interface Request {
  partnerId: string;
  partnerName: string;
  referringCaseManager: string;
  caseManagerEmail: string;
  caseManagerPhone: string;
  preferredContact: string;
  requestType: string;
  urgency: string;
  description: string;
  // New recipient fields
  recipientsName: string;
  recipientsAddress: string;
  recipientsEmail: string;
  recipientsPhone: string;
  descriptionOfNeed: string;
}

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/admin" component={AdminPage} />
        </Switch>
      </div>
    </QueryClientProvider>
  );
}

export default App;
