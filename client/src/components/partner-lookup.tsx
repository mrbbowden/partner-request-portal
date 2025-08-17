import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Partner } from "@shared/schema";

interface PartnerLookupProps {
  onPartnerFound: (partner: Partner) => void;
  onPartnerNotFound: () => void;
}

export default function PartnerLookup({ onPartnerFound, onPartnerNotFound }: PartnerLookupProps) {
  const [partnerId, setPartnerId] = useState("");
  const [shouldLookup, setShouldLookup] = useState(false);

  const { data: partner, isLoading, error } = useQuery({
    queryKey: ["/api/partners", partnerId],
    enabled: shouldLookup && partnerId.length === 4,
    retry: false,
  });

  const handleInputChange = (value: string) => {
    // Only allow digits and limit to 4 characters
    const filteredValue = value.replace(/\D/g, "").slice(0, 4);
    setPartnerId(filteredValue);
    setShouldLookup(false);
    onPartnerNotFound();
  };

  const handleBlur = () => {
    if (partnerId.length === 4 && /^\d{4}$/.test(partnerId)) {
      setShouldLookup(true);
    } else if (partnerId.length > 0) {
      // Show error for invalid format
    }
  };

  // Handle successful partner lookup
  if (partner && shouldLookup) {
    onPartnerFound(partner);
    setShouldLookup(false);
  }

  // Handle failed partner lookup
  if (error && shouldLookup) {
    onPartnerNotFound();
    setShouldLookup(false);
  }

  const showError = error && partnerId.length === 4;
  const showFormatError = partnerId.length > 0 && partnerId.length < 4;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Partner Lookup</h2>
        <p className="text-sm text-gray-600">Enter your 4-digit Partner ID to begin your request</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="partnerId" className="block text-sm font-medium text-gray-700 mb-2">
            Partner ID <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="partnerId"
              type="text"
              maxLength={4}
              placeholder="0000"
              value={partnerId}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full sm:w-64 text-center text-lg font-mono tracking-wider"
              data-testid="input-partner-id"
            />
            {isLoading && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            ID will be validated when you move to the next field
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
}
