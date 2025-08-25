import React, { useState, useRef, useEffect } from "react";
import { Handshake, User, Settings, Search, AlertCircle, CheckCircle, Building2, Phone, Mail, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import RequestForm from "../components/request-form";
import { getPartnerIdCookie, setPartnerIdCookie, clearPartnerIdCookie } from "../lib/cookies";

interface Partner {
  id: string;
  partnerName: string;
  referringCaseManager: string;
  caseManagerEmail: string;
  caseManagerPhone: string;
}

export default function PartnerPortal() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing partner ID cookie on component mount
  useEffect(() => {
    console.log("PartnerPortal: Checking for saved partner ID cookie...");
    const savedPartnerId = getPartnerIdCookie();
    console.log("PartnerPortal: Cookie check result:", savedPartnerId);
    if (savedPartnerId) {
      console.log("PartnerPortal: Found saved partner ID in cookie:", savedPartnerId);
      setPartnerId(savedPartnerId);
      // Auto-lookup the partner if we have a saved ID
      handleLookup(savedPartnerId);
    } else {
      console.log("PartnerPortal: No saved partner ID found");
    }
  }, []);

  const handlePartnerFound = (foundPartner: Partner) => {
    setPartner(foundPartner);
    setShowSuccess(false);
    setError(null);
    // Set cookie when partner is found
    setPartnerIdCookie(foundPartner.id);
  };

  const handlePartnerNotFound = () => {
    setPartner(null);
  };

  const handleRequestSubmitted = () => {
    setShowSuccess(true);
    setPartner(null);
    setPartnerId("");
    // Clear cookie when request is submitted
    clearPartnerIdCookie();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleClearForm = () => {
    setPartner(null);
    setPartnerId("");
    setError(null);
    // Clear cookie when form is cleared
    clearPartnerIdCookie();
  };

  const handleLookup = async (id?: string) => {
    const lookupId = id || partnerId;
    if (lookupId.length !== 4) {
      setError("Please enter a 4-digit partner ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPartner(null);

    try {
      const response = await fetch(`/api/partners/${lookupId}`);
      if (!response.ok) {
        throw new Error("Partner not found");
      }
      const data = await response.json();
      handlePartnerFound(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Partner not found");
      handlePartnerNotFound();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && partnerId.length === 4) {
      handleLookup();
    }
  };

  const handleLookupClick = () => {
    handleLookup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Handshake className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Partner Request Portal</h1>
                <p className="text-sm text-gray-600">Streamlined partner management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Current User</span>
              </div>
              <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Partner Management System
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Partners & Submit
            <span className="text-blue-600"> Requests</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a partner ID to retrieve information and submit service requests efficiently
          </p>
        </div>

        {/* Partner Lookup */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <Search className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Partner Lookup</h3>
              <p className="text-gray-600">Enter a 4-digit partner ID to get started</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter Partner ID (e.g., 1234)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg"
                maxLength={4}
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center font-semibold"
              onClick={handleLookupClick}
              disabled={isLoading || partnerId.length !== 4}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Look Up Partner
                </>
              )}
            </button>
            <button 
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center font-semibold"
              onClick={handleClearForm}
              disabled={isLoading}
            >
              Clear
            </button>
          </div>
          
          {error && (
            <div className="mt-4 flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Partner Info */}
        {partner && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Partner Found!</h3>
                <p className="text-gray-600">Partner information retrieved successfully</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <Building2 className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">Partner Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{partner.partnerName}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-purple-800 font-medium">Referring Case Manager</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{partner.referringCaseManager}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <Mail className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Email Address</span>
                </div>
                <p className="text-sm font-medium text-gray-900 break-all">{partner.caseManagerEmail}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-orange-800 font-medium">Phone Number</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{partner.caseManagerPhone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Request Form */}
        {partner && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <RequestForm
              partner={partner}
              onRequestSubmitted={handleRequestSubmitted}
              onClearForm={handleClearForm}
            />
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Request Submitted!</h3>
                <p className="text-sm opacity-90 mt-1">
                  Your request has been submitted successfully. You'll receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
