import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Settings, Users, FileText, Plus, Edit, Trash2, ArrowLeft, Shield } from 'lucide-react';

// Define interfaces
interface Partner {
  id: string;
  partnerName: string;
  referringCaseManager: string;
  caseManagerEmail: string;
  caseManagerPhone: string;
}

interface Request {
  id: string;
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
  createdAt: string;
}

interface PartnerFormData {
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

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<Request | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Partners query
  const { data: partners = [], refetch: refetchPartners } = useQuery({
    queryKey: ['partners', password],
    queryFn: async () => {
      const response = await fetch('/api/admin/partners', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch partners');
      return response.json();
    },
    enabled: isAuthenticated && password.length > 0,
    refetchOnMount: true,
  });

  // Requests query
  const { data: requests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['requests', password],
    queryFn: async () => {
      const response = await fetch('/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
    enabled: isAuthenticated && password.length > 0,
    refetchOnMount: true,
  });

  // Partner mutations
  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      const response = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create partner');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', password] });
      setShowPartnerDialog(false);
      toast({
        title: "Success",
        description: "Partner created successfully",
      });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PartnerFormData }) => {
      const response = await fetch(`/api/admin/partners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update partner');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', password] });
      setShowPartnerDialog(false);
      setEditingPartner(null);
      toast({
        title: "Success",
        description: "Partner updated successfully",
      });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/partners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete partner');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', password] });
      setDeletingPartner(null);
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      });
    },
  });

  // Request mutations
  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', password] });
      setShowRequestDialog(false);
      toast({
        title: "Success",
        description: "Request created successfully",
      });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RequestFormData }) => {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', password] });
      setShowRequestDialog(false);
      setEditingRequest(null);
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete request');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', password] });
      setDeletingRequest(null);
      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
    },
  });

  const handleLogin = () => {
    if (password === 'scooby') {
      setIsAuthenticated(true);
      queryClient.removeQueries();
      refetchPartners();
      refetchRequests();
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    queryClient.removeQueries();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-gray-600">Enter password to access admin panel</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600 text-lg">Manage partners and requests</p>
            </div>
            <div className="flex gap-4">
              <a href="/" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portal
              </a>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <Users className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Partners</p>
                    <p className="text-3xl font-bold text-gray-900">{partners.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partners Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  <CardTitle className="text-2xl">Partners</CardTitle>
                </div>
                <Button onClick={() => setShowPartnerDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Partner Name</TableHead>
                      <TableHead>Referring Case Manager</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner: Partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-mono">{partner.id}</TableCell>
                        <TableCell className="font-medium">{partner.partnerName}</TableCell>
                        <TableCell>{partner.referringCaseManager}</TableCell>
                        <TableCell>{partner.caseManagerEmail}</TableCell>
                        <TableCell>{partner.caseManagerPhone}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPartner(partner);
                                setShowPartnerDialog(true);
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeletingPartner(partner)}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Partner</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete partner {partner.partnerName}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <Button
                                    variant="destructive"
                                    onClick={() => deletePartnerMutation.mutate(partner.id)}
                                    disabled={deletePartnerMutation.isPending}
                                  >
                                    {deletePartnerMutation.isPending ? "Deleting..." : "Delete"}
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Requests Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-green-600" />
                  <CardTitle className="text-2xl">Requests</CardTitle>
                </div>
                <Button onClick={() => setShowRequestDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request: Request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono">{request.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.partnerName}</p>
                            <p className="text-sm text-gray-500">ID: {request.partnerId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.recipientsName}</p>
                            <p className="text-sm text-gray-500">{request.recipientsEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.urgency === 'urgent' ? 'destructive' : 'default'}>
                            {request.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{request.descriptionOfNeed}</TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRequest(request);
                                setShowRequestDialog(true);
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeletingRequest(request)}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this request? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <Button
                                    variant="destructive"
                                    onClick={() => deleteRequestMutation.mutate(request.id)}
                                    disabled={deleteRequestMutation.isPending}
                                  >
                                    {deleteRequestMutation.isPending ? "Deleting..." : "Delete"}
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Partner Dialog */}
          <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPartner ? 'Edit Partner' : 'Add Partner'}
                </DialogTitle>
              </DialogHeader>
              <PartnerForm
                partner={editingPartner}
                onSubmit={(data) => {
                  if (editingPartner) {
                    updatePartnerMutation.mutate({ id: editingPartner.id, data });
                  } else {
                    createPartnerMutation.mutate(data);
                  }
                }}
                onCancel={() => {
                  setShowPartnerDialog(false);
                  setEditingPartner(null);
                }}
                isLoading={createPartnerMutation.isPending || updatePartnerMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          {/* Request Dialog */}
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRequest ? 'Edit Request' : 'Add Request'}
                </DialogTitle>
              </DialogHeader>
              <RequestForm
                request={editingRequest}
                partners={partners}
                onSubmit={(data) => {
                  if (editingRequest) {
                    updateRequestMutation.mutate({ id: editingRequest.id, data });
                  } else {
                    createRequestMutation.mutate(data);
                  }
                }}
                onCancel={() => {
                  setShowRequestDialog(false);
                  setEditingRequest(null);
                }}
                isLoading={createRequestMutation.isPending || updateRequestMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

// Partner Form Component
function PartnerForm({ 
  partner, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  partner: Partner | null; 
  onSubmit: (data: PartnerFormData) => void; 
  onCancel: () => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState<PartnerFormData>({
    partnerName: partner?.partnerName || '',
    referringCaseManager: partner?.referringCaseManager || '',
    caseManagerEmail: partner?.caseManagerEmail || '',
    caseManagerPhone: partner?.caseManagerPhone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="partnerName">Partner Name</Label>
        <Input
          id="partnerName"
          value={formData.partnerName}
          onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="referringCaseManager">Referring Case Manager</Label>
        <Input
          id="referringCaseManager"
          value={formData.referringCaseManager}
          onChange={(e) => setFormData({ ...formData, referringCaseManager: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="caseManagerEmail">Case Manager's Email</Label>
        <Input
          id="caseManagerEmail"
          type="email"
          value={formData.caseManagerEmail}
          onChange={(e) => setFormData({ ...formData, caseManagerEmail: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="caseManagerPhone">Case Manager's Phone</Label>
        <Input
          id="caseManagerPhone"
          value={formData.caseManagerPhone}
          onChange={(e) => setFormData({ ...formData, caseManagerPhone: e.target.value })}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (partner ? 'Update' : 'Create')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Request Form Component
function RequestForm({ 
  request, 
  partners, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  request: Request | null; 
  partners: Partner[]; 
  onSubmit: (data: RequestFormData) => void; 
  onCancel: () => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState<RequestFormData>({
    partnerId: request?.partnerId || '',
    partnerName: request?.partnerName || '',
    referringCaseManager: request?.referringCaseManager || '',
    caseManagerEmail: request?.caseManagerEmail || '',
    caseManagerPhone: request?.caseManagerPhone || '',
    preferredContact: request?.preferredContact || '',
    urgency: request?.urgency || '',
    description: request?.description || '',
    // New recipient fields
    recipientsName: request?.recipientsName || '',
    recipientsAddress: request?.recipientsAddress || '',
    recipientsEmail: request?.recipientsEmail || '',
    recipientsPhone: request?.recipientsPhone || '',
    descriptionOfNeed: request?.descriptionOfNeed || '',
  });

  const handlePartnerChange = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      setFormData({
        ...formData,
        partnerId: partner.id,
        partnerName: partner.partnerName,
        referringCaseManager: partner.referringCaseManager,
        caseManagerEmail: partner.caseManagerEmail,
        caseManagerPhone: partner.caseManagerPhone,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partnerId">Partner</Label>
          <Select value={formData.partnerId} onValueChange={handlePartnerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select partner" />
            </SelectTrigger>
            <SelectContent>
              {partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.partnerName} ({partner.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="partnerName">Partner Name</Label>
          <Input
            id="partnerName"
            value={formData.partnerName}
            onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Recipient Information Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientsName">Recipient's Name</Label>
            <Input
              id="recipientsName"
              value={formData.recipientsName}
              onChange={(e) => setFormData({ ...formData, recipientsName: e.target.value })}
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
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="recipientsPhone">Recipient's Phone</Label>
            <Input
              id="recipientsPhone"
              value={formData.recipientsPhone}
              onChange={(e) => setFormData({ ...formData, recipientsPhone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="recipientsAddress">Recipient's Address</Label>
            <Input
              id="recipientsAddress"
              value={formData.recipientsAddress}
              onChange={(e) => setFormData({ ...formData, recipientsAddress: e.target.value })}
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
            required
            placeholder="Describe what the recipient needs..."
          />
        </div>
      </div>

      {/* Request Details Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Request Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="referringCaseManager">Referring Case Manager</Label>
            <Input
              id="referringCaseManager"
              value={formData.referringCaseManager}
              onChange={(e) => setFormData({ ...formData, referringCaseManager: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="caseManagerEmail">Case Manager's Email</Label>
            <Input
              id="caseManagerEmail"
              type="email"
              value={formData.caseManagerEmail}
              onChange={(e) => setFormData({ ...formData, caseManagerEmail: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="caseManagerPhone">Case Manager's Phone</Label>
            <Input
              id="caseManagerPhone"
              value={formData.caseManagerPhone}
              onChange={(e) => setFormData({ ...formData, caseManagerPhone: e.target.value })}
              required
            />
          </div>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (request ? 'Update' : 'Create')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
