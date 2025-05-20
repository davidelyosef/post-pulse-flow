
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Linkedin } from "lucide-react";

interface LinkedInAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinkedInAuthDialog = ({ isOpen, onOpenChange }: LinkedInAuthDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-linkedin-blue" />
            Connect to LinkedIn
          </DialogTitle>
          <DialogDescription>
            Please complete the authentication process in the popup window.
            If no popup appears, please check your browser's popup settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6">
          <div className="animate-pulse mb-4">
            <Linkedin className="h-12 w-12 text-linkedin-blue" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            A popup window has been opened to complete the authentication.
            Please follow the instructions in the popup.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInAuthDialog;
