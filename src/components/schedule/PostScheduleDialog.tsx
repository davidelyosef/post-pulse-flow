
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

interface PostScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledDate: Date | undefined;
  scheduledTime: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onSave: () => void;
  onRemoveSchedule?: () => void;
  isScheduled?: boolean;
}

export const PostScheduleDialog = ({
  isOpen,
  onClose,
  scheduledDate,
  scheduledTime,
  onDateChange,
  onTimeChange,
  onSave,
  onRemoveSchedule,
  isScheduled = false,
}: PostScheduleDialogProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>Set when you want this post to be published on LinkedIn.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Select Date</p>
            <Calendar 
              mode="single"
              selected={scheduledDate}
              onSelect={onDateChange}
              initialFocus
              disabled={(date) => date < today}
              className="rounded-md border mx-auto"
            />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Select Time</p>
            <Input 
              type="time"
              value={scheduledTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isScheduled && onRemoveSchedule && (
            <Button variant="destructive" onClick={onRemoveSchedule}>
              Remove Schedule
            </Button>
          )}
          <Button onClick={onSave}>
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
