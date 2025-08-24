import React, { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AdminPage from "./pages/admin";

// Define partner type
interface Partner {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

// Define request type to match API schema
interface Request {
  partnerId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
  requestType: string;
  urgency: string;
  description: string;
}



// Cookie utility functions
const PARTNER_ID_COOKIE = 'partner_id';
const COOKIE_EXPIRY_HOURS = 24;

const setPartnerIdCookie = (partnerId: string): void => {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_HOURS * 60 * 60 * 1000));
  
  const cookieValue = `${PARTNER_ID_COOKIE}=${partnerId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  document.cookie = cookieValue;
  
  console.log(`Cookie set: ${PARTNER_ID_COOKIE}=${partnerId}, expires: ${expiryDate.toUTCString()}`);
};

const getPartnerIdCookie = (): string | null => {
  console.log(`Getting cookie. All cookies: ${document.cookie}`);
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === PARTNER_ID_COOKIE && value) {
      console.log(`Cookie found: ${PARTNER_ID_COOKIE}=${value}`);
      return value;
    }
  }
  
  console.log(`No cookie found for: ${PARTNER_ID_COOKIE}`);
  return null;
};

const clearPartnerIdCookie = (): void => {
  const cookieValue = `${PARTNER_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = cookieValue;
  console.log(`Cookie cleared: ${PARTNER_ID_COOKIE}`);
};

// Request Form Component
function RequestForm({ partner, onRequestSubmitted, onClearForm }: { 
  partner: Partner; 
  onRequestSubmitted: () => void;
  onClearForm: () => void;
}) {
  const [requestType, setRequestType] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("");
  const [preferredContact, setPreferredContact] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestType || !description || !urgency || !preferredContact) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const request: Request = {
        partnerId: partner.id,
        fullName: partner.fullName,
        email: partner.email,
        phone: partner.phone,
        preferredContact,
        requestType,
        urgency,
        description
      };

      console.log("Submitting request:", request);

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit request');
      }

      const result = await response.json();
      console.log("Request submitted successfully:", result);

      // Clear form and notify parent
      setRequestType("");
      setDescription("");
      setUrgency("");
      setPreferredContact("");
      onRequestSubmitted();
      
    } catch (error) {
      console.error("Error submitting request:", error);
      alert('Error submitting request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div style={{ 
      marginTop: '20px',
      padding: '20px',
      border: '2px solid purple',
      backgroundColor: 'lavender'
    }}>
      <h3 style={{ color: 'black' }}>Submit Request</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: 'black', marginBottom: '5px' }}>
            Request Type:
          </label>
          <select 
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px' 
            }}
            required
          >
            <option value="">Select request type</option>
            <option value="support">Technical Support</option>
            <option value="billing">Billing Question</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: 'black', marginBottom: '5px' }}>
            Description:
          </label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              minHeight: '100px'
            }}
            placeholder="Please describe your request..."
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: 'black', marginBottom: '5px' }}>
            Urgency:
          </label>
          <select 
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px' 
            }}
            required
          >
            <option value="">Select urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: 'black', marginBottom: '5px' }}>
            Preferred Contact Method:
          </label>
          <select 
            value={preferredContact}
            onChange={(e) => setPreferredContact(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px' 
            }}
            required
          >
            <option value="">Select contact method</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit"
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'green', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Submit Request
          </button>
          
          <button 
            type="button"
            onClick={onClearForm}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'red', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}

// Admin Panel Component - Now imported from ./pages/admin

