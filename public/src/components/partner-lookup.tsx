import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { setPartnerIdCookie, clearPartnerIdCookie } from "../lib/cookies";

interface Partner {
  id: string;
  partnerName: string;
  referringCaseManager: string;
  caseManagerEmail: string;
  caseManagerPhone: string;
}

interface PartnerLookupProps {
  onPartnerFound: (partner: Partner) => void;
  onPartnerNotFound: () => void;
  initialPartnerId?: string;
}

export interface PartnerLookupRef {
  clearPartnerId: () => void;
}

const PartnerLookup = forwardRef<PartnerLookupRef, PartnerLookupProps>(
  ({ onPartnerFound, onPartnerNotFound, initialPartnerId }, ref) => {
  const [partnerId, setPartnerId] = useState(initialPartnerId || "");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual fetch function
  const fetchPartner = useCallback(async (id: string) => {
    console.log("=== fetchPartner called with id:", id);
    setIsLoading(true);
    setError(null);
    setPartner(null); // Clear any previous partner data
    try {
      console.log("Making API call to:", `/api/partners/${id}`);
      const response = await fetch(`/api/partners/${id}`);
      console.log("API response status:", response.status);
      if (!response.ok) {
        throw new Error("Partner not found");
      }
      const data = await response.json();
      console.log("Partner data received:", data);
      console.log("Setting partner state to:", data);
      setPartner(data);
      setError(null);
    } catch (err) {
      console.log("Partner fetch error:", err);
      setPartner(null);
      setError(err instanceof Error ? err.message : "Partner not found");
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  }, []); // Remove partner dependency to prevent infinite loops

  // Handle partner found/not found
  useEffect(() => {
    console.log("useEffect triggered at:", new Date().toISOString(), "- partner:", partner, "error:", error);
    if (partner) {
      console.log("Calling onPartnerFound with:", partner);
      // Set cookie when partner is found
      setPartnerIdCookie(partner.id);
      onPartnerFound(partner);
    } else if (error) {
      console.log("Calling onPartnerNotFound due to error:", error);
      // Clear any previous partner info when lookup fails
      onPartnerNotFound();
    }
  }, [partner, error, onPartnerFound, onPartnerNotFound]);

  // Auto-fetch partner when initialPartnerId is provided
  useEffect(() => {
    if (initialPartnerId && initialPartnerId.length === 4) {
      console.log("Auto-fetching partner with initialPartnerId:", initialPartnerId);
      fetchPartner(initialPartnerId);
    }
  }, [initialPartnerId, fetchPartner]);

  // Clear partner info when partnerId changes (user starts typing new ID)
  useEffect(() => {
    if (partnerId.length > 0 && partnerId.length < 4) {
      // Clear partner info when user is typing a new ID
      onPartnerNotFound();
    }
  }, [partnerId, onPartnerNotFound]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && partnerId.length === 4) {
      handleGoClick();
    }
  };

  // Handle Go button click
  const handleGoClick = () => {
    console.log("Go button clicked, partnerId:", partnerId);
    if (partnerId.length === 4) {
      console.log("Fetching partner data");
      fetchPartner(partnerId);
    }
  };

  // Expose clear method
  useImperativeHandle(ref, () => ({
    clearPartnerId: () => {
      setPartnerId("");
      setPartner(null);
      setError(null);
      // Clear partner info when clearing the input
      onPartnerNotFound();
      // Clear the cookie when clearing the partner ID
      clearPartnerIdCookie();
    },
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner Lookup</h3>
        <p className="text-sm text-gray-600">
          Enter your 4-digit Partner ID to access the request portal.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="partnerId">Partner ID</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="partnerId"
              type="text"
              placeholder="0000"
              maxLength={4}
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value.replace(/\D/g, ""))}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleGoClick}
              disabled={partnerId.length !== 4 || isLoading}
              className="min-w-[80px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Go"
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Partner ID not found. Please check your ID and try again.</span>
          </div>
        )}

        {initialPartnerId && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Partner ID {initialPartnerId} loaded from previous session</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearPartnerIdCookie();
                window.location.reload();
              }}
              className="text-xs"
            >
              Clear Saved ID
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

PartnerLookup.displayName = "PartnerLookup";

export default PartnerLookup;