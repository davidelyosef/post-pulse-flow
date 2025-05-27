
import { Button } from "@/components/ui/button";
import { Edit, Calendar } from "lucide-react";

interface PostCardActionsProps {
  onEdit: () => void;
  onSchedule: () => void;
  showActions: boolean;
  showEditAndScheduleActions?: boolean;
}

export const PostCardActions = ({ 
  onEdit, 
  onSchedule, 
  showActions,
  showEditAndScheduleActions = true
}: PostCardActionsProps) => {
  if (!showActions || !showEditAndScheduleActions) return null;
  
  return (
    <div className="flex justify-center gap-2 pt-4 w-full">
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
  );
};
