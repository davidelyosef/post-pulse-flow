
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
  console.log('LinkedInAuthDialog state:', { isOpen });
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('LinkedInAuthDialog onOpenChange:', { open });
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-linkedin-blue" />
            Connect to LinkedIn
          </DialogTitle>
          <DialogDescription>
            Please complete the authentication process to connect your LinkedIn account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6">
          <div className="animate-pulse mb-4">
            <Linkedin className="h-12 w-12 text-linkedin-blue" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            A popup window has been opened for LinkedIn authentication.
            Please follow the instructions in the popup window.
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            If no popup appears, please check your browser's popup settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInAuthDialog;
