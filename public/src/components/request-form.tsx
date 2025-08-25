import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Partner {
  id: string;
  partnerName: string;
  referringCaseManager: string;
  caseManagerEmail: string;
  caseManagerPhone: string;
}

interface RequestFormData {
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

interface RequestFormProps {
  partner: Partner;
  onRequestSubmitted: () => void;
  onClearForm: () => void;
}

export default function RequestForm({ partner, onRequestSubmitted, onClearForm }: RequestFormProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    partnerId: partner.id,
    partnerName: partner.partnerName,
    referringCaseManager: partner.referringCaseManager,
    caseManagerEmail: partner.caseManagerEmail,
    caseManagerPhone: partner.caseManagerPhone,
    preferredContact: '',
    requestType: '',
    urgency: '',
    description: '',
    // New recipient fields
    recipientsName: '',
    recipientsAddress: '',
    recipientsEmail: '',
    recipientsPhone: '',
    descriptionOfNeed: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      'requestType', 'description', 'urgency', 'preferredContact',
      'recipientsName', 'recipientsAddress', 'recipientsEmail', 'recipientsPhone', 'descriptionOfNeed'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof RequestFormData]) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit request');
      }

      const result = await response.json();
      console.log("Request submitted successfully:", result);

      // Clear form
      setFormData({
        ...formData,
        preferredContact: '',
        requestType: '',
        urgency: '',
        description: '',
        recipientsName: '',
        recipientsAddress: '',
        recipientsEmail: '',
        recipientsPhone: '',
        descriptionOfNeed: '',
      });

      onRequestSubmitted();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert('Error submitting request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      ...formData,
      preferredContact: '',
      requestType: '',
      urgency: '',
      description: '',
      recipientsName: '',
      recipientsAddress: '',
      recipientsEmail: '',
      recipientsPhone: '',
      descriptionOfNeed: '',
    });
    onClearForm();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Submit Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Details Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requestType">Request Type</Label>
                <Select value={formData.requestType} onValueChange={(value) => setFormData({ ...formData, requestType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please describe your request..."
                required
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <Select value={formData.preferredContact} onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recipient Information Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientsName">Recipient's Name</Label>
                <Input
                  id="recipientsName"
                  value={formData.recipientsName}
                  onChange={(e) => setFormData({ ...formData, recipientsName: e.target.value })}
                  placeholder="Enter recipient's full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="recipientsEmail">Recipient's Email</Label>
                <Input
                  id="recipientsEmail"
                  type="email"
                  value={formData.recipientsEmail}
                  onChange={(e) => setFormData({ ...formData, recipientsEmail: e.target.value })}
                  placeholder="Enter recipient's email address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="recipientsPhone">Recipient's Phone</Label>
                <Input
                  id="recipientsPhone"
                  value={formData.recipientsPhone}
                  onChange={(e) => setFormData({ ...formData, recipientsPhone: e.target.value })}
                  placeholder="Enter recipient's phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="recipientsAddress">Recipient's Address</Label>
                <Input
                  id="recipientsAddress"
                  value={formData.recipientsAddress}
                  onChange={(e) => setFormData({ ...formData, recipientsAddress: e.target.value })}
                  placeholder="Enter recipient's address"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="descriptionOfNeed">Description of Need</Label>
              <Textarea
                id="descriptionOfNeed"
                value={formData.descriptionOfNeed}
                onChange={(e) => setFormData({ ...formData, descriptionOfNeed: e.target.value })}
                placeholder="Describe what the recipient needs..."
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClearForm}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}