import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';

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
  const { toast } = useToast();
  const [formData, setFormData] = useState<RequestFormData>({
    partnerId: partner.id,
    partnerName: partner.partnerName,
    referringCaseManager: partner.referringCaseManager,
    caseManagerEmail: partner.caseManagerEmail,
    caseManagerPhone: partner.caseManagerPhone,
    preferredContact: '',
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
    
    const requiredFields = [
      'description', 'urgency', 'preferredContact',
      'recipientsName', 'recipientsAddress', 'recipientsEmail', 'recipientsPhone', 'descriptionOfNeed'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof RequestFormData]) {
        toast({ title: 'Missing field', description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, variant: 'destructive' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit request');
      }

      await response.json().catch(() => ({}));
      toast({ title: 'Success', description: 'Request submitted successfully' });
      onRequestSubmitted();
      setFormData({
        ...formData,
        preferredContact: '',
        urgency: '',
        description: '',
        recipientsName: '',
        recipientsAddress: '',
        recipientsEmail: '',
        recipientsPhone: '',
        descriptionOfNeed: '',
      });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-white/20 bg-white/5 backdrop-blur-xl text-white">
      <CardHeader>
        <CardTitle>Submit Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredContact">Preferred Contact</Label>
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

          <div>
            <Label htmlFor="description">Request Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientsName">Recipient's Name</Label>
              <Input id="recipientsName" value={formData.recipientsName} onChange={(e) => setFormData({ ...formData, recipientsName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="recipientsEmail">Recipient's Email</Label>
              <Input id="recipientsEmail" type="email" value={formData.recipientsEmail} onChange={(e) => setFormData({ ...formData, recipientsEmail: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="recipientsPhone">Recipient's Phone</Label>
              <Input id="recipientsPhone" value={formData.recipientsPhone} onChange={(e) => setFormData({ ...formData, recipientsPhone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="recipientsAddress">Recipient's Address</Label>
              <Input id="recipientsAddress" value={formData.recipientsAddress} onChange={(e) => setFormData({ ...formData, recipientsAddress: e.target.value })} />
            </div>
          </div>

          <div>
            <Label htmlFor="descriptionOfNeed">Description of Need</Label>
            <Textarea id="descriptionOfNeed" value={formData.descriptionOfNeed} onChange={(e) => setFormData({ ...formData, descriptionOfNeed: e.target.value })} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Request'}</Button>
            <Button type="button" variant="outline" onClick={onClearForm}>Clear</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}