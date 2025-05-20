
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
        
        <div className="flex flex-col items-center justify-center p-0">
          <iframe 
            src="https://linkedai-backend.vercel.app/api/auth/linkedin"
            className="w-full h-[400px] border-0 rounded-md"
            title="LinkedIn Authentication"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInAuthDialog;
