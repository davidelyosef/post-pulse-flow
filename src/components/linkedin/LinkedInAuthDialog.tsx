
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LinkedInAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinkedInAuthDialog = ({ isOpen, onOpenChange }: LinkedInAuthDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden" size="large">
        <iframe 
          src="https://linkedai-backend.vercel.app/api/auth/linkedin" 
          className="w-full h-[80vh] border-none" 
          title="LinkedIn Authentication"
        />
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInAuthDialog;
