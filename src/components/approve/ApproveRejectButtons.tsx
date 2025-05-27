
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ApproveRejectButtonsProps {
  onApprove: () => void;
  onReject: () => void;
}

export const ApproveRejectButtons = ({ 
  onApprove, 
  onReject 
}: ApproveRejectButtonsProps) => {
  return (
    <div className="flex justify-between pt-6 w-full max-w-md mx-auto">
      <Button 
        size="lg" 
        variant="outline" 
        className="rounded-full w-16 h-16 p-0 border-2 hover:bg-red-50 hover:border-red-300" 
        onClick={onReject}
        aria-label="Reject post"
      >
        <X className="h-8 w-8 text-red-500" />
      </Button>
      
      <Button 
        size="lg" 
        variant="outline" 
        className="rounded-full w-16 h-16 p-0 border-2 hover:bg-green-50 hover:border-green-300" 
        onClick={onApprove}
        aria-label="Approve post"
      >
        <Check className="h-8 w-8 text-green-500" />
      </Button>
    </div>
  );
};
