/**
 * Email Quote Modal Component
 * 
 * Modal dialog for sending calculated quotes via email with:
 * - Recipient email input
 * - Sender name input
 * - Custom message textarea
 * - Quote details display
 * - SendGrid email integration
 * 
 * Features:
 * - Form validation and error handling
 * - Loading states during email sending
 * - Success/error toast notifications
 * - Responsive design
 * - Auto-populated quote details
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteData: any;
}

export function EmailQuoteModal({ isOpen, onClose, quoteData }: EmailQuoteModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail || !senderName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await apiRequest('POST', '/api/send-quote', {
        recipientEmail,
        senderName,
        message,
        quoteData,
      });

      toast({
        title: "Success",
        description: "Quote sent successfully!",
      });

      // Reset form and close modal
      setRecipientEmail("");
      setSenderName("");
      setMessage("");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-slide-up" data-testid="modal-email-quote">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            <span className="hidden sm:inline">Send Quote via Email</span>
            <span className="sm:hidden">Send Quote</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="recipientEmail" className="block text-sm font-medium text-foreground mb-2">
              Recipient Email *
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="client@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              data-testid="input-recipient-email"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="senderName" className="block text-sm font-medium text-foreground mb-2">
              Your Name *
            </Label>
            <Input
              id="senderName"
              type="text"
              placeholder="Your Name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
              data-testid="input-sender-name"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Additional notes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-24 resize-none"
              data-testid="textarea-message"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1 w-full sm:w-auto"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 w-full sm:w-auto"
              disabled={isLoading}
              data-testid="button-send-email"
            >
              {isLoading ? "Sending..." : "Send Quote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
