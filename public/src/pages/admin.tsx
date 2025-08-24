import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Eye, Lock, Unlock, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Partner {
  id: string;
  referring_case_manager: string;
  case_manager_email: string;
  case_manager_phone: string;
}

interface Request {
  id: string;
  partner_id: string;
  referring_case_manager: string;
  case_manager_email: string;
  case_manager_phone: string;
  preferred_contact: string;
  request_type: string;
  urgency: string;
  description: string;
  created_at: string;
}

interface PartnerFormData {
  id: string;
  referring_case_manager: string;
  case_manager_email: string;
  case_manager_phone: string;
}

interface RequestFormData {
  partner_id: string;
  referring_case_manager: string;
  case_manager_email: string;
  case_manager_phone: string;
  preferred_contact: string;
  request_type: string;
  urgency: string;
  description: string;
}

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [partnerForm, setPartnerForm] = useState<PartnerFormData>({
    id: "",
    referring_case_manager: "",
    case_manager_email: "",
    case_manager_phone: "",
  });
  const [requestForm, setRequestForm] = useState<RequestFormData>({
    partner_id: "",
    referring_case_manager: "",
    case_manager_email: "",
    case_manager_phone: "",
    preferred_contact: "",
    request_type: "",
    urgency: "",
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Clear any existing admin queries when component mounts
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["admin-partners"] });
    queryClient.removeQueries({ queryKey: ["admin-requests"] });
  }, [queryClient]);

  // Monitor authentication state changes
  useEffect(() => {
    console.log("Auth state changed - isAuthenticated:", isAuthenticated, "password:", password);
    if (isAuthenticated && password.length > 0) {
      console.log("Should fetch data now");
    }
  }, [isAuthenticated, password]);

  // Fetch partners
  const { data: partners = [], isLoading: partnersLoading, refetch: refetchPartners } = useQuery({
    queryKey: ["admin-partners", password],
    queryFn: async () => {
      console.log("Fetching partners with password:", password);
      const response = await fetch("/api/admin/partners", {
        headers: {
          "Authorization": `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch partners");
      const data = await response.json();
      console.log("Partners data received:", data);
      return data;
    },
    enabled: isAuthenticated && password.length > 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Fetch requests
  const { data: requests = [], isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ["admin-requests", password],
    queryFn: async () => {
      console.log("Fetching requests with password:", password);
      const response = await fetch("/api/admin/requests", {
        headers: {
          "Authorization": `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      console.log("Requests data received:", data);
      return data;
    },
    enabled: isAuthenticated && password.length > 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Partner mutations
  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      const response = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create partner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners", password] });
      toast({ title: "Success", description: "Partner created successfully" });
      setShowPartnerDialog(false);
      setPartnerForm({ id: "", referring_case_manager: "", case_manager_email: "", case_manager_phone: "" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      const response = await fetch(`/api/admin/partners/${data.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update partner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners", password] });
      toast({ title: "Success", description: "Partner updated successfully" });
      setShowPartnerDialog(false);
      setEditingPartner(null);
      setPartnerForm({ id: "", referring_case_manager: "", case_manager_email: "", case_manager_phone: "" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/partners/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete partner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners", password] });
      queryClient.invalidateQueries({ queryKey: ["admin-requests", password] });
      toast({ title: "Success", description: "Partner deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Request mutations
  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests", password] });
      toast({ title: "Success", description: "Request created successfully" });
      setShowRequestDialog(false);
      setRequestForm({
        partner_id: "",
        referring_case_manager: "",
        email: "",
        phone: "",
        preferred_contact: "",
        request_type: "",
        urgency: "",
        description: "",
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData & { id: string }) => {
      const response = await fetch(`/api/admin/requests/${data.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests", password] });
      toast({ title: "Success", description: "Request updated successfully" });
      setShowRequestDialog(false);
      setEditingRequest(null);
      setRequestForm({
        partner_id: "",
        referring_case_manager: "",
        email: "",
        phone: "",
        preferred_contact: "",
        request_type: "",
        urgency: "",
        description: "",
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${password}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete request");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests", password] });
      toast({ title: "Success", description: "Request deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogin = () => {
    if (password === "scooby") {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      toast({ title: "Success", description: "Login successful" });
      // Clear cache and force fresh fetch
      queryClient.removeQueries({ queryKey: ["admin-partners"] });
      queryClient.removeQueries({ queryKey: ["admin-requests"] });
      // Trigger refetch of data after successful login
      setTimeout(() => {
        refetchPartners();
        refetchRequests();
      }, 100);
    } else {
      toast({ title: "Error", description: "Incorrect password", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowPasswordDialog(true);
    setPassword("");
  };

  const openPartnerDialog = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setPartnerForm({
        id: partner.id,
        referring_case_manager: partner.referring_case_manager,
        case_manager_email: partner.case_manager_email,
        case_manager_phone: partner.case_manager_phone,
      });
    } else {
      setEditingPartner(null);
      setPartnerForm({ id: "", full_name: "", email: "", phone: "" });
    }
    setShowPartnerDialog(true);
  };

  const openRequestDialog = (request?: Request) => {
    if (request) {
      setEditingRequest(request);
      setRequestForm({
        partner_id: request.partner_id,
        referring_case_manager: request.referring_case_manager,
        case_manager_email: request.case_manager_email,
        case_manager_phone: request.case_manager_phone,
        preferred_contact: request.preferred_contact,
        request_type: request.request_type,
        urgency: request.urgency,
        description: request.description,
      });
    } else {
      setEditingRequest(null);
      setRequestForm({
        partner_id: "",
        full_name: "",
        email: "",
        phone: "",
        preferred_contact: "",
        request_type: "",
        urgency: "",
        description: "",
      });
    }
    setShowRequestDialog(true);
  };

  const handlePartnerSubmit = () => {
    if (editingPartner) {
      updatePartnerMutation.mutate(partnerForm);
    } else {
      createPartnerMutation.mutate(partnerForm);
    }
  };

  const handleRequestSubmit = () => {
    if (editingRequest) {
      updateRequestMutation.mutate({ ...requestForm, id: editingRequest.id });
    } else {
      createRequestMutation.mutate(requestForm);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter password to access database management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter password"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
            <p className="text-gray-600">Manage partners and requests in the database</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              <Home className="mr-1 w-4 h-4" />
              Partner Portal
            </Link>
            <Button onClick={handleLogout} variant="outline">
              <Unlock className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Partners</CardTitle>
                    <CardDescription>Manage partner information in the database</CardDescription>
                  </div>
                  <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openPartnerDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Partner
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingPartner ? "Edit Partner" : "Add Partner"}</DialogTitle>
                        <DialogDescription>
                          {editingPartner ? "Update partner information" : "Add a new partner to the database"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="partner-id">Partner ID</Label>
                          <Input
                            id="partner-id"
                            value={partnerForm.id}
                            onChange={(e) => setPartnerForm({ ...partnerForm, id: e.target.value })}
                            placeholder="0000"
                            maxLength={4}
                            disabled={!!editingPartner}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partner-name">Referring Case Manager</Label>
                          <Input
                            id="partner-name"
                            value={partnerForm.referring_case_manager}
                            onChange={(e) => setPartnerForm({ ...partnerForm, referring_case_manager: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partner-email">Case Manager's Email</Label>
                          <Input
                            id="partner-email"
                            type="email"
                            value={partnerForm.case_manager_email}
                            onChange={(e) => setPartnerForm({ ...partnerForm, case_manager_email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partner-phone">Case Manager's Phone</Label>
                          <Input
                            id="partner-phone"
                            value={partnerForm.case_manager_phone}
                            onChange={(e) => setPartnerForm({ ...partnerForm, case_manager_phone: e.target.value })}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPartnerDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handlePartnerSubmit} disabled={createPartnerMutation.isPending || updatePartnerMutation.isPending}>
                          {createPartnerMutation.isPending || updatePartnerMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          {editingPartner ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {partnersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Referring Case Manager</TableHead>
                        <TableHead>Case Manager's Email</TableHead>
                        <TableHead>Case Manager's Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner: Partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-mono">{partner.id}</TableCell>
                          <TableCell>{partner.referring_case_manager}</TableCell>
                          <TableCell>{partner.case_manager_email}</TableCell>
                          <TableCell>{partner.case_manager_phone}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPartnerDialog(partner)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Partner</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete partner {partner.id}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <Button
                                      onClick={() => deletePartnerMutation.mutate(partner.id)}
                                      variant="destructive"
                                      disabled={deletePartnerMutation.isPending}
                                    >
                                      {deletePartnerMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : null}
                                      Delete
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Requests</CardTitle>
                    <CardDescription>Manage partner requests in the database</CardDescription>
                  </div>
                  <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openRequestDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingRequest ? "Edit Request" : "Add Request"}</DialogTitle>
                        <DialogDescription>
                          {editingRequest ? "Update request information" : "Add a new request to the database"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="request-partner-id">Partner ID</Label>
                          <Select
                            value={requestForm.partner_id}
                            onValueChange={(value) => setRequestForm({ ...requestForm, partner_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select partner" />
                            </SelectTrigger>
                            <SelectContent>
                              {partners.map((partner: Partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.id} - {partner.referring_case_manager}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="request-name">Referring Case Manager</Label>
                            <Input
                              id="request-name"
                              value={requestForm.referring_case_manager}
                              onChange={(e) => setRequestForm({ ...requestForm, referring_case_manager: e.target.value })}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="request-email">Case Manager's Email</Label>
                            <Input
                              id="request-email"
                              type="email"
                              value={requestForm.case_manager_email}
                              onChange={(e) => setRequestForm({ ...requestForm, case_manager_email: e.target.value })}
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="request-phone">Case Manager's Phone</Label>
                            <Input
                              id="request-phone"
                              value={requestForm.case_manager_phone}
                              onChange={(e) => setRequestForm({ ...requestForm, case_manager_phone: e.target.value })}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="request-contact">Preferred Contact</Label>
                            <Select
                              value={requestForm.preferred_contact}
                              onValueChange={(value) => setRequestForm({ ...requestForm, preferred_contact: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="request-type">Request Type</Label>
                            <Select
                              value={requestForm.request_type}
                              onValueChange={(value) => setRequestForm({ ...requestForm, request_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select request type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technical">Technical Support</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="account">Account Management</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="request-urgency">Urgency</Label>
                            <Select
                              value={requestForm.urgency}
                              onValueChange={(value) => setRequestForm({ ...requestForm, urgency: value })}
                            >
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
                        <div className="space-y-2">
                          <Label htmlFor="request-description">Description</Label>
                          <Textarea
                            id="request-description"
                            value={requestForm.description}
                            onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                            placeholder="Describe the request..."
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleRequestSubmit} disabled={createRequestMutation.isPending || updateRequestMutation.isPending}>
                          {createRequestMutation.isPending || updateRequestMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          {editingRequest ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Referring Case Manager</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request: Request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono text-xs">{request.id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-mono">{request.partner_id}</TableCell>
                          <TableCell>{request.referring_case_manager}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.request_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.urgency === "urgent" ? "destructive" :
                                request.urgency === "high" ? "default" :
                                request.urgency === "medium" ? "secondary" : "outline"
                              }
                            >
                              {request.urgency}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRequestDialog(request)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
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
                                      onClick={() => deleteRequestMutation.mutate(request.id)}
                                      variant="destructive"
                                      disabled={deleteRequestMutation.isPending}
                                    >
                                      {deleteRequestMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : null}
                                      Delete
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
