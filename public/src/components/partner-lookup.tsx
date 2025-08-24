import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Partner } from "@shared/schema";

interface PartnerLookupProps {
  onPartnerFound: (partner: Partner) => void;
  onPartnerNotFound: () => void;
}

export interface PartnerLookupRef {
  clearPartnerId: () => void;
}

const PartnerLookup = forwardRef<PartnerLookupRef, PartnerLookupProps>(
  ({ onPartnerFound, onPartnerNotFound }, ref) => {
  const [partnerId, setPartnerId] = useState("");
  const [shouldLookup, setShouldLookup] = useState(false);

  // Query for partner lookup
  const { data: partner, isLoading, error, refetch } = useQuery({
    queryKey: ["partner", partnerId],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${partnerId}`);
      if (!response.ok) {
        throw new Error("Partner not found");
      }
      return response.json();
    },
    enabled: shouldLookup && partnerId.length === 4,
    retry: false,
  });

  // Handle partner found/not found
  useEffect(() => {
    if (shouldLookup) {
      if (partner) {
        onPartnerFound(partner);
      } else if (error) {
        onPartnerNotFound();
      }
      setShouldLookup(false);
    }
  }, [partner, error, shouldLookup, onPartnerFound, onPartnerNotFound]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && partnerId.length === 4) {
      handleGoClick();
    }
  };

  // Handle Go button click
  const handleGoClick = () => {
    if (partnerId.length === 4) {
      setShouldLookup(true);
      refetch();
    }
  };

  // Expose clear method
  useImperativeHandle(ref, () => ({
    clearPartnerId: () => {
      setPartnerId("");
      setShouldLookup(false);
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
      </div>
    </div>
  );
});

PartnerLookup.displayName = "PartnerLookup";

export default PartnerLookup;