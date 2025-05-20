
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Calendar } from "lucide-react";

interface PostCardActionsProps {
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onSchedule: () => void;
  showActions: boolean;
}

export const PostCardActions = ({ 
  onApprove, 
  onReject, 
  onEdit, 
  onSchedule, 
  showActions 
}: PostCardActionsProps) => {
  if (!showActions) return null;
  
  return (
    <div className="flex justify-between pt-4">
      <Button 
        size="lg" 
        variant="outline" 
        className="rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0" 
        onClick={onReject}
        aria-label="Reject post"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
      </Button>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full" 
          onClick={onEdit}
          aria-label="Edit post"
        >
          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full" 
          onClick={onSchedule}
          aria-label="Schedule post"
        >
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
      <Button 
        size="lg" 
        variant="outline" 
        className="rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0" 
        onClick={onApprove}
        aria-label="Approve post"
      >
        <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
      </Button>
    </div>
  );
};
