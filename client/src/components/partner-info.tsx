import { CheckCircle } from "lucide-react";
import type { Partner } from "@shared/schema";

interface PartnerInfoProps {
  partner: Partner;
}

export default function PartnerInfo({ partner }: PartnerInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8" data-testid="partner-info-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Partner Information</h3>
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Full Name
          </label>
          <p className="text-sm font-medium text-gray-900" data-testid="text-partner-name">
            {partner.fullName}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Email Address
          </label>
          <p className="text-sm text-gray-700" data-testid="text-partner-email">
            {partner.email}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Phone Number
          </label>
          <p className="text-sm text-gray-700" data-testid="text-partner-phone">
            {partner.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
