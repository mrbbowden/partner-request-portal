import { useState, useRef } from "react";
import { Handshake, User } from "lucide-react";
import PartnerLookup, { type PartnerLookupRef } from "@/components/partner-lookup";
import PartnerInfo from "@/components/partner-info";
import RequestForm from "@/components/request-form";
import type { Partner } from "@shared/schema";

export default function PartnerPortal() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const partnerLookupRef = useRef<PartnerLookupRef>(null);

  const handlePartnerFound = (foundPartner: Partner) => {
    setPartner(foundPartner);
    setShowSuccess(false);
  };

  const handlePartnerNotFound = () => {
    setPartner(null);
  };

  const handleRequestSubmitted = () => {
    setShowSuccess(true);
    setPartner(null);
    partnerLookupRef.current?.clearPartnerId();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleClearForm = () => {
    setPartner(null);
    partnerLookupRef.current?.clearPartnerId();
  };

  return (
    <div className="bg-gray-50 font-inter min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Handshake className="text-white text-sm w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Partner Request Portal</h1>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <User className="mr-2 w-4 h-4" />
              <span>Current User</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Partner Lookup */}
        <PartnerLookup
          ref={partnerLookupRef}
          onPartnerFound={handlePartnerFound}
          onPartnerNotFound={handlePartnerNotFound}
        />

        {/* Partner Info */}
        {partner && <PartnerInfo partner={partner} />}

        {/* Request Form */}
        {partner && (
          <RequestForm
            partner={partner}
            onRequestSubmitted={handleRequestSubmitted}
            onClearForm={handleClearForm}
          />
        )}

        {/* Success Message */}
        {showSuccess && (
          <div 
            className="bg-green-50 border border-green-200 rounded-md p-4"
            data-testid="success-message"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 text-green-500 mr-3">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Request Submitted Successfully</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your request has been submitted and will be processed within the selected timeframe. 
                  You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
