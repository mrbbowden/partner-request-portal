import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
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

  // Expose clearPartnerId method to parent component
  useImperativeHandle(ref, () => ({
    clearPartnerId: () => {
      setPartnerId("");
      setShouldLookup(false);
      onPartnerNotFound();
    }
  }));

  const { data: partner, isLoading, error } = useQuery({
    queryKey: ["/api/partners", partnerId],
    enabled: shouldLookup && partnerId.length === 4,
    retry: false,
  });

  // Handle query results in useEffect to avoid state updates during render
  useEffect(() => {
    if (partner && shouldLookup) {
      onPartnerFound(partner);
      setShouldLookup(false);
    }
  }, [partner, shouldLookup, onPartnerFound]);

  useEffect(() => {
    if (error && shouldLookup) {
      onPartnerNotFound();
      setShouldLookup(false);
    }
  }, [error, shouldLookup, onPartnerNotFound]);

  const handleInputChange = (value: string) => {
    // Only allow digits and limit to 4 characters
    const filteredValue = value.replace(/\D/g, "").slice(0, 4);
    setPartnerId(filteredValue);
    setShouldLookup(false);
    onPartnerNotFound();
  };

  const handleGoClick = () => {
    if (partnerId.length === 4 && /^\d{4}$/.test(partnerId)) {
      setShouldLookup(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoClick();
    }
  };

  const showError = error && partnerId.length === 4;
  const showFormatError = partnerId.length > 0 && partnerId.length < 4;
  const isGoButtonDisabled = partnerId.length !== 4 || isLoading;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Partner Lookup</h2>
        <p className="text-sm text-gray-600">Enter your 4-digit Partner ID and click Go to begin your request</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="partnerId" className="block text-sm font-medium text-gray-700 mb-2">
            Partner ID <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="partnerId"
                type="text"
                maxLength={4}
                placeholder="0000"
                value={partnerId}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full text-center text-lg font-mono tracking-wider"
                data-testid="input-partner-id"
              />
              {isLoading && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            <Button
              onClick={handleGoClick}
              disabled={isGoButtonDisabled}
              className="px-6"
              data-testid="go-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                "Go"
              )}
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter your 4-digit Partner ID and click Go to validate
          </p>
        </div>

        {/* Error Messages */}
        {(showError || showFormatError) && (
          <div 
            className="bg-red-50 border border-red-200 rounded-md p-3"
            data-testid="error-message"
          >
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                {showError 
                  ? "Partner ID not found. Please check your ID and try again."
                  : "Partner ID must be exactly 4 digits"
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PartnerLookup.displayName = "PartnerLookup";

export default PartnerLookup;