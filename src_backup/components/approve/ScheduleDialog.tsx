
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: Date) => void;
}

export const ScheduleDialog = ({ isOpen, onClose, onSave }: ScheduleDialogProps) => {
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);

  // Reset date when dialog opens
  useEffect(() => {
    if (isOpen) {
      setScheduleDate(new Date());
    }
  }, [isOpen]);

  const handleSave = () => {
    if (scheduleDate) {
      onSave(scheduleDate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>
            Choose when to publish this post on LinkedIn.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduleDate ? format(scheduleDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={scheduleDate}
                onSelect={setScheduleDate}
                initialFocus
                className="overflow-hidden max-w-full"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!scheduleDate}>
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