// Simple page components
function HomePage() {
  const [partnerId, setPartnerId] = useState("");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPartnerId, setSavedPartnerId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load saved partner ID on component mount
  useEffect(() => {
    console.log("HomePage: Checking for saved partner ID cookie...");
    const savedId = getPartnerIdCookie();
    if (savedId) {
      console.log("HomePage: Found saved partner ID:", savedId);
      setSavedPartnerId(savedId);
      setPartnerId(savedId);
      // Auto-fetch partner data
      handleLookup(savedId);
    }
  }, []);

  const handleLookup = async (id?: string) => {
    const lookupId = id || partnerId;
    if (lookupId.length !== 4) return;
    
    setIsLoading(true);
    setError(null);
    setPartner(null);
    setShowSuccess(false);
    
    try {
      const response = await fetch(`/api/partners/${lookupId}`);
      if (!response.ok) {
        throw new Error("Partner not found");
      }
      const data = await response.json();
      setPartner(data);
      // Set cookie when partner is found
      setPartnerIdCookie(lookupId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Clear cookie when lookup fails
      clearPartnerIdCookie();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && partnerId.length === 4) {
      handleLookup();
    }
  };

  const clearSavedId = () => {
    clearPartnerIdCookie();
    setSavedPartnerId(null);
    setPartnerId("");
    setPartner(null);
    setError(null);
    setShowSuccess(false);
  };

  const handleRequestSubmitted = () => {
    setShowSuccess(true);
    setPartner(null);
    clearSavedId();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleClearForm = () => {
    setPartner(null);
    clearSavedId();
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'black', fontSize: '24px' }}>Partner Request Portal</h1>
      <p style={{ color: 'black', fontSize: '16px' }}>Welcome to the Partner Request Portal!</p>
      
      {savedPartnerId && (
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          border: '2px solid blue',
          backgroundColor: 'lightblue',
          color: 'black'
        }}>
          <p>Partner ID {savedPartnerId} loaded from previous session</p>
          <button 
            onClick={clearSavedId}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: 'red', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Saved ID
          </button>
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '2px solid red',
        backgroundColor: 'yellow'
      }}>
        <h2 style={{ color: 'black' }}>Partner Lookup Form</h2>
        <p style={{ color: 'black' }}>Enter your 4-digit Partner ID:</p>
        <input 
          type="text" 
          placeholder="0000" 
          maxLength={4}
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value.replace(/\D/g, ""))}
          onKeyPress={handleKeyPress}
          style={{ 
            padding: '10px', 
            fontSize: '16px', 
            border: '2px solid blue', 
            borderRadius: '4px',
            marginRight: '10px',
            backgroundColor: 'white',
            color: 'black'
          }}
        />
        <button 
          onClick={() => handleLookup()}
          disabled={partnerId.length !== 4 || isLoading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: partnerId.length === 4 ? 'green' : 'gray', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: partnerId.length === 4 ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          {isLoading ? "Loading..." : "Go Button"}
        </button>
      </div>

      {error && (
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          border: '2px solid red',
          backgroundColor: 'lightcoral',
          color: 'black'
        }}>
          <p>Error: {error}</p>
        </div>
      )}

      {partner && (
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          border: '2px solid green',
          backgroundColor: 'lightgreen'
        }}>
          <h3 style={{ color: 'black' }}>Partner Found!</h3>
          <p style={{ color: 'black' }}><strong>Name:</strong> {partner.fullName}</p>
          <p style={{ color: 'black' }}><strong>Email:</strong> {partner.email}</p>
          <p style={{ color: 'black' }}><strong>Phone:</strong> {partner.phone}</p>
        </div>
      )}

      {partner && (
        <RequestForm 
          partner={partner}
          onRequestSubmitted={handleRequestSubmitted}
          onClearForm={handleClearForm}
        />
      )}

      {showSuccess && (
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          border: '2px solid green',
          backgroundColor: 'lightgreen',
          color: 'black'
        }}>
          <h3>Request Submitted Successfully!</h3>
          <p>Your request has been submitted and will be processed within the selected timeframe. 
          You will receive a confirmation email shortly.</p>
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px',
        padding: '10px',
        border: '2px solid green',
        backgroundColor: 'lightblue'
      }}>
        <a 
          href="/admin" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'purple', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Admin Panel Link
        </a>
      </div>
    </div>
  );
}

function App() {
  console.log("App component is rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/admin" component={AdminPage} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;
