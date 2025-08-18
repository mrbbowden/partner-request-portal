import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, ClipboardList, NotebookPen, CloudUpload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Partner } from "@shared/schema";

const requestFormSchema = z.object({
  partnerId: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  preferredContact: z.string().min(1, "Preferred contact method is required"),
  requestType: z.string().min(1, "Request type is required"),
  urgency: z.string().min(1, "Urgency level is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  partner: Partner;
  onRequestSubmitted: () => void;
  onClearForm?: () => void;
}

export default function RequestForm({ partner, onRequestSubmitted, onClearForm }: RequestFormProps) {
  const { toast } = useToast();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      partnerId: partner.id,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone,
      preferredContact: "email",
      requestType: "",
      urgency: "",
      description: "",
    },
  });

  const submitRequest = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your request has been submitted successfully.",
      });
      onRequestSubmitted();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormData) => {
    submitRequest.mutate(data);
  };

  const handleClearForm = () => {
    form.reset({
      partnerId: partner.id,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone,
      preferredContact: "email",
      requestType: "",
      urgency: "",
      description: "",
    });
    // Call the parent callback to clear partner information
    if (onClearForm) {
      onClearForm();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="request-form-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Request</h3>
        <p className="text-sm text-gray-600">
          Fill out the form below to submit your request. Your partner information has been pre-filled.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50" readOnly data-testid="input-full-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="bg-gray-50" readOnly data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="bg-gray-50" readOnly data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-preferred-contact">
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="either">Either</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Request Details Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <ClipboardList className="w-4 h-4 mr-2 text-gray-400" />
              Request Details
            </h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Request Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-request-type">
                          <SelectValue placeholder="Select a request type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technical_support">Technical Support</SelectItem>
                        <SelectItem value="account_changes">Account Changes</SelectItem>
                        <SelectItem value="billing_inquiry">Billing Inquiry</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Urgency Level <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-3"
                        data-testid="radio-urgency"
                      >
                        <div className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="low" id="low" className="text-blue-600 mr-2" />
                          <div>
                            <Label htmlFor="low" className="text-sm font-medium text-gray-900 cursor-pointer">Low</Label>
                            <div className="text-xs text-gray-500">5-7 days</div>
                          </div>
                        </div>
                        <div className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="medium" id="medium" className="text-blue-600 mr-2" />
                          <div>
                            <Label htmlFor="medium" className="text-sm font-medium text-gray-900 cursor-pointer">Medium</Label>
                            <div className="text-xs text-gray-500">2-3 days</div>
                          </div>
                        </div>
                        <div className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="high" id="high" className="text-blue-600 mr-2" />
                          <div>
                            <Label htmlFor="high" className="text-sm font-medium text-gray-900 cursor-pointer">High</Label>
                            <div className="text-xs text-gray-500">Same day</div>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Request Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Please provide a detailed description of your request..."
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">Minimum 20 characters required</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <CloudUpload className="text-gray-400 text-2xl w-8 h-8 mx-auto" />
                    <div className="flex text-sm text-gray-600">
                      <Label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload files</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                      </Label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-500 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              All fields marked with <span className="text-red-500 ml-1">*</span> are required
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                data-testid="button-clear-form"
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={submitRequest.isPending}
                data-testid="button-submit"
              >
                <NotebookPen className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}